#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname, resolve } from 'path';

const SEARCH_ROOTS = (process.env.SEARCH_ROOTS || process.env.KAI_ROOT || '.')
  .split(',')
  .map(r => resolve(r.trim()));
const EXCLUDE_DIRS = new Set(['.git', 'node_modules']);

// --- BM25 ---

class BM25 {
  constructor(k1 = 1.5, b = 0.75) {
    this.k1 = k1;
    this.b = b;
    this.docs = [];
    this.termFreqs = [];
    this.docFreqs = new Map();
  }

  tokenize(text) {
    return text.toLowerCase().match(/\w+/g) || [];
  }

  add(doc) {
    const tokens = this.tokenize(doc.text);
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    this.termFreqs.push(tf);
    this.docs.push(doc);
    for (const t of tf.keys()) this.docFreqs.set(t, (this.docFreqs.get(t) || 0) + 1);
  }

  search(query, topK = 5) {
    const N = this.docs.length;
    if (N === 0) return [];

    const avgdl = this.termFreqs.reduce((s, tf) => {
      return s + [...tf.values()].reduce((a, b) => a + b, 0);
    }, 0) / N;

    const terms = this.tokenize(query);

    const scores = this.docs.map((doc, i) => {
      const tf = this.termFreqs[i];
      const dl = [...tf.values()].reduce((a, b) => a + b, 0);
      let score = 0;
      for (const t of terms) {
        const df = this.docFreqs.get(t) || 0;
        if (df === 0) continue;
        const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
        const freq = tf.get(t) || 0;
        score += idf * (freq * (this.k1 + 1)) / (freq + this.k1 * (1 - this.b + this.b * dl / avgdl));
      }
      return { doc, score };
    });

    return scores
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(r => ({ ...r.doc, score: Math.round(r.score * 1000) / 1000 }));
  }
}

// --- Chunker ---

function scanFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (EXCLUDE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...scanFiles(full));
    else if (extname(entry) === '.md') files.push({ path: full, mtime: stat.mtimeMs });
  }
  return files;
}

function chunkMarkdown(filePath) {
  const lines = readFileSync(filePath, 'utf-8').split('\n');
  const chunks = [];
  let section = 'top';
  let start = 0;
  let buffer = [];

  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,3} /.test(lines[i])) {
      if (buffer.length > 0) {
        chunks.push({ file: filePath, section, startLine: start, endLine: i - 1, text: buffer.join('\n') });
      }
      section = lines[i].replace(/^#+\s*/, '').trim();
      start = i;
      buffer = [lines[i]];
    } else {
      buffer.push(lines[i]);
    }
  }
  if (buffer.length > 0) {
    chunks.push({ file: filePath, section, startLine: start, endLine: lines.length - 1, text: buffer.join('\n') });
  }
  return chunks;
}

// --- Index ---

class KaiIndex {
  constructor(roots) {
    this.roots = roots;
    this.engine = null;
    this.mtimes = new Map();
  }

  allFiles() {
    return this.roots.flatMap(r => scanFiles(r));
  }

  needsRebuild() {
    const files = this.allFiles();
    if (files.length !== this.mtimes.size) return true;
    return files.some(f => this.mtimes.get(f.path) !== f.mtime);
  }

  build() {
    const files = this.allFiles();
    const engine = new BM25();
    for (const f of files) {
      this.mtimes.set(f.path, f.mtime);
      for (const chunk of chunkMarkdown(f.path)) engine.add(chunk);
    }
    this.engine = engine;
  }

  rootFor(filePath) {
    return this.roots.find(r => filePath.startsWith(r)) || this.roots[0];
  }

  search(query, topK = 5) {
    if (!this.engine || this.needsRebuild()) this.build();
    return this.engine.search(query, topK).map(r => ({
      file: relative(this.rootFor(r.file), r.file),
      section: r.section,
      lines: `${r.startLine + 1}–${r.endLine + 1}`,
      score: r.score,
      content: r.text.slice(0, 500)
    }));
  }
}

// --- MCP Server ---

const index = new KaiIndex(SEARCH_ROOTS);

const server = new Server(
  { name: 'kai-search', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'search_files',
    description: 'Search kAI project files by keyword. Returns relevant sections with file path and line numbers. Use this before loading a full file to find exactly where content lives.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keyword or phrase to search for' },
        top_k: { type: 'integer', description: 'Number of results to return (default 5)', default: 5 }
      },
      required: ['query']
    }
  }]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'search_files') {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }
  const { query, top_k = 5 } = request.params.arguments;
  const results = index.search(query, top_k);
  return {
    content: [{
      type: 'text',
      text: results.length === 0
        ? 'No results found.'
        : JSON.stringify(results, null, 2)
    }]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);

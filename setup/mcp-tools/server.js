#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
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

// --- Section Tools ---

function resolveFilePath(filePath) {
  if (/^[A-Za-z]:/.test(filePath) || filePath.startsWith('/')) return filePath;
  return join(SEARCH_ROOTS[0], filePath);
}

function getSection(filePath, sectionName) {
  const resolved = resolveFilePath(filePath);
  let raw;
  try { raw = readFileSync(resolved, 'utf-8'); }
  catch { return { error: `File not found: ${filePath}` }; }

  const lines = raw.split('\n');
  const startIdx = lines.findIndex(l => l.startsWith(`## ${sectionName}`));
  if (startIdx === -1) return { error: `Section "## ${sectionName}" not found in ${filePath}` };

  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^#{1,3} /.test(lines[i])) { endIdx = i; break; }
  }

  return {
    file: filePath,
    section: sectionName,
    startLine: startIdx + 1,
    endLine: endIdx,
    content: lines.slice(startIdx, endIdx).join('\n')
  };
}

function updateSection(filePath, sectionName, newContent) {
  const resolved = resolveFilePath(filePath);
  let raw;
  try { raw = readFileSync(resolved, 'utf-8'); }
  catch { return { success: false, error: `File not found: ${filePath}` }; }

  const lines = raw.split('\n');
  const startIdx = lines.findIndex(l => l.startsWith(`## ${sectionName}`));
  if (startIdx === -1) {
    return { success: false, error: `Section "## ${sectionName}" not found in ${filePath}` };
  }

  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^#{1,3} /.test(lines[i])) { endIdx = i; break; }
  }

  const today = new Date().toISOString().slice(0, 10);
  const header = `## ${sectionName}`;
  const body = newContent.startsWith(header) ? newContent : `${header}\n${newContent}`;
  const newLines = body.split('\n');
  if (newLines[newLines.length - 1] !== '') newLines.push('');

  const before = lines.slice(0, startIdx).map(l =>
    /^last_updated:/.test(l) ? `last_updated: ${today}` : l
  );

  writeFileSync(resolved, [...before, ...newLines, ...lines.slice(endIdx)].join('\n'), 'utf-8');
  return { success: true, linesReplaced: endIdx - startIdx, newLines: newLines.length - 1 };
}

// --- MCP Server ---

const index = new KaiIndex(SEARCH_ROOTS);

const server = new Server(
  { name: 'kai-tools', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
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
    },
    {
      name: 'get_section',
      description: 'Retrieve a single named section from a kAI project file by exact ## header match. Use this instead of reading the full file when you know which section you need. Standard sections: "Active Work", "Priority Summary", "Open Questions", "Archive". Do NOT retrieve Archive in normal sessions — only when researching completed work.',
      inputSchema: {
        type: 'object',
        properties: {
          file: { type: 'string', description: 'File path relative to kAI root (e.g. "ops/status.md") or absolute' },
          section: { type: 'string', description: 'Section name matching a ## header exactly (e.g. "Active Work")' }
        },
        required: ['file', 'section']
      }
    },
    {
      name: 'update_section',
      description: 'Replace the content of a named section in a kAI project file. Automatically updates last_updated frontmatter. Section must already exist — cannot create new sections. Include the ## header line in the content parameter.',
      inputSchema: {
        type: 'object',
        properties: {
          file: { type: 'string', description: 'File path relative to kAI root (e.g. "ops/status.md") or absolute' },
          section: { type: 'string', description: 'Section name matching a ## header exactly (e.g. "Active Work")' },
          content: { type: 'string', description: 'Full new section content including the ## header line' }
        },
        required: ['file', 'section', 'content']
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'search_files') {
    const { query, top_k = 5 } = args;
    const results = index.search(query, top_k);
    return {
      content: [{
        type: 'text',
        text: results.length === 0 ? 'No results found.' : JSON.stringify(results, null, 2)
      }]
    };
  }

  if (name === 'get_section') {
    const { file, section } = args;
    const result = getSection(file, section);
    return {
      content: [{ type: 'text', text: result.error ? result.error : JSON.stringify(result, null, 2) }]
    };
  }

  if (name === 'update_section') {
    const { file, section, content } = args;
    const result = updateSection(file, section, content);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);

#!/usr/bin/env node
/**
 * sync-template.js
 * Syncs MetaTemplate files from kAI (private) → ai-project-template (public).
 *
 * Usage: node setup/sync-template.js
 *
 * Steps:
 *   1. Builds a manifest of whitelisted files from kAI
 *   2. Reads and sanitizes each file — personal content is replaced, not warned about
 *   3. Diffs sanitized content against ai-project-template — finds added, changed, deleted
 *   4. Reports what changed and what was sanitized
 *   5. Prompts for confirmation, then writes sanitized content and stages
 *   6. Prompts for commit message and optional push
 */

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const readline = require('readline');
const os = require('os');

// ── Paths ──────────────────────────────────────────────────────────────────
const KAI = path.resolve(__dirname, '..');
const PUB = path.resolve(KAI, '..', 'ai-project-template');

// ── Sync manifest ──────────────────────────────────────────────────────────
const EXPLICIT_FILES = [
  'AGENT.md',
  'CHANGELOG.md',
  'QUICKSTART.md',
  'README.md',
  '_meta/DECISIONS.md',
  '_meta/EXAMPLES.md',
  '_meta/IMPROVEMENTS.md',
  '_meta/PROCESS.md',
  '_meta/VISION.md',
  '_meta/metatemplate-what-why-how.html',
  '_meta/presentation.html',
];

const GLOB_DIRS = ['_template', 'setup'];

const EXCLUDE_PATTERNS = [
  /node_modules/,
  /package-lock\.json$/,
  /\.git\//,
  /sync-template\.js$/,  // never sync the sync script itself
];

// ── Sanitization rules — applied in order, most specific first ─────────────
// Each rule: { pattern, replacement, label }
// Pattern must be a function returning a fresh RegExp (flags with /g need reset each call).
const SANITIZE_RULES = [
  // Full name — before first-name rule
  {
    pattern: () => /Kerry Thompson/g,
    replacement: '[Your Name]',
    label: 'Full name',
  },
  // Windows path with trailing content (e.g. C:\Users\kerry\OneDrive\...)
  {
    pattern: () => /C:\\Users\\kerry\\[^\s"')>]*/gi,
    replacement: '[workspace-path]',
    label: 'Windows path',
  },
  // Unix path with trailing content
  {
    pattern: () => /\/c\/Users\/kerry\/[^\s"')>]*/gi,
    replacement: '[workspace-path]',
    label: 'Unix path',
  },
  // Bare Windows user path
  {
    pattern: () => /C:\\Users\\kerry/gi,
    replacement: '[workspace-path]',
    label: 'Windows user path',
  },
  // Bare Unix user path
  {
    pattern: () => /\/c\/Users\/kerry/gi,
    replacement: '[workspace-path]',
    label: 'Unix user path',
  },
  // GitHub username — before first-name rule so "kerry" inside it is caught here
  {
    pattern: () => /kerthomp11-ctrl/g,
    replacement: '[your-github-username]',
    label: 'GitHub username',
  },
  // First name (capitalized) — word boundary, not inside a URL or path
  {
    pattern: () => /\bKerry\b/g,
    replacement: '[Your Name]',
    label: 'First name',
  },
  // First name (lowercase) — catches incidental references
  {
    pattern: () => /\bkerry\b/g,
    replacement: '[your-name]',
    label: 'First name (lowercase)',
  },
  // Personal workstream abbreviations that have no meaning outside kAI
  {
    pattern: () => /\b(kpro|dffs|accom)\b/g,
    replacement: '[effort]',
    label: 'Personal workstream name',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function md5(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

function readFile(filePath) {
  return fs.readFileSync(filePath);  // returns Buffer
}

function isBinary(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.pdf'].includes(ext);
}

/**
 * Apply all sanitization rules to text content.
 * Returns { content: string, hits: [{ label, count }] }
 */
function sanitize(text) {
  let content = text;
  const hits = [];

  for (const { pattern, replacement, label } of SANITIZE_RULES) {
    const re = pattern();
    const matches = content.match(re);
    if (matches) {
      hits.push({ label, count: matches.length });
      content = content.replace(re, replacement);
    }
  }

  return { content, hits };
}

function walkDir(dir, baseDir = dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const testPath = fullPath.replace(/\\/g, '/') + (entry.isDirectory() ? '/' : '');
    if (EXCLUDE_PATTERNS.some(r => r.test(testPath))) continue;
    if (entry.isDirectory()) walkDir(fullPath, baseDir, results);
    else results.push(path.relative(baseDir, fullPath).replace(/\\/g, '/'));
  }
  return results;
}

function buildManifest() {
  const files = new Set(EXPLICIT_FILES);
  for (const dir of GLOB_DIRS) {
    for (const rel of walkDir(path.join(KAI, dir))) {
      files.add(`${dir}/${rel}`);
    }
  }
  return [...files];
}

function buildPublicFileList() {
  const files = [];
  for (const rel of EXPLICIT_FILES) {
    if (fs.existsSync(path.join(PUB, rel))) files.push(rel);
  }
  for (const dir of GLOB_DIRS) {
    for (const rel of walkDir(path.join(PUB, dir))) {
      files.push(`${dir}/${rel}`);
    }
  }
  return files;
}

function getPubRemote() {
  try {
    return execSync('git remote get-url origin', { cwd: PUB }).toString().trim()
      .replace(/^https:\/\/github\.com\//, 'github.com/')
      .replace(/\.git$/, '');
  } catch {
    return 'ai-project-template (remote unknown)';
  }
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

function rule(char = '─', len = 62) { return char.repeat(len); }

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${rule()}`);
  console.log('  MetaTemplate Sync');
  console.log(rule());
  console.log(`  Source : ${KAI}`);
  console.log(`  Target : ${PUB}`);
  console.log(`${rule()}\n`);

  if (!fs.existsSync(PUB)) {
    console.error(`ERROR: Public repo not found at:\n  ${PUB}\n`);
    process.exit(1);
  }

  const manifest    = buildManifest();
  const manifestSet = new Set(manifest);
  const pubFiles    = buildPublicFileList();

  // ── Phase 1: diff with sanitized content ──────────────────────────────────
  const added    = [];
  const changed  = [];
  const sanitizationReport = {};  // rel → [{ label, count }]

  // Pre-compute sanitized content for all source files
  const sanitizedContent = {};  // rel → string | Buffer

  for (const rel of manifest) {
    const src = path.join(KAI, rel);
    if (!fs.existsSync(src)) continue;

    if (isBinary(src)) {
      sanitizedContent[rel] = readFile(src);  // binary: pass through unchanged
    } else {
      const raw = fs.readFileSync(src, 'utf8');
      const { content, hits } = sanitize(raw);
      sanitizedContent[rel] = content;
      if (hits.length) sanitizationReport[rel] = hits;
    }

    // Compare sanitized source to current destination
    const dst = path.join(PUB, rel);
    const srcHash = md5(Buffer.isBuffer(sanitizedContent[rel])
      ? sanitizedContent[rel]
      : Buffer.from(sanitizedContent[rel], 'utf8'));
    const dstHash = fs.existsSync(dst)
      ? md5(fs.readFileSync(dst))
      : null;

    if (srcHash === dstHash) continue;  // already in sync

    if (!fs.existsSync(dst)) added.push(rel);
    else changed.push(rel);
  }

  // Deletions: files in PUB not in manifest and not in kAI source
  const deleted = pubFiles.filter(f =>
    !manifestSet.has(f) && !fs.existsSync(path.join(KAI, f))
  );

  const totalChanges = added.length + changed.length + deleted.length;

  if (totalChanges === 0) {
    console.log('✓ ai-project-template is already up to date.\n');
    return;
  }

  // ── Phase 2: report ───────────────────────────────────────────────────────
  if (added.length) {
    console.log(`  NEW (${added.length}):`);
    added.forEach(f => console.log(`    + ${f}`));
    console.log('');
  }
  if (changed.length) {
    console.log(`  CHANGED (${changed.length}):`);
    changed.forEach(f => console.log(`    ~ ${f}`));
    console.log('');
  }
  if (deleted.length) {
    console.log(`  DELETED (${deleted.length}):`);
    deleted.forEach(f => console.log(`    - ${f}`));
    console.log('');
  }

  // Sanitization report — what was stripped
  const sanitizedFiles = Object.keys(sanitizationReport);
  if (sanitizedFiles.length) {
    console.log(`  SANITIZED (${sanitizedFiles.length} file${sanitizedFiles.length > 1 ? 's' : ''}) — personal content replaced automatically:`);
    for (const [file, hits] of Object.entries(sanitizationReport)) {
      console.log(`    ${file}`);
      hits.forEach(({ label, count }) =>
        console.log(`      · ${label}${count > 1 ? ` (×${count})` : ''}`)
      );
    }
    console.log('');
  }

  // ── Phase 3: confirm and apply ────────────────────────────────────────────
  const confirm = await ask(`Apply ${totalChanges} change(s) to ai-project-template? [y/N] `);
  if (confirm.toLowerCase() !== 'y') {
    console.log('\nAborted.\n');
    return;
  }
  console.log('');

  // Write sanitized content to destination
  for (const rel of [...added, ...changed]) {
    const dst = path.join(PUB, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    const content = sanitizedContent[rel];
    if (Buffer.isBuffer(content)) fs.writeFileSync(dst, content);
    else fs.writeFileSync(dst, content, 'utf8');
  }

  // Remove deleted files
  for (const rel of deleted) {
    const dst = path.join(PUB, rel);
    if (fs.existsSync(dst)) fs.unlinkSync(dst);
  }

  // Stage all changes
  const allChanged = [...added, ...changed, ...deleted];
  for (const rel of allChanged) {
    execSync(`git add "${rel}"`, { cwd: PUB, stdio: 'inherit' });
  }

  const diffStat = execSync('git diff --cached --stat', { cwd: PUB }).toString().trim();
  console.log(diffStat);
  console.log('');

  // ── Phase 4: commit ───────────────────────────────────────────────────────
  const fileNames  = [...new Set(allChanged.map(f => path.basename(f)))].join(', ');
  const defaultMsg = `MetaTemplate sync: ${fileNames}`;
  const msgInput   = await ask(`Commit message (Enter for default):\n  "${defaultMsg}"\n> `);
  const commitMsg  = msgInput || defaultMsg;

  const tmpMsg = path.join(os.tmpdir(), 'kai-sync-commit-msg.txt');
  fs.writeFileSync(tmpMsg, `${commitMsg}\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`);
  execSync(`git commit -F "${tmpMsg}"`, { cwd: PUB, stdio: 'inherit' });
  fs.unlinkSync(tmpMsg);

  // ── Phase 5: push ─────────────────────────────────────────────────────────
  const remote      = getPubRemote();
  const pushConfirm = await ask(`\nPush to ${remote}? [y/N] `);
  if (pushConfirm.toLowerCase() === 'y') {
    execSync('git push', { cwd: PUB, stdio: 'inherit' });
    console.log(`\n✓ Pushed to ${remote}\n`);
  } else {
    console.log('\nCommitted locally. Run `git push` in ai-project-template when ready.\n');
  }
}

main().catch(err => {
  console.error('\nSync failed:', err.message || err);
  process.exit(1);
});

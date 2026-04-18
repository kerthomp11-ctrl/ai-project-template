#!/usr/bin/env node
/**
 * sync-template.js
 * Syncs MetaTemplate files from kAI (private) → ai-project-template (public).
 *
 * Usage: node setup/sync-template.js
 *
 * Steps:
 *   1. Builds a manifest of whitelisted files from kAI
 *   2. Diffs against ai-project-template — finds added, changed, deleted
 *   3. Runs sanitization checks on changed content
 *   4. Prompts for confirmation, then copies and stages
 *   5. Prompts for commit message and optional push
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const readline = require('readline');
const os = require('os');

// ── Paths ──────────────────────────────────────────────────────────────────
const KAI = path.resolve(__dirname, '..');
const PUB = path.resolve(KAI, '..', 'ai-project-template');

// ── Sync manifest ──────────────────────────────────────────────────────────
// Explicit files tracked by kAI whitelist .gitignore
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

// Directories synced recursively
const GLOB_DIRS = ['_template', 'setup'];

// Patterns excluded from recursive sync
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /package-lock\.json$/,
  /\.git\//,
  /sync-template\.js$/, // don't sync the sync script itself — it lives in setup/ of kAI only
];

// ── Sanitization — personal terms that should not appear in template files ─
const PERSONAL_PATTERNS = [
  { pattern: /C:\\Users\\kerry/gi,   label: 'Windows personal path (C:\\Users\\kerry)' },
  { pattern: /\/c\/Users\/kerry/gi,  label: 'Unix personal path (/c/Users/kerry)' },
  { pattern: /Kerry Thompson/g,      label: 'Full name (Kerry Thompson)' },
  { pattern: /\bkerry\b(?!.*\bkerry\b)/gi, label: 'First name (kerry) — review in context' },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function md5(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
}

function walkDir(dir, baseDir = dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    if (EXCLUDE_PATTERNS.some(r => r.test(fullPath.replace(/\\/g, '/') + (entry.isDirectory() ? '/' : '')))) continue;
    if (entry.isDirectory()) walkDir(fullPath, baseDir, results);
    else results.push(relPath);
  }
  return results;
}

function buildManifest() {
  const files = new Set(EXPLICIT_FILES);
  for (const dir of GLOB_DIRS) {
    const srcDir = path.join(KAI, dir);
    for (const rel of walkDir(srcDir)) {
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
    const pubDir = path.join(PUB, dir);
    for (const rel of walkDir(pubDir)) {
      files.push(`${dir}/${rel}`);
    }
  }
  return files;
}

function sanitizationWarnings(content) {
  const found = [];
  for (const { pattern, label } of PERSONAL_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) found.push(label);
  }
  return found;
}

function isBinary(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.pdf'].includes(ext);
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

  // Build file lists
  const manifest = buildManifest();
  const manifestSet = new Set(manifest);
  const pubFiles = buildPublicFileList();

  const added = [];
  const changed = [];
  const sanitizationIssues = {};

  // Detect added and changed
  for (const rel of manifest) {
    const src = path.join(KAI, rel);
    const dst = path.join(PUB, rel);

    if (!fs.existsSync(src)) continue; // whitelisted but doesn't exist yet — skip

    if (md5(src) === md5(dst)) continue; // identical

    const isNew = !fs.existsSync(dst);
    if (isNew) added.push(rel);
    else changed.push(rel);

    // Sanitization check (text files only)
    if (!isBinary(src)) {
      const content = fs.readFileSync(src, 'utf8');
      const w = sanitizationWarnings(content);
      if (w.length) sanitizationIssues[rel] = w;
    }
  }

  // Detect deletions: files in PUB that are no longer in kAI manifest
  const deleted = pubFiles.filter(f => {
    if (manifestSet.has(f)) return false; // still in manifest
    if (!fs.existsSync(path.join(KAI, f))) return true; // removed from kAI source
    return false;
  });

  const totalChanges = added.length + changed.length + deleted.length;

  if (totalChanges === 0) {
    console.log('✓ ai-project-template is already up to date.\n');
    return;
  }

  // Report changes
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

  // Sanitization warnings
  const warnCount = Object.keys(sanitizationIssues).length;
  if (warnCount > 0) {
    console.log(`  ⚠  SANITIZATION WARNINGS (${warnCount} file${warnCount > 1 ? 's' : ''}) — review before pushing:`);
    for (const [file, issues] of Object.entries(sanitizationIssues)) {
      console.log(`     ${file}`);
      issues.forEach(i => console.log(`       · ${i}`));
    }
    console.log('');
    const proceed = await ask('  Personal content detected. Proceed anyway? [y/N] ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('\nAborted. Fix the flagged content and re-run.\n');
      return;
    }
    console.log('');
  }

  // Confirm apply
  const confirm = await ask(`Apply ${totalChanges} change(s) to ai-project-template? [y/N] `);
  if (confirm.toLowerCase() !== 'y') {
    console.log('\nAborted.\n');
    return;
  }
  console.log('');

  // Apply: copy added + changed
  for (const rel of [...added, ...changed]) {
    const src = path.join(KAI, rel);
    const dst = path.join(PUB, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }

  // Apply: remove deleted
  for (const rel of deleted) {
    const dst = path.join(PUB, rel);
    if (fs.existsSync(dst)) fs.unlinkSync(dst);
  }

  // Stage all changes in ai-project-template
  const allChanged = [...added, ...changed, ...deleted];
  for (const rel of allChanged) {
    execSync(`git add "${rel}"`, { cwd: PUB, stdio: 'inherit' });
  }

  // Show staged stat
  const diffStat = execSync('git diff --cached --stat', { cwd: PUB }).toString().trim();
  console.log(diffStat);
  console.log('');

  // Commit message
  const fileNames = [...new Set(allChanged.map(f => path.basename(f)))].join(', ');
  const defaultMsg = `MetaTemplate sync: ${fileNames}`;
  const msgInput = await ask(`Commit message (Enter for default):\n  "${defaultMsg}"\n> `);
  const commitMsg = msgInput || defaultMsg;

  // Write commit message to temp file (handles special characters safely)
  const tmpMsg = path.join(os.tmpdir(), 'kai-sync-commit-msg.txt');
  fs.writeFileSync(tmpMsg, `${commitMsg}\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`);
  execSync(`git commit -F "${tmpMsg}"`, { cwd: PUB, stdio: 'inherit' });
  fs.unlinkSync(tmpMsg);

  // Push prompt
  console.log('');
  const pushConfirm = await ask('Push to github.com/kerthomp11-ctrl/ai-project-template? [y/N] ');
  if (pushConfirm.toLowerCase() === 'y') {
    execSync('git push', { cwd: PUB, stdio: 'inherit' });
    console.log('\n✓ Pushed to github.com/kerthomp11-ctrl/ai-project-template\n');
  } else {
    console.log('\nCommitted locally. Run `git push` in ai-project-template when ready.\n');
  }
}

main().catch(err => {
  console.error('\nSync failed:', err.message || err);
  process.exit(1);
});

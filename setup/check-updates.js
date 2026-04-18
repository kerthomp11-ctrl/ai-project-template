#!/usr/bin/env node
/**
 * check-updates.js
 * Checks which MetaTemplate versions haven't been applied to this workspace.
 * Presents AI Integration prompts in order so you can paste them to your AI.
 *
 * Usage:  node setup/check-updates.js
 *
 * Steps:
 *   1. Reads CHANGELOG.md to extract all versions + AI Integration prompts
 *   2. Detects current workspace version (from .kai-version or feature detection)
 *   3. Lists unapplied versions and their change summaries
 *   4. Walks through each one — shows the AI Integration prompt, waits for confirmation
 *   5. Writes .kai-version when all updates are marked applied
 */

const fs   = require('fs');
const path = require('path');
const readline = require('readline');

// ── Paths ──────────────────────────────────────────────────────────────────
const WORKSPACE  = path.resolve(__dirname, '..');
const CHANGELOG  = path.join(WORKSPACE, 'CHANGELOG.md');
const VERSION_FILE = path.join(WORKSPACE, '.kai-version');

// ── Feature detection — used when .kai-version doesn't exist ───────────────
// Listed highest → lowest. First match wins.
const FEATURE_CHECKS = [
  {
    version: '1.5',
    label: 'MCP section tools + Archive pattern',
    detect: () =>
      exists('setup/mcp-tools/server.js') ||
      fileContains('_template/status.md', '## Archive'),
  },
  {
    version: '1.4',
    label: 'kai-tools MCP server + VISION.md',
    detect: () =>
      exists('_meta/VISION.md') ||
      exists('setup/mcp-tools') ||
      exists('setup/mcp-search'),
  },
  {
    version: '1.3',
    label: 'Copilot support + IMPROVEMENTS.md',
    detect: () =>
      exists('_meta/IMPROVEMENTS.md') ||
      exists('_template/.github/copilot-instructions.md'),
  },
  {
    version: '1.2',
    label: 'Setup scripts + /open[Workstream] skill templates',
    detect: () =>
      exists('_template/commands') ||
      exists('setup/setup-mac.sh') ||
      exists('setup/setup-windows.ps1'),
  },
  {
    version: '1.1',
    label: 'Persona system + DECISIONS.md',
    detect: () =>
      exists('_meta/PERSONAS.md') ||
      exists('_meta/DECISIONS.md'),
  },
  {
    version: '1.0',
    label: 'Initial release',
    detect: () => exists('AGENT.md'),
  },
];

function exists(rel) {
  return fs.existsSync(path.join(WORKSPACE, rel));
}

function fileContains(rel, str) {
  const full = path.join(WORKSPACE, rel);
  if (!fs.existsSync(full)) return false;
  return fs.readFileSync(full, 'utf8').includes(str);
}

// ── CHANGELOG parser ───────────────────────────────────────────────────────
// Extracts an array of: { version, date, summary[], aiPrompt }
function parseChangelog() {
  if (!fs.existsSync(CHANGELOG)) {
    console.error(`ERROR: CHANGELOG.md not found at ${CHANGELOG}`);
    console.error('Pull the latest MetaTemplate files and try again.');
    process.exit(1);
  }

  const text = fs.readFileSync(CHANGELOG, 'utf8');
  const versions = [];

  // Split on version headers: ## [X.Y] — YYYY-MM-DD
  const versionRegex = /^## \[(\d+\.\d+)\] — (\d{4}-\d{2}-\d{2})/m;
  const blocks = text.split(/^(?=## \[\d+\.\d+\])/m).filter(b => versionRegex.test(b));

  for (const block of blocks) {
    const headerMatch = block.match(/^## \[(\d+\.\d+)\] — (\d{4}-\d{2}-\d{2})/);
    if (!headerMatch) continue;

    const version = headerMatch[1];
    const date    = headerMatch[2];

    // Extract bullet points from Added/Changed sections as summary
    const summary = [];
    const addedMatch   = block.match(/### Added\n([\s\S]*?)(?=###|---|\n## |$)/);
    const changedMatch = block.match(/### Changed\n([\s\S]*?)(?=###|---|\n## |$)/);
    for (const section of [addedMatch, changedMatch]) {
      if (!section) continue;
      const bullets = section[1].match(/^- \*\*(.+?)\*\*/gm) || [];
      bullets.forEach(b => summary.push(b.replace(/^- \*\*/, '').replace(/\*\*.*/, '').trim()));
    }

    // Extract the fenced code block inside ### AI Integration
    let aiPrompt = null;
    const aiMatch = block.match(/### AI Integration[\s\S]*?```\n([\s\S]*?)```/);
    if (aiMatch) aiPrompt = aiMatch[1].trim();

    versions.push({ version, date, summary, aiPrompt });
  }

  // Sort highest version first
  versions.sort((a, b) => compareVersions(b.version, a.version));
  return versions;
}

// ── Version utilities ──────────────────────────────────────────────────────
function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function detectVersion() {
  for (const { version, detect } of FEATURE_CHECKS) {
    if (detect()) return { version, detected: true };
  }
  return { version: '1.0', detected: true };
}

function readVersionFile() {
  if (!fs.existsSync(VERSION_FILE)) return null;
  return fs.readFileSync(VERSION_FILE, 'utf8').trim();
}

function writeVersionFile(version) {
  fs.writeFileSync(VERSION_FILE, version + '\n');
}

// ── Prompt helper ──────────────────────────────────────────────────────────
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim().toLowerCase()); }));
}

function rule(char = '─', len = 62) { return char.repeat(len); }

function printBox(label, content) {
  console.log(`\n  ┌─ ${label} ${'─'.repeat(Math.max(0, 55 - label.length))}┐`);
  const lines = content.split('\n');
  lines.forEach(l => console.log(`  │ ${l}`));
  console.log(`  └${'─'.repeat(58)}┘\n`);
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${rule()}`);
  console.log('  MetaTemplate Update Checker');
  console.log(rule());

  // 1. Parse changelog
  const allVersions = parseChangelog();
  const latestVersion = allVersions[0]?.version || '1.0';

  // 2. Determine current version
  const fromFile = readVersionFile();
  let currentVersion;
  let versionSource;

  if (fromFile) {
    currentVersion = fromFile;
    versionSource  = `.kai-version file`;
  } else {
    const { version } = detectVersion();
    currentVersion = version;
    versionSource  = `feature detection (no .kai-version file found)`;
  }

  console.log(`\n  Current version : ${currentVersion}  (via ${versionSource})`);
  console.log(`  Latest version  : ${latestVersion}`);

  // 3. Filter to unapplied versions (newer than current)
  const unapplied = allVersions.filter(v => compareVersions(v.version, currentVersion) > 0);

  if (unapplied.length === 0) {
    console.log(`\n  ✓ You're up to date. Nothing to apply.\n`);
    // Write version file if it was missing
    if (!fromFile) {
      writeVersionFile(currentVersion);
      console.log(`  Created .kai-version (${currentVersion})\n`);
    }
    return;
  }

  // Show unapplied versions
  console.log(`\n  ${unapplied.length} version(s) to apply:\n`);
  unapplied.slice().reverse().forEach(({ version, date, summary }) => {
    console.log(`  [${version}]  ${date}`);
    summary.slice(0, 3).forEach(s => console.log(`    · ${s}`));
    if (summary.length > 3) console.log(`    · ...and ${summary.length - 3} more`);
    console.log('');
  });

  const startConfirm = await ask(`  Walk through updates now? [y/N] `);
  if (startConfirm !== 'y') {
    console.log('\n  Exited. Run again when ready.\n');
    return;
  }

  // 4. Walk through each unapplied version (oldest first)
  const toApply = unapplied.slice().reverse();
  let lastApplied = currentVersion;

  for (let i = 0; i < toApply.length; i++) {
    const { version, date, summary, aiPrompt } = toApply[i];

    console.log(`\n${rule('═')}`);
    console.log(`  Version ${version}  —  ${date}  (${i + 1} of ${toApply.length})`);
    console.log(rule('═'));

    // Summary
    if (summary.length) {
      console.log('\n  What changed:');
      summary.forEach(s => console.log(`    · ${s}`));
    }

    // AI Integration prompt
    if (aiPrompt) {
      console.log('');
      const showPrompt = await ask('  Show AI Integration prompt? [y/N] ');
      if (showPrompt === 'y') {
        printBox('Paste this to your AI', aiPrompt);
        console.log('  ↑ Copy everything between the box lines and paste it to your AI.');
        console.log('  Your AI will apply the structural changes and report back.\n');
      }
    } else {
      console.log('\n  (No AI Integration prompt for this version — changes are structural/file-based only.)');
    }

    // Upgrade guide reference
    console.log(`  For manual steps, see: CHANGELOG.md → [${version}] → Upgrade Guide\n`);

    const applied = await ask(`  Mark v${version} as applied? [y/N] `);
    if (applied === 'y') {
      lastApplied = version;
      writeVersionFile(lastApplied);
      console.log(`  ✓ Marked as applied. .kai-version → ${lastApplied}`);
    } else {
      const skip = await ask(`  Skip for now and continue? [y/N] `);
      if (skip !== 'y') {
        console.log(`\n  Stopped at v${version}. Run again to resume.\n`);
        return;
      }
      console.log('  Skipped.');
    }
  }

  // 5. Done
  console.log(`\n${rule()}`);
  if (lastApplied === latestVersion) {
    console.log(`  ✓ All updates applied. You're on v${latestVersion}.\n`);
  } else {
    console.log(`  Done for now. Applied through v${lastApplied}.`);
    console.log(`  Run again to apply remaining versions.\n`);
  }
}

main().catch(err => {
  console.error('\nError:', err.message || err);
  process.exit(1);
});

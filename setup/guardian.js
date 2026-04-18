#!/usr/bin/env node
/**
 * guardian.js — PreToolUse hook for Claude Code
 * Blocks Edit/Write tool calls targeting protected files.
 * Protected files are managed externally (e.g. web Claude) and must never be
 * edited by Kai — changes would be silently overwritten on next external sync.
 */

const PROTECTED = [
  'kAI2026/health_context.md',
  'kAI2026/daily_protocol.md',
];

let raw = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { raw += chunk; });
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0); // can't parse — allow through
  }

  const filePath = (input?.tool_input?.file_path || '').replace(/\\/g, '/');

  const blocked = PROTECTED.find(p => filePath.includes(p));
  if (blocked) {
    console.log(
      `BLOCKED — ${blocked} is read-only for Kai.\n` +
      `This file is managed by web Claude and synced via OneDrive.\n` +
      `Edits here will be silently overwritten. Write to health/health_notes.md instead.`
    );
    process.exit(2); // exit 2 = block + show message to user
  }

  process.exit(0);
});

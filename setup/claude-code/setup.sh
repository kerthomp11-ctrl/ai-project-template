#!/usr/bin/env bash
# MetaTemplate workspace setup — Claude Code
# After setup, run 'claude' in your workspace folder and type /setup.
# Claude Code will prompt for your API key on first run.

set -e

# ── Locate template root ──────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# ── Workspace location ────────────────────────────────────────────────────────
DEFAULT_PATH="$HOME/kAI"
echo ""
echo "Where would you like to create your workspace?"
read -rp "Press Enter for default [$DEFAULT_PATH]: " USER_INPUT
WORKSPACE="${USER_INPUT:-$DEFAULT_PATH}"

# ── Create workspace structure ────────────────────────────────────────────────
echo ""
echo "Creating workspace at: $WORKSPACE"

mkdir -p "$WORKSPACE/_template/commands"
mkdir -p "$WORKSPACE/_meta"
mkdir -p "$WORKSPACE/.claude/commands"

# ── Copy root files ───────────────────────────────────────────────────────────
cp "$TEMPLATE_ROOT/AGENT.md"              "$WORKSPACE/AGENT.md"
cp "$TEMPLATE_ROOT/AGENT.md"              "$WORKSPACE/CLAUDE.md"  # Claude Code auto-loads CLAUDE.md
cp "$TEMPLATE_ROOT/_template/SESSION.md"  "$WORKSPACE/SESSION.md"
cp "$TEMPLATE_ROOT/_template/CONTEXT.md"  "$WORKSPACE/CONTEXT.md"

# ── Copy _template folder ─────────────────────────────────────────────────────
cp "$TEMPLATE_ROOT/_template/project_plan.md"    "$WORKSPACE/_template/project_plan.md"
cp "$TEMPLATE_ROOT/_template/status.md"          "$WORKSPACE/_template/status.md"
cp "$TEMPLATE_ROOT/_template/completed.md"       "$WORKSPACE/_template/completed.md"
cp "$TEMPLATE_ROOT/_template/TRIGGERS.md"        "$WORKSPACE/_template/TRIGGERS.md"
cp "$TEMPLATE_ROOT/_template/PERSONAS.md"        "$WORKSPACE/_template/PERSONAS.md"
cp "$TEMPLATE_ROOT/_template/commands/open.md"   "$WORKSPACE/_template/commands/open.md"
cp "$TEMPLATE_ROOT/_template/commands/close.md"  "$WORKSPACE/_template/commands/close.md"
cp "$TEMPLATE_ROOT/_template/commands/setup.md"  "$WORKSPACE/_template/commands/setup.md"

# ── Copy _meta folder ─────────────────────────────────────────────────────────
cp "$TEMPLATE_ROOT/_meta/DECISIONS.md"    "$WORKSPACE/_meta/DECISIONS.md"
cp "$TEMPLATE_ROOT/_meta/PROCESS.md"      "$WORKSPACE/_meta/PROCESS.md"
cp "$TEMPLATE_ROOT/_meta/IMPROVEMENTS.md" "$WORKSPACE/_meta/IMPROVEMENTS.md"
cp "$TEMPLATE_ROOT/_meta/EXAMPLES.md"     "$WORKSPACE/_meta/EXAMPLES.md"

# ── Copy Claude Code commands ─────────────────────────────────────────────────
cp "$TEMPLATE_ROOT/_template/commands/open.md"   "$WORKSPACE/.claude/commands/open.md"
cp "$TEMPLATE_ROOT/_template/commands/close.md"  "$WORKSPACE/.claude/commands/close.md"
cp "$TEMPLATE_ROOT/_template/commands/setup.md"  "$WORKSPACE/.claude/commands/setup.md"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "Workspace created successfully."
echo ""
echo "Structure:"
echo "  $WORKSPACE/"
echo "  ├── AGENT.md         (AI session instructions)"
echo "  ├── CLAUDE.md        (Claude Code auto-loads this)"
echo "  ├── SESSION.md       (fill in your efforts)"
echo "  ├── CONTEXT.md       (fill in who you are)"
echo "  ├── _template/       (blank files for new efforts)"
echo "  ├── _meta/           (process docs)"
echo "  └── .claude/commands/ (open, close, setup)"
echo ""
echo "Next steps:"
echo "  1. cd $WORKSPACE"
echo "  2. claude"
echo "  3. /setup"
echo ""
echo "Claude Code will prompt for your Anthropic API key on first run."
echo ""

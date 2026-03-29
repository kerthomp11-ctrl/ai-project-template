#!/usr/bin/env bash
# MetaTemplate workspace setup — generic (any AI tool)
# After setup, open AGENT.md in your AI tool and say "let's start".

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

# ── Copy root files ───────────────────────────────────────────────────────────
cp "$TEMPLATE_ROOT/AGENT.md"              "$WORKSPACE/AGENT.md"
cp "$TEMPLATE_ROOT/_template/SESSION.md"  "$WORKSPACE/SESSION.md"
cp "$TEMPLATE_ROOT/_template/CONTEXT.md"  "$WORKSPACE/CONTEXT.md"

# ── Copy _template folder ─────────────────────────────────────────────────────
cp "$TEMPLATE_ROOT/_template/project_plan.md"    "$WORKSPACE/_template/project_plan.md"
cp "$TEMPLATE_ROOT/_template/status.md"          "$WORKSPACE/_template/status.md"
cp "$TEMPLATE_ROOT/_template/completed.md"       "$WORKSPACE/_template/completed.md"
cp "$TEMPLATE_ROOT/_template/TRIGGERS.md"        "$WORKSPACE/_template/TRIGGERS.md"
cp "$TEMPLATE_ROOT/_template/PERSONAS.md"        "$WORKSPACE/_template/PERSONAS.md"

# ── Copy _meta folder ─────────────────────────────────────────────────────────
cp "$TEMPLATE_ROOT/_meta/DECISIONS.md"    "$WORKSPACE/_meta/DECISIONS.md"
cp "$TEMPLATE_ROOT/_meta/PROCESS.md"      "$WORKSPACE/_meta/PROCESS.md"
cp "$TEMPLATE_ROOT/_meta/IMPROVEMENTS.md" "$WORKSPACE/_meta/IMPROVEMENTS.md"
cp "$TEMPLATE_ROOT/_meta/EXAMPLES.md"     "$WORKSPACE/_meta/EXAMPLES.md"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "Workspace created successfully."
echo ""
echo "Structure:"
echo "  $WORKSPACE/"
echo "  ├── AGENT.md         (AI session instructions)"
echo "  ├── SESSION.md       (fill in your efforts)"
echo "  ├── CONTEXT.md       (fill in who you are)"
echo "  ├── _template/       (blank files for new efforts)"
echo "  └── _meta/           (process docs)"
echo ""
echo "Next steps:"
echo "  1. Open $WORKSPACE in your editor"
echo "  2. Load AGENT.md in your AI tool"
echo "  3. Say: let's start"
echo ""

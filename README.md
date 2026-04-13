# MetaTemplate

A lightweight, file-based framework for working with AI on anything — projects, daily tracking, goals, or long-horizon work. Works with Claude Code, GitHub Copilot, M365 Copilot, or any AI with file access.

## What This Is

A small set of markdown files that give your AI assistant persistent context across sessions. Instead of re-explaining your work every time you open a chat, the AI reads a few files and picks up where you left off.

Works for any kind of effort: home improvement, software development, health tracking, daily task management, research, business planning — anything you want to work on consistently with AI assistance.

## How It Works

- `SESSION.md` — the AI reads this at the start of every session to orient itself
- `CONTEXT.md` — static background about you; loaded on demand, not every session
- `[effort]/project_plan.md` — stable goals and reference data for a project
- `[effort]/status.md` — current state: priorities, deadlines, what's active
- The AI updates `status.md` as you work, so the next session starts with accurate context

## Getting Started

**1. Fork or download this repo**

Click **Use this template** on GitHub, or download as a ZIP.

**2. Run the setup script for your AI tool**

| AI Tool | Windows | Linux / Mac |
|---|---|---|
| Claude Code | `setup\claude-code\setup.ps1` | `setup/claude-code/setup.sh` |
| GitHub Copilot (VS Code) | `setup\github-copilot\setup.ps1` | `setup/github-copilot/setup.sh` |
| Any other AI | `setup\generic\setup.ps1` | `setup/generic/setup.sh` |

**Windows:** Right-click the `.ps1` file → **Run with PowerShell** (as Administrator for best results)
**Linux/Mac:** `chmod +x setup/claude-code/setup.sh && ./setup/claude-code/setup.sh`

The script creates your workspace folder, copies all template files, and tells you exactly what to do next.

**3. Follow the next-steps printed by the script**

For Claude Code: run `claude` in your workspace folder, then type `/setup` — the AI will ask you a few questions and build your workspace files automatically.

See **[QUICKSTART.md](QUICKSTART.md)** for full details on all environments.

---

## Repository Structure

```
├── AGENT.md              ← AI session instructions
├── QUICKSTART.md         ← Full setup guide
├── .mcp.json             ← MCP server config (Claude Code search — auto-loaded)
├── setup/                ← Run one of these to set up your workspace
│   ├── claude-code/      ← setup.ps1 (Windows) + setup.sh (Linux/Mac)
│   ├── github-copilot/   ← setup.ps1 + setup.sh
│   ├── generic/          ← setup.ps1 + setup.sh
│   └── mcp-search/       ← BM25 keyword search MCP server (Claude Code only)
├── _template/            ← Blank files copied into your workspace by the script
│   ├── project_plan.md
│   ├── status.md
│   ├── completed.md
│   ├── TRIGGERS.md       ← Keyword→file map (optional)
│   ├── PERSONAS.md       ← AI response modes per workstream (optional)
│   └── commands/         ← Session commands for Claude Code
└── _meta/                ← Process docs and design decisions
```

## Search (Claude Code)

The template includes a built-in BM25 keyword search server (`setup/mcp-search/`) that lets Claude search your workspace files without loading everything into context.

**To activate:**
```
cd setup/mcp-search
npm install
```

Then restart Claude Code. The server is pre-registered in `.mcp.json` — no additional config needed. Claude will use it automatically to find relevant sections before loading full files.

---

## Philosophy

- **Minimal setup** — one project name and a description is enough to start
- **AI-agnostic** — plain markdown files work with any AI tool
- **Persistent context** — the AI stays oriented across sessions without re-explaining
- **Evolves with use** — the template improves as you use it; `_meta/IMPROVEMENTS.md` captures lessons as they happen

## License

MIT

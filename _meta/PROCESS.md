---
type: process-guide
last_updated: 2026-03-27
---

# Project Setup Process

A repeatable guide for spinning up a new AI-assisted project in the kAI system.

---

## Prerequisites
- Claude Code installed and accessible via `claude` in PowerShell
- `kAI/` directory exists somewhere on your machine (location is up to you)
- `CLAUDE.md` is at the kAI root (controls Claude's session behavior)
- `_template/` contains blank `SESSION.md` and `project_plan.md`
- Git configured globally — required before first commit:
  ```
  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"
  ```

---

## Steps to Add a New Project

### 1. Create the project folder
```
kAI/[project-name]/
```

### 2. Copy templates into the new folder
```
_template/project_plan.md  →  [project-name]/project_plan.md
```

### 3. Create status.md
No template — create fresh each project. Minimum sections:
- Recently Completed
- Priority Summary (Now / Soon / Anytime / Plan Ahead)
- Supply Needs (if applicable)

### 4. Fill in project_plan.md
Replace all placeholder brackets with real content. Keep it stable — this is reference data, not active state.

### 5. Update root SESSION.md
Add the new project to the Active Projects table and update Immediate Focus if it's high priority.

### 6. Start a session
```powershell
claude
```
Claude reads `CLAUDE.md` automatically, which instructs it to load `SESSION.md` and the relevant status file.

---

## File Roles (Quick Reference)

| File | Purpose | Update frequency |
|---|---|---|
| `CLAUDE.md` | Instructs Claude how to behave in this directory | Rarely |
| `SESSION.md` | Master loader — orients Claude at session start | When projects or focus change |
| `[project]/project_plan.md` | Stable reference data for the project | Rarely |
| `[project]/status.md` | Current state — priorities, deadlines, active items | Every session |
| `_template/` | Blank files to copy for new projects | When templates improve |
| `_meta/` | Process docs, decisions, improvement log | As needed |

---

## Starting a Session
```powershell
claude
```
Then run `/kai` — Claude will:
1. Read `SESSION.md`
2. Read status files for all active projects
3. Greet with a recap of last session decisions and a suggested starting point

## Closing a Session
Run `/close` — Claude will:
1. Update `Active Work` sections in all touched status files
2. Update `Last Session Decisions` in SESSION.md
3. Update `last_updated` frontmatter in every changed file
4. Commit all changes with a session summary message
5. Push to GitHub
6. Confirm: "All files updated — ready for next session."

**Important:** Always use `/close` to end a session. Do not just close the terminal — in-progress work will not be captured.

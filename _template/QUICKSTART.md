---
type: quickstart
last_updated: 2026-03-27
---

# QuickStart Guide

Get your AI-assisted workspace running in under 15 minutes.

---

## What This Is

This is a lightweight system for working with an AI assistant across multiple sessions without losing context. Instead of re-explaining your projects every time you open a chat, your AI reads a small set of files at the start of each session and picks up where you left off.

You define your **efforts** — projects, goals, or workstreams you want to track. The AI helps you move them forward, keeps the files current, and surfaces the right things at the right time.

No coding required. Works with most AI tools.

---

## What You Need

**Required:**
- An AI tool (see [Environment Guide](#environment-guide) below for supported tools)

**Optional but recommended:**
- [Git](https://git-scm.com/) and a [GitHub](https://github.com) account — for version control and cloud backup of your workspace
- [VS Code](https://code.visualstudio.com/) — useful as a file editor alongside AI tools

---

## Setup Steps

### 1. Get the template

**Option A — GitHub (recommended):**
Click **Use this template** on the GitHub repo page to create your own copy, then clone it:
```
git clone https://github.com/[your-username]/[your-repo-name]
```

**Option B — Download:**
Download the repo as a ZIP, extract it, and rename the folder to something short (`kAI/`, `my-workspace/`, etc.).

### 2. Your root files are ready — just fill them in

The repo root already contains everything you need:

```
AGENT.md      ← AI session instructions (customize if needed)
SESSION.md    ← Add your efforts and immediate focus
CONTEXT.md    ← Describe yourself and your working preferences
```

**`CONTEXT.md`** — Fill this in once with your background, working preferences, and any context the AI should have on demand. Keep it to one page.

**`SESSION.md`** — Add your effort(s) to the Active Projects table and set your Immediate Focus. Leave Last Session Decisions blank — it fills in after your first close.

**Replace all placeholders** — search all files for `[Your Name]`, `[Project/Task/Effort Name]`, and `[YYYY-MM-DD]` and fill them in. See the Placeholder Reference at the bottom of `AGENT.md`.

### 3. Create a folder for your first effort

An effort is any project, goal, or workstream you want to track. Create a subfolder:

```
my-workspace/
  home/           ← example effort
  work-project/   ← another effort
```

Copy `_template/project_plan.md` and `_template/status.md` into each effort folder and fill them in.

**`[effort]/project_plan.md`** — Goals and background for this effort. Stable reference — you won't edit it often.

**`[effort]/status.md`** — Current priorities, deadlines, and active items. The file the AI reads most.

### 4. Load AGENT.md in your AI tool

See the [Environment Guide](#environment-guide) below for how to do this in your specific tool.

---

## How a Session Works

Every session follows the same three-step pattern:

### Open
Tell the AI to start the session. It will read your files, recap the last session's decisions, and suggest where to pick up. On your first session there are no prior decisions — the AI will skip the recap and go straight to a suggested starting point.

> "Let's start" / "Pick up where we left off" / `/open` (Claude Code)

### Work
Talk to the AI as you would normally. Ask questions, give tasks, make decisions. The AI will update your status files as things change — you don't need to maintain them manually.

### Close
Tell the AI to close the session. It will update all files and capture the session's decisions. If you have Git configured, it will also commit and push to GitHub — if not, those steps are skipped automatically.

> "Wrap up" / "Done for today" / `/close` (Claude Code)

If you use a close phrase without running the close procedure, the AI will prompt you to do it properly.

---

## Environment Guide

### Claude Code (recommended)

Claude Code is a command-line AI tool with full file access and persistent memory. It offers the smoothest experience with this system.

**Setup:**
1. Install Claude Code: `npm install -g @anthropic-ai/claude-code`
2. Duplicate `AGENT.md` and name the copy `CLAUDE.md` at your workspace root — Claude Code loads this automatically on startup
3. The `/open` and `/close` session commands are included in `.claude/commands/` — no setup needed

**Starting a session:**
```
cd my-workspace
claude
```
Then type `/open`.

**Ending a session:** Type `/close`.

**Note:** `CLAUDE.md` replaces `AGENT.md` in Claude Code — the content is the same, just renamed so Claude Code auto-loads it. Keep `AGENT.md` in your workspace for use in other tools.

---

### GitHub Copilot in VS Code

GitHub Copilot Chat can reference files you attach or open in the editor.

**Setup:**
1. Open your workspace folder in VS Code
2. Install the GitHub Copilot and GitHub Copilot Chat extensions

**Starting a session:**
1. Open the Copilot Chat panel (`Ctrl+Alt+I`, or click the Copilot Chat icon in the VS Code sidebar)
2. Attach `AGENT.md` by typing `#file:AGENT.md` in the chat, or use the paperclip icon to attach it
3. Then attach `SESSION.md` and the relevant `[effort]/status.md`
4. Type: "Let's start" — Copilot will read the attached files and open the session

**Ending a session:**
1. Type: "Wrap up"
2. Copilot will generate updated file content — copy each block and save it to the corresponding file

**Note:** File attachments do not persist between chats. Re-attach at the start of each new session.

---

### M365 Copilot Chat

M365 Copilot Chat does not have access to your local files. Context is provided by pasting file contents directly into the chat.

**Setup:** No special setup required beyond creating your workspace files.

**Starting a session:**

**Message 1** — Paste the full contents of `AGENT.md`:
```
[Paste full contents of AGENT.md here]
```

**Message 2** — Paste your session context:
```
--- SESSION CONTEXT ---
[Paste full contents of SESSION.md here]

--- ACTIVE STATUS ---
[Paste full contents of the relevant status.md here]
--- END CONTEXT ---
```

The AI will use this context for the session.

**Ending a session:**

Type "Wrap up" and then ask:
- "Give me the updated SESSION.md to copy back"
- "Give me the updated [effort]/status.md to copy back"

Copy each block and paste it back into the corresponding file on your computer.

**Tip:** Keep a plain text file called `session-starter.txt` on your desktop with the paste blocks pre-formatted. Update it after each session close so it's ready for next time.

---

## Customizing for Your Work

### Adding a new effort

1. Create a new subfolder in your workspace: `my-workspace/[effort-name]/`
2. Copy `_template/project_plan.md` and `_template/status.md` into it
3. Fill in the files
4. Add the effort to the Active Projects table in `SESSION.md`

### Adjusting AI behavior

The behavioral rules in `AGENT.md` are yours to modify. Common adjustments:
- Change the greeting format in **Session Start**
- Add or remove trigger phrases
- Adjust the close checklist steps
- Add effort-specific rules under **Behavioral Rules**

### Using CONTEXT.md

Fill this in once with background the AI should have when needed: who you are, your working preferences, relevant constraints. The AI loads it on demand — not every session — so it can be detailed without adding overhead.

### Keeping things private

If an effort contains sensitive information (health data, personal finances, etc.):
- Keep it in a separate folder outside your main workspace, or
- Add it to `.gitignore` if you're using Git so it's never pushed to GitHub

---

## Quick Reference

| Action | Claude Code | GitHub Copilot | M365 Copilot |
|---|---|---|---|
| Open session | `/open` | Attach files + "Let's start" | Paste AGENT.md + context block |
| Close session | `/close` | "Wrap up" + copy output | "Wrap up" + copy output |
| Add context | Auto via CLAUDE.md | Re-attach each session | Re-paste each session |
| Save to GitHub | Auto at `/close` | Manual git push | Manual file save |

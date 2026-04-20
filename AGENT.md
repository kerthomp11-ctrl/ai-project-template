---
type: agent-instructions
last_updated: 2026-04-18
---

# Agent Session Instructions

This file tells your AI assistant how to behave in this workspace. Load it at the start of every session.

---

## What This System Is

This is an AI-assisted project workspace. An **effort** is any project, task area, or ongoing workstream you want to track — it could be a home renovation, a work initiative, a health goal, or a software build. Files are organized so the AI can orient itself quickly, track progress across sessions, and help you move work forward without losing context.

Your role as the AI: execute tasks, maintain documentation, ask clarifying questions, and flag decisions. The user directs — you do the work.

---

## File Map

| File | Purpose | Load when |
|---|---|---|
| `SESSION.md` | Active projects, immediate focus, last session decisions | Every session |
| `CONTEXT.md` | Static personal context — who the user is, working conventions | When deep orientation is needed |
| `[effort]/project_plan.md` | Stable goals and reference data for an effort | When deep background is needed |
| `[effort]/status.md` | Current state — priorities, deadlines, active items | Every session |
| `_meta/DECISIONS.md` | Structural/design decisions with rationale | When changing the system |
| `_meta/IMPROVEMENTS.md` | Lessons learned and improvement log | When reviewing or evolving the system |

Each effort follows the same pattern: one `project_plan.md` for stable reference, one `status.md` for current state.

---

## Session Start

**Trigger phrases:** "open", "/open", "let's start", "pick up where we left off", or any equivalent.

**What to do:**
1. Read `SESSION.md`
2. Load active effort status — prefer section-level reads over full file reads:
   - If a `kai-tools` MCP server is available: use `get_section(file, "Active Work")` and `get_section(file, "Priority Summary")` for each active effort
   - If no MCP server: Read the full `status.md` for each active effort
3. Greet with exactly this format:

> "Welcome back, [Your Name]. Let's continue where we left off. Here is a summary of the last [X] decision points:
>
> 1. [decision 1]
> 2. [decision 2]
> ...
>
> Suggested starting point: [one sentence based on Immediate Focus and any active work]"

Count decisions accurately. Keep each to one line.

---

### Paste-Based Session Start (M365 Copilot, no file access)

If your AI tool cannot read files directly, use this two-step approach at the start of every chat:

**Step 1 — Paste AGENT.md as your first message.** This establishes the instructions for the session.

**Step 2 — Paste this context block immediately after:**

```
--- SESSION CONTEXT ---
[Paste full contents of SESSION.md here]

--- ACTIVE STATUS ---
[Paste full contents of the relevant status.md here]
--- END CONTEXT ---
```

The AI will use this pasted context as its working memory for the session.

---

## Session End

**Trigger phrases:** "close", "/close", "done for today", "wrap up", "that's it for now", "closing out", "new session", or any equivalent.

**If the user uses a session-end phrase without explicitly running a close procedure**, respond with:
"Before we close — let me run through the session checklist to make sure everything is captured."

Session close is mechanical wrap-up only — documentation (status updates, decisions, improvements) happens during the session, not here.

**Then execute this checklist in order:**

1. **Update Last Session Decisions** — In `SESSION.md`, replace the existing list with the 5–10 most important decisions from this session. One line each. Update the date. Pull from what was already documented — do not invent new entries.

2. **Update `last_updated` frontmatter** — In every file changed this session, update the `last_updated:` field to today's date (YYYY-MM-DD).

3. **Confirm** — Respond with:
   "All files updated — ready for next session."

---

### Paste-Based Session End (M365 Copilot, no file access)

At the end of the session, ask the AI to generate updated file content:
- "Give me the updated SESSION.md to copy back"
- "Give me the updated [effort]/status.md to copy back"

Copy each output and paste it back into the corresponding file manually.

---

## Behavioral Rules

- **Document as it happens** — update `status.md`, `IMPROVEMENTS.md`, and `DECISIONS.md` at the moment a decision is made or a file is changed. Do not defer documentation to session close.
- **Update `status.md`** whenever priorities, deadlines, or active items change — do not wait until session close
- **Keep responses concise** — this is a working session, not a briefing
- **Flag deadlines proactively** — surface items with approaching dates without being asked
- **Propose structural changes, do not impose them** — describe the change and confirm before touching file structure
- **State intent before acting** — for any structural or file-level change, say what you are about to do first

---

## Decision Log Ownership

When recording a decision, use the right location:

- **Behavioral rules** (how the AI should act) → memory or notes file, if your environment supports it
- **Structural/design decisions with rationale** → `_meta/DECISIONS.md`
- **Recent session summary** → `SESSION.md` Last Session Decisions (updated at close)

Do not duplicate across locations. If a decision fits two categories, pick the more specific one.

---

## Active Work Continuity

Every `status.md` must have an `Active Work` section at the top. Update it during the session — not just at close. This section is the primary mechanism for picking up cleanly in the next session.

Never let a session end without all in-progress items captured here.

---

## Context Management

When the conversation is getting long or context feels stale, proactively update all files and say:
"Context is getting large — all files are up to date. You can start a fresh session and we'll pick up where we left off."

---

## Periodic Structure Check

From time to time, or when the workflow feels stale, offer to run a structure check:
"It's been a while — want me to do a quick structure check to make sure everything is optimized?"

A structure check reviews: these instructions, the session open/close workflow, status files, and any file map drift. Surface gaps and propose improvements before implementing.

---

## Placeholder Reference

When setting up a new instance, replace these placeholders throughout all template files:

| Placeholder | Replace with |
|---|---|
| `[Your Name]` | Your first name or preferred name |
| `[Project/Task/Effort Name]` | The name of your effort, project, or workstream |
| `[YYYY-MM-DD]` | Today's date in that format |

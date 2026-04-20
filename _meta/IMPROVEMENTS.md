---
type: improvements-log
last_updated: 2026-04-20
---

# Improvements Log

Captured observations, lessons learned, and recommendations for improving the system.
Add an entry whenever something works better than expected, fails, or could be done differently.

---

## Format

```
### YYYY-MM-DD — [Short title]
**Observation:** What happened or was noticed
**Recommendation:** What to change or try
**Status:** Open / In Progress / Done / Rejected
```

---

## Log

### 2026-04-20 — Document as it happens — /close is mechanical only
**Observation:** `/close` was being used as the primary documentation step, but by end-of-session the conversation is often degraded (compressed context, lost detail). Important decisions and file changes were being documented too late, or missed entirely. [Your Name]'s wife's experience showed the same issue — close was doing too much at the wrong time.
**Recommendation:** Shift documentation to in-the-moment: update `status.md`, `IMPROVEMENTS.md`, `DECISIONS.md`, and memory files when a decision is made or a file is changed — not at close. `/close` becomes a lightweight mechanical step: (1) write Last Session Decisions summary, (2) bump `last_updated` frontmatter, (3) confirm. Active Work updates happen during the session, not at close.
**Status:** Done — CLAUDE.md Behavior section updated, `/close` skill slimmed, AGENT.md Session End + Behavioral Rules updated, `_template/commands/close.md` updated

### 2026-04-20 — sync-template.js removed from public template

### 2026-04-20 — sync-template.js removed from public template
**Observation:** `setup/sync-template.js` was published to `ai-project-template` and downloaded by template users (including [Your Name]'s wife). The script tries to push to a GitHub repo that template users don't have — causing confusion and unexpected GitHub prompts. It is a maintainer-only tool.
**Recommendation:** Remove from public template. `check-updates.js` stays — it's for users to check if their template is outdated. `sync-template.js` is already excluded from future syncs via EXCLUDE_PATTERNS. Role distinction: `check-updates.js` = user tool, `sync-template.js` = maintainer tool.
**Status:** Done — removed from `ai-project-template` repo (commit 466e8b0); EXCLUDE_PATTERNS already protected against re-sync

### 2026-04-20 — Auto-approve read-only tools in settings.json
**Observation:** Every Read, Glob, Grep, and kai-tools call prompted for approval, creating friction for [Your Name] and confusion for new users. Read-only tool calls are non-destructive and safe to auto-approve.
**Recommendation:** Add `allowedTools` to `~/.claude/settings.json` whitelisting: `Read`, `Glob`, `Grep`, `mcp__kai-tools__get_section`, `mcp__kai-tools__search_files`, `mcp__kai-tools__update_section`. Write/Edit/Bash/git operations still require approval.
**Status:** Done — settings.json updated

### 2026-04-20 — Auto-documentation pattern needed for system changes
**Observation:** [Your Name] noted that documentation for system changes should be auto-captured rather than manually remembered. Currently IMPROVEMENTS.md is updated manually when changes are made. There is no hook or trigger that ensures a change to CLAUDE.md, settings.json, or skill files automatically produces a log entry.
**Recommendation:** Investigate a hook-based pattern — e.g., a post-edit hook that prompts Kai to log any change to a system file (CLAUDE.md, settings.json, open.md, close.md) to IMPROVEMENTS.md automatically. Alternatively, make it a design rule: any session that touches system files must end with an IMPROVEMENTS.md entry. Could also be a `/close` checklist item — "were any system files changed this session? If yes, log them."
**Status:** Open — design when ready; consider adding to /close checklist as interim solution

### 2026-04-20 — SESSION.md is exempt from get_section — always read whole

### 2026-04-20 — SESSION.md is exempt from get_section — always read whole
**Observation:** SESSION.md was being read with two `get_section` calls (one for Last Session Decisions, one for Immediate Focus). Multiple tool calls are slower than one whole-file read, and SESSION.md is intentionally small — sectioning it adds overhead without benefit.
**Recommendation:** SESSION.md should always be read whole with a single `Read` call. It is exempt from the `get_section` pattern. The design principle: small hub files that are always loaded in full should never be sectioned. CLAUDE.md now explicitly states this exemption. The `_template/commands/open.md` already had this right; the live `open.md` had drifted and was corrected.
**Status:** Done — live `open.md` fixed; CLAUDE.md exemption note added; design principle documented

### 2026-04-18 — Python alternative for setup scripts

### 2026-04-18 — Python alternative for setup scripts
Setup tools (`sync-template.js`, `check-updates.js`) are currently Node.js. A Python version should be investigated for users who have Python but not Node — particularly data scientists and analysts who are a natural MetaTemplate audience. Python's `difflib`, `pathlib`, and `argparse` cover the same ground cleanly. Decision to use Node documented in `_meta/DECISIONS.md`. Revisit when there is user feedback indicating Node is a friction point.

### 2026-03-30 — Copilot onboarding flow works without explicit setup instructions
**Observation:** When [Your Name] ran /open on an uninitialized MetaTemplate download (no SESSION.md at root, no effort folders), GitHub Copilot in VS Code correctly identified the uninitialized state, explained what was missing, and offered to set up a new instance. It asked the right questions in the right order: name, workspace location, efforts, immediate focus — then built the workspace.
**Recommendation:** This behavior emerged from the AGENT.md structure without an explicit "if uninitialized, run setup" instruction. Consider making this explicit in copilot-instructions.md to ensure it's reliable across AI tools. Also validates that the template file structure communicates intent clearly enough for an AI to infer setup state.
**Status:** Done — first real-world Copilot onboarding test passed

### 2026-03-30 — MetaTemplate missing .github/copilot-instructions.md for VS Code Copilot
**Observation:** When [Your Name] set up the MetaTemplate on a corporate work PC (GitHub Copilot in VS Code, no Claude Code CLI), the template had no workspace-level Copilot instructions. Without this file, Copilot doesn't know to follow the session open/close system.
**Recommendation:** Add `.github/copilot-instructions.md` to the template root. Content is a lightweight session layer (open/close triggers, AGENT.md pointer) that is additive to any existing user-level Copilot instructions.
**Status:** Done — added to `_template/.github/copilot-instructions.md` and pushed to `ai-project-template`

### 2026-03-29 — Setup script next-steps messages need real-world testing
**Observation:** The "next steps" output at the end of each setup script was written based on current understanding of each tool's workflow. These have not been tested with a real user on a fresh machine.
**Recommendation:** Test each script (claude-code, github-copilot, generic) on a clean install and verify the next-steps instructions are accurate and sufficient. Update messaging as needed.
**Status:** Open — flag for first real-world test ([Your Name]'s wife is the first test case for claude-code/Windows)



### 2026-03-27 — /close skill + session close overhaul
**Observation:** Session close was vague, manual, and easy to skip. No git commit step. No `last_updated` enforcement. No safety net if [Your Name] just closed the terminal. Three decision logs (memory, DECISIONS.md, SESSION.md) had no ownership rules, causing drift.
**Recommendation:** (1) Created `/close` custom skill — runs full checklist automatically: Active Work, Last Session Decisions, last_updated frontmatter, git commit, git push. (2) CLAUDE.md updated: /close reminder fires when session-ending phrases are detected without /close; concrete ordered close checklist; Decision Log Ownership section added; memory dual-write rule strengthened. (3) PROCESS.md updated with /close in session workflow.
**Status:** Done

### 2026-03-27 — Persona system needed for different effort types
**Observation:** Different efforts require different AI response styles. A home improvement task, a health conversation, and a technical build all benefit from different tones and levels of directiveness. Currently Kai operates in one mode regardless of context.
**Recommendation:** Design a persona/mode system with at least three variants: (1) Builder mode — current style, directive and efficient; (2) Supportive mode — encouraging, patient, emotionally aware — for sensitive personal topics like health and VA claims; (3) Collaborative mode — offers more explicit choices, checks in more often, makes [Your Name] feel more in control of decisions. Each effort's project_plan.md could declare a default persona. [Your Name] can also switch modes mid-conversation.
**Status:** Open — deferred, design when ready to implement

### 2026-03-27 — Memory should live inside the kAI file structure
**Observation:** Kai's memory currently lives in Claude's internal storage (`~/.claude/projects/.../memory/`). This is not portable, not visible in the file structure, and not backed up with the project. If [Your Name] switches tools or machines, memory is lost.
**Recommendation:** Mirror all memory files into the kAI workspace itself — e.g., a `_memory/` folder at the kAI root. This makes memory visible, editable, version-controlled, and portable. Claude's internal memory can remain as a fast-load cache, but the kAI file structure is the source of truth.
**Status:** Done — `_memory/` created at kAI root; gitignored (private); backed up via OneDrive; CLAUDE.md updated with sync instructions

### 2026-03-27 — Rebranded to MetaTemplate
**Observation:** "AI-Assisted Project Management" was too narrow — implied only project tracking, excluded coding, daily tasks, health tracking, and other effort types.
**Recommendation:** Use "MetaTemplate" as the name going forward. It connects to the existing `_meta/` structure, signals "a template for how to work" rather than a specific work type, and avoids scope-limiting language. Update all references: presentation, README, GitHub description, and any future marketing materials.
**Status:** Done

### 2026-03-27 — SESSION.md split into SESSION.md + CONTEXT.md
**Observation:** SESSION.md was accumulating static personal context alongside active project state. As more projects are added, it would grow and become expensive to load every session.
**Recommendation:** SESSION.md = pointer table + immediate focus only. Static context (who [Your Name] is, working convention, file map) moved to CONTEXT.md — loaded on demand. This pattern should be reflected in the _template/ files.
**Status:** Done

### 2026-03-27 — Three-effort structure defined
**Observation:** The workspace has three distinct efforts with different scopes, audiences, and privacy requirements: Home/Personal, Template Build, and Health. These need to be clearly separated so each can evolve independently.
**Recommendation:** Each effort gets its own project_plan.md + status.md. Health stays completely separate at kAI2026/. This structure is the template pattern proven in real use.
**Status:** Done

### 2026-03-27 — Active Work section needed in status.md files
**Observation:** Sessions were losing in-progress context because status files only tracked project-level state, not what was actively happening mid-session.
**Recommendation:** Every status.md should have an "Active Work" section at the top that gets updated during the session. This is the primary mechanism for session continuity.
**Status:** Done — added to home/status.md and template/status.md; should be added to _template/status.md when created



### 2026-03-27 — Template must be portable and AI-agnostic
**Observation:** The end goal is to package the template so it can be handed to someone else and used with any AI assistant — Claude, GitHub Copilot Agent, or others.
**Recommendation:** Three things need to change or be added:
1. `CLAUDE.md` is Claude-specific — the template needs a parallel `AGENT.md` (or similar) written in AI-agnostic language so any assistant can load and follow the session protocol
2. A `QUICKSTART.md` needs to exist in the template — a human-readable onboarding doc that tells a new user exactly what to do to stand up their own version of this system from scratch
3. Any Claude-specific syntax or tooling referenced in process docs should be noted as Claude-specific, with a note on what the equivalent would be in other tools
**Status:** Done — `AGENT.md` and `QUICKSTART.md` both created in `_template/`. AGENT.md covers all environments including paste-based M365 workflow. QUICKSTART.md covers setup, session workflow, all three environment guides, and customization.

### 2026-03-27 — Multi-environment compatibility: document how to run this in constrained AI tools
**Observation:** This system must work across different AI environments with different capabilities — not just Claude Code. Three environments to target:
1. **Claude Code / VS Code + Copilot Agent** — full file read/write, current implementation
2. **VS Code + GitHub Copilot** — similar file access, different tool syntax and agent behavior
3. **M365 Copilot Chat (enterprise)** — no file creation, paste-based workflow only; session state must be maintained by the user copying/pasting context manually
**Recommendation:** When ready, document a variant of PROCESS.md for each environment. The no-file-access variant (M365) is the most constrained and needs the most creative adaptation — likely a "paste this block at the start of every chat" pattern. Revisit and evaluate whether the current architecture is the best approach for all three, or if a modified structure serves the constrained environments better.
**Status:** Open — deferred, revisit once home project is actively running and structure is proven

### 2026-03-27 — Publish to GitHub when project is active and structure is proven
**Observation:** The kAI project should be published to GitHub, but not yet — the structure needs to be stable and there should be real working content (e.g. active gardening tasks, completed projects) to demonstrate the system in practice.
**Recommendation:** When [Your Name] says "prepare for GitHub," do the following: (1) review all files and scrub any sensitive personal info (address, personal details) from template files, (2) create a README.md at the kAI root that serves as the GitHub landing page, (3) initialize a git repo and create a remote on GitHub. The home project content can either be excluded via .gitignore (private) or sanitized for sharing — [Your Name] to decide at that time.
**Status:** Open — deferred until project structure is stable and real tasks are underway

### 2026-03-27 — Two deliverable documents needed: pitch deck and retrospective guide
**Observation:** Two distinct documents need to be created at different points in the project lifecycle:
1. **Early-stage HTML presentation** — created soon, after the foundation is set. Explains what this system is, what it proposes, and why it matters. Audience: someone seeing this for the first time. Purpose: show the vision before the proof is complete.
2. **End-stage process retrospective** — created once the system has been used long enough to validate. Documents how to repeat this process, what worked, why it worked, and the full journey. Audience: someone who wants to build their own version. Purpose: the teachable, shareable guide.
**Recommendation:** When [Your Name] says "build the intro presentation," generate the HTML deck from current `_meta/` content. When [Your Name] says "build the retrospective," compile from IMPROVEMENTS.md, DECISIONS.md, and project history.
**Status:** Open — both deferred until prompted

### 2026-03-27 — Future-proofing is a core design requirement
**Observation:** The system must remain useful as AI capabilities advance. Small updates should be sufficient to adapt — no rebuilding from scratch.
**Recommendation:** Always design with this hierarchy in mind: (1) project content files should never need structural changes, (2) behavior/instruction files (CLAUDE.md, session loaders) may need small updates as AI tools evolve, (3) process docs are what make those updates fast and confident. When adding anything new, ask: "If AI capabilities doubled tomorrow, would this still make sense?"
**Status:** Ongoing — apply to every design decision

### 2026-03-27 — Initial system setup via VS Code extension, then migrated to Claude Code CLI
**Observation:** The initial project setup was done in the VS Code Claude extension chat. That chat had no access to the filesystem directly, required copy-pasting file contents, and had no persistent memory. Migrating to Claude Code CLI gave full file read/write access, auto-loading via CLAUDE.md, and a much tighter feedback loop.
**Recommendation:** Always set up new projects using Claude Code CLI, not the extension chat. The extension is useful for quick questions; the CLI is the right tool for file-based project work.
**Status:** Done

### 2026-03-27 — PowerShell profile needed for terminal consistency
**Observation:** New VS Code terminals were not loading the PowerShell profile because `Microsoft.PowerShell_profile.ps1` did not exist — only `Microsoft.VSCode_profile.ps1` did. New terminals use the standard profile, not the VS Code-specific one.
**Recommendation:** When setting up on a new machine, ensure `Microsoft.PowerShell_profile.ps1` exists and dot-sources `Microsoft.VSCode_profile.ps1`. Document this in any machine setup guide.
**Status:** Done

### 2026-03-27 — `claude` command needed a PowerShell wrapper
**Observation:** Claude Code is installed as `claude.cmd` via npm. To always start a session from the kAI directory, a PowerShell wrapper function was needed in the profile. The first attempt using `Get-Command` failed due to path resolution; direct path to `claude.cmd` worked.
**Recommendation:** On new machine setup, add the wrapper function to the PowerShell profile early. Use `& "$env:APPDATA\npm\claude.cmd" @args` as the invocation pattern.
**Status:** Done

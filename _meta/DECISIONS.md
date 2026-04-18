---
type: decisions-log
last_updated: 2026-03-29
---

# Design Decisions

Why the system is structured the way it is. Read this before changing the structure.

---

## MetaTemplate Copyright is Intentional

[Your Name] retains explicit copyright on MetaTemplate and all published materials. The copyright line in presentations and shared files must never be removed.

**Why:** Establishes clear separation between work developed on personal time (MetaTemplate, kAI) and any employment context — even if the same method is later applied at work. The copyright is evidence that this was developed independently, outside of employment, and is [Your Name]'s personal intellectual property.

**Rule:** Always include `© [year] [Your Name]` in any published presentation or shareable document. Do not add employer references or work-context language to MetaTemplate files.

---

## Three-Effort Structure (Home, Template, Health)

The kAI workspace organizes work into three distinct efforts, each self-contained:

1. **Home/Personal** — operational project tracking (home, garden, life)
2. **Template Build** — building the reusable, shareable template system
3. **Health** — personal health tracking; private and completely separate

Each effort follows the same pattern: `project_plan.md` (stable goals/reference) + `status.md` (current state). This is the template pattern proven in practice.

**Health is the exception:** Lives at `[workspace-path] — never referenced by content in kAI files, only as a pointer. Health data never appears in template or meta files.

**Flexibility is a core requirement:** This three-effort structure is a starting point. It can evolve — new efforts can be added, renamed, or split. The pattern (project_plan + status) stays consistent even as the content changes.

---

## SESSION.md Stays Small — CONTEXT.md Holds Static Info

**Decision:** SESSION.md contains only the Active Projects table and Immediate Focus. Nothing else.

**Why:** SESSION.md is loaded every session. If it holds static personal context, file maps, working conventions, and project details, it grows with every new project and becomes expensive to load. Keeping it to a pointer table means it never grows past ~15 lines regardless of how many projects exist.

Static context (who [Your Name] is, working convention, property info, file map) lives in `CONTEXT.md` — loaded on demand when deep orientation is needed, not every session.

---

## kAI and ai-project-template are Separate Repos (2026-03-28)

**Decision:** kAI is a private GitHub repo (`[your-github-username]/kAI`). The template is a separate public repo (`[your-github-username]/ai-project-template`). They are not linked — updates flow deliberately, not automatically.

**Why:** Previously kAI used ai-project-template as its git remote, which caused personal workstream files ([effort]/, ops/, TRIGGERS.md, PERSONAS.md) to be published to the public repo unintentionally. The separation enforces a clean boundary: kAI is the workshop, ai-project-template is the published output.

**How updates flow:** When a pattern or file in kAI is ready for general use, it gets pushed to ai-project-template manually. See `_meta/PROCESS.md` → "Pushing Template Improvements" for the steps.

**Rule:** Never set kAI's git remote to ai-project-template again. kAI's remote is always `[your-github-username]/kAI` (private).

---

## Template Requires Minimal Input to Start

The template is designed so a new user only needs to provide a project name and one-line description to get started. The AI does the rest — asking questions, suggesting structure, and building context through conversation.

Personal information (name, location, etc.) is never required by the template. It only gets added if it's relevant to the specific project (e.g. location matters for gardening; it doesn't matter for a software project).

This makes the template feel like a personal tool, not a form to fill out.

---

## Health Project — Personal Data Must Stay Private

The `health/` project contains sensitive personal medical information. Hard rules:
- Health data never feeds into `_template/` files under any circumstances
- Health data never appears in `_meta/` process documentation
- When preparing for GitHub or sharing, `health/` is excluded entirely — `.gitignore` at minimum, separate private repo preferred
- Any crossover between health and other projects (e.g. a home project that relates to health) gets noted in both places but health details stay in `health/`

---

## Structure Evolution Policy

Claude may propose and implement structural changes when a better pattern emerges — especially to keep the system generic enough to apply to any repeatable workstream, not just home projects.

**Rules:**
- Small changes (renaming a file, adding a section, updating a template) — make it, document it in IMPROVEMENTS.md
- Drastic changes (reorganizing folders, changing the core file pattern, altering how sessions load) — propose it and confirm with [Your Name] before touching anything

When in doubt, propose first.

---

## Future-Proofing Principle

This system is designed to remain useful as AI capabilities advance. The goal is that improvements in AI make the system *better*, not obsolete — and that any required changes are small and localized.

This is achieved by:
- **Separating data from behavior** — project content (plans, status) is plain markdown, independent of any AI tool. Only the behavior files (CLAUDE.md, session instructions) are tool-specific and would need updating.
- **Documenting the why, not just the what** — when AI capabilities change, understanding the reasoning behind each decision makes it easy to judge what to keep, adapt, or drop.
- **Using open formats** — markdown files work everywhere: any AI, any editor, any OS, version control, or plain text reader.
- **Capturing improvements as they happen** — `_meta/IMPROVEMENTS.md` ensures the system evolves intentionally, not by drift.

As AI advances, the expectation is: project content files never change structure, behavior/instruction files may need small updates, and the process docs guide those updates.

---

## Working Relationship

**[Your Name]'s role:** Director and guide — sets goals, priorities, and direction.
**Claude's role:** Graduate Teaching Assistant + Graduate Research Assistant — executes the work, conducts research, writes documentation, and ensures the process is teachable and repeatable.

[Your Name] does not need to do the legwork. Claude does. [Your Name]'s input shapes what gets done and how.

---

## project_plan.md and status.md are separate files

**Decision:** Stable reference data lives in `project_plan.md`. Active state lives in `status.md`.

**Why:** A single file gets stale fast — either the reference data gets cluttered with current-state noise, or current state gets buried under reference material. Separating them means Claude can read just `status.md` for a quick orientation, and only reach into `project_plan.md` when deep context is needed. It also keeps updates small and targeted.

---

## SESSION.md is a top-level loader, not a project file

**Decision:** `SESSION.md` at the root points to all active projects. It does not contain project content.

**Why:** When context gets large or a new chat starts, you need one file that orients Claude in under a page. If project content lived here, it would grow and become expensive to load. The loader stays small by design.

---

## CLAUDE.md controls behavior, not SESSION.md

**Decision:** Instructions to Claude (what to read, how to respond) live in `CLAUDE.md`, not `SESSION.md`.

**Why:** `SESSION.md` is data — it describes the project landscape. `CLAUDE.md` is behavior — it tells Claude what to do with that data. Mixing them makes both harder to maintain.

---

## _template/ and _meta/ are separate folders

**Decision:** `_template/` holds only files meant to be copied. `_meta/` holds process documentation.

**Why:** These serve different purposes. Templates are operational artifacts — you copy them and fill them in. Process docs are reference and reflection — you read them to understand or improve the system. Mixing them would mean every new project either gets unnecessary meta files, or the meta docs get left behind when templating.

---

## Setup Tools are Written in JavaScript (Node.js)

**Decision:** `sync-template.js`, `check-updates.js`, and `mcp-tools/server.js` are all Node.js scripts.

**Why:** Three reasons drove this choice:
1. Node is already implied by the Claude Code install (`npm install -g @anthropic-ai/claude-code`) — users with Claude Code already have it
2. Node runs identically on Windows, Mac, and Linux — no OS-specific scripting
3. File diffing, CHANGELOG parsing, and interactive prompts are verbose in bash but clean in JS

**Why not Python?** Python is also cross-platform and readable. It was not chosen because Node was already present and Python is not implied by any other dependency in this stack. A Python rewrite is noted in `_meta/IMPROVEMENTS.md` as a future option — particularly if the user base skews toward developers who have Python but not Node.

**How to replicate this decision:** If you are a MetaTemplate user building your own tools, use Node.js for consistency. Your AI can scaffold a new setup script by reading any existing script in `setup/` as a pattern — they share the same structure: path setup, interactive prompt helper, main() async function.

**Rule:** Keep setup scripts dependency-free (no npm packages beyond what the MCP server needs). Scripts should run with `node [script].js` and nothing else.

---

## Improvement log is a dedicated file, not inline comments

**Decision:** Lessons learned and recommendations go in `_meta/IMPROVEMENTS.md`, not scattered as comments in other files.

**Why:** Improvements need to be findable and reviewable as a set. Inline comments get lost, go stale, and create noise in files meant for other purposes. A dedicated log lets you see the evolution of the system over time.

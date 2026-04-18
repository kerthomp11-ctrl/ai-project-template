# MetaTemplate Changelog

All notable changes to the MetaTemplate are documented here.

Each version entry has four sections:
- **Added / Changed** — what changed and why
- **Upgrade Guide** — manual steps you handle (file copies, renames, config)
- **AI Integration** — copy-paste prompts to give your AI; it applies the structural changes for you

---

## [1.5] — 2026-04-18

### Added
- **`get_section` and `update_section` MCP tools** — surgical section-level reads and writes; `last_updated` frontmatter is auto-bumped on every write
- **`search_files` MCP tool** — BM25 keyword search across workspace files; returns ranked results with section context
- **Documentation standard for `status.md` files** — all status files now use exact headers in order: `## Active Work`, `## Priority Summary`, `## Open Questions`, `## Archive`
- **`## Archive` section pattern** — completed items move Active Work → Archive → completed.md; Archive is never loaded by default
- **`sync-template.js`** — automated sync tool from private workspace to public MetaTemplate repo; diffs, sanitizes, stages, and prompts to push

### Changed
- AGENT.md updated: session start step 2 uses `get_section` when MCP available; full Read as fallback for non-Claude environments
- SESSION.md header standard: dates moved from headers into section bodies for section-tool compatibility

### Upgrade Guide
1. Pull `setup/mcp-tools/` — new MCP server with `get_section`, `update_section`, `search_files`; run `npm install` inside that folder
2. Register in `.mcp.json`: `{ "kai-tools": { "command": "node", "args": ["setup/mcp-tools/server.js"] } }`
3. If upgrading from kai-search: rename `setup/mcp-search/` → `setup/mcp-tools/`; update `.mcp.json` and any settings files
4. Update your SESSION.md headers: move dates from `## Last Session Decisions YYYY-MM-DD` → `## Last Session Decisions` with `*YYYY-MM-DD*` as the first line inside the section

### AI Integration

> Copy and paste the following prompt to your AI to apply the structural changes for this version:

```
I'm upgrading to MetaTemplate v1.5. Please apply these structural changes to my workspace:

1. Add an `## Archive` section to the bottom of every status.md file that doesn't already have one.
   Use this exact text: "## Archive\n- [Completed items move here from Active Work — not loaded in normal sessions]"
   Archive is never loaded by default — only on explicit request.

2. Check all status.md files for the section header `## Priority Summary — Now` and rename it to `## Priority Summary`.

3. In SESSION.md, check that dates appear inside section bodies, not in the headers themselves.
   Correct format:
     ## Last Session Decisions
     *YYYY-MM-DD*
     1. [decision]
   Incorrect format:
     ## Last Session Decisions YYYY-MM-DD

4. Update step 2 of Session Start in AGENT.md (or your equivalent instructions file) to read:
   "Load active effort status — prefer section-level reads over full file reads:
    - If a kai-tools MCP server is available: use get_section(file, 'Active Work') and get_section(file, 'Priority Summary')
    - If no MCP server: Read the full status.md for each active effort"

Tell me what you changed after each step.
```

---

## [1.4] — 2026-04-11

### Added
- **kai-tools MCP server** — BM25 file search across the workspace; replaces manual grep for finding content; supports multiple root directories via `SEARCH_ROOTS` environment variable
- **`_meta/VISION.md`** — documents the philosophy and pointer architecture behind MetaTemplate

### Changed
- MCP server renamed from kai-search → kai-tools; folder moved to `setup/mcp-tools/`
- SESSION.md header standard introduced — dates belong inside section bodies, not in headers

### Upgrade Guide
1. If you have an existing kai-search server: rename `setup/mcp-search/` → `setup/mcp-tools/`; update `.mcp.json` and `settings.local.json`
2. Run `npm install` in `setup/mcp-tools/` after pulling

### AI Integration

> Copy and paste the following prompt to your AI to apply the structural changes for this version:

```
I'm upgrading to MetaTemplate v1.4. Please apply these structural changes:

1. Open SESSION.md and check the headers for `## Immediate Focus` and `## Last Session Decisions`.
   If either header has a date appended (e.g., `## Immediate Focus (as of 2026-03-15)`), move the
   date inside the section as the first line in italics:
     ## Immediate Focus
     *as of YYYY-MM-DD*

   Do the same for Last Session Decisions if the date is in the header.

2. If `_meta/VISION.md` doesn't exist, create it with a single header: `# Vision` and this line:
   "What is this system for? Add your own notes here."

Tell me what you changed.
```

---

## [1.3] — 2026-03-30

### Added
- **M365 Copilot support** — `_template/.github/copilot-instructions.md` added; AGENT.md and QUICKSTART.md updated with Copilot environment instructions
- **`_meta/IMPROVEMENTS.md`** — running log for improvement ideas surfaced during sessions; AI adds to it automatically when patterns emerge
- **MetaTemplate observation rule** — AI flags reusable patterns inline and logs them to IMPROVEMENTS.md if deferred

### Changed
- Sensitive workstream data (health, personal) recommended to be stored outside the repo — keeps private data off git

### Upgrade Guide
1. Copy `_template/.github/copilot-instructions.md` into your workspace `.github/` folder if using Copilot
2. Create `_meta/IMPROVEMENTS.md` if missing

### AI Integration

> Copy and paste the following prompt to your AI to apply the structural changes for this version:

```
I'm upgrading to MetaTemplate v1.3. Please apply these changes:

1. If `_meta/IMPROVEMENTS.md` doesn't exist in my workspace, create it with this content:
   ---
   type: improvements-log
   last_updated: [today's date]
   ---

   # Improvements Log

   Patterns, friction points, and structural improvement ideas surfaced during sessions.
   Add an entry here when a reusable pattern is identified — even if deferred.

   ## Log
   (empty — add entries as they come up)

2. Add this rule to your active instructions (wherever you keep behavioral rules):
   "When a pattern, structure, or improvement emerges during a session that could be reused,
   flag it inline with: 'Note: [what and why]'. If the user defers or doesn't respond to it,
   add it to _meta/IMPROVEMENTS.md automatically."

Tell me what you changed.
```

---

## [1.2] — 2026-03-29

### Added
- **Platform setup scripts** — `setup/setup-mac.sh`, `setup/setup-windows.ps1`, `setup/setup-m365.md` for first-time workspace initialization
- **`/setup` skill** — guided first-time workspace initialization for new users
- **`_template/commands/`** — blank skill templates for workstream context injection (`/open[Workstream]` pattern)

### Changed
- Repo restructured for clean sharing — private workspace repo separated from public MetaTemplate repo
- `.gitignore` switched to whitelist model — only MetaTemplate files tracked in git; everything else ignored by default
- AGENT.md and QUICKSTART.md promoted to repo root

### Upgrade Guide
1. Pull `setup/` — setup scripts are additive, no conflicts expected
2. Pull `_template/commands/` — blank command templates for your own workstream skills

### AI Integration

> Copy and paste the following prompt to your AI to apply the structural changes for this version:

```
I'm upgrading to MetaTemplate v1.2. Please apply these changes:

1. If you don't have a `/open` skill or equivalent session-start command, create one.
   It should: read SESSION.md, load Active Work from each active status.md, and greet
   with a summary of the last session decisions plus a suggested starting point.

2. If you don't have a `/close` skill or equivalent session-end command, create one.
   It should: update Active Work in all touched status.md files, update Last Session
   Decisions in SESSION.md, update last_updated frontmatter in changed files, and confirm.

3. Check that AGENT.md (or your instructions file) is at the root of your workspace,
   not in a subdirectory. If it's elsewhere, move it to the root.

Tell me what you changed.
```

---

## [1.1] — 2026-03-28

### Added
- **Persona system** — `_meta/PERSONAS.md` defines per-workstream AI response modes; cross-cutting observation rule active in every session
- **`_meta/DECISIONS.md`** — structural and design decision log; records what was decided, why, and how to apply it
- **Ops workstream pattern** — dedicated effort for tracking session architecture, configuration, and system improvements

### Changed
- Session architecture refactored — `/open` and `/close` are the canonical entry and exit points for every session
- Lazy-load model formalized — AI loads only what is needed, when it is needed; no bulk file reads at session start
- Trigger map introduced — keywords in conversation trigger specific file loads

### Upgrade Guide
1. Copy `_meta/PERSONAS.md` from the template and add your own workstream entries
2. Add `_meta/DECISIONS.md` if missing
3. Consider creating an `ops/` workstream to track your session architecture decisions

### AI Integration

> Copy and paste the following prompt to your AI to apply the structural changes for this version:

```
I'm upgrading to MetaTemplate v1.1. Please apply these changes:

1. From now on, use a lazy-load model for session start:
   - Load SESSION.md first
   - Load status.md files only for efforts listed as active in SESSION.md
   - Do not read project_plan.md, completed.md, or any other files unless the topic comes up

2. If `_meta/PERSONAS.md` doesn't exist, create it with:
   ---
   type: personas
   last_updated: [today's date]
   ---

   # Personas
   Defines AI response modes per workstream. Add entries as you create workstreams.

   ## Default
   Concise, direct, working-session tone. No preamble. Lead with the action or answer.

3. If `_meta/DECISIONS.md` doesn't exist, create it with:
   ---
   type: decision-log
   last_updated: [today's date]
   ---

   # Decision Log
   Structural and design decisions with rationale. One entry per decision.

4. Add this rule to your active instructions:
   "When recording a decision: behavioral rules go to memory or notes; structural/design
   decisions with rationale go to _meta/DECISIONS.md; session summaries go to SESSION.md.
   Do not duplicate across locations."

Tell me what you changed.
```

---

## [1.0] — 2026-03-27

### Added
- Initial public MetaTemplate release
- `AGENT.md` — AI-agnostic session instructions for Claude Code, Copilot, and paste-based environments
- `QUICKSTART.md` — human onboarding guide covering all three environments
- `/open` and `/close` skills — session start and close checklist
- `SESSION.md` — pointer table, active projects, immediate focus, last session decisions
- `_meta/TRIGGERS.md` — keyword→file lazy-load map
- `_meta/EXAMPLES.md` — generic personalization examples

### AI Integration

> This is the baseline. No prior version to upgrade from — set up using QUICKSTART.md.

---

*Versioning is tied to meaningful capability additions, not calendar releases.*  
*Each AI Integration block is a standalone prompt — paste it directly to your AI assistant.*

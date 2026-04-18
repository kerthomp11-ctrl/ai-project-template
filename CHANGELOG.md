# MetaTemplate Changelog

All notable changes to the MetaTemplate are documented here.  
Format: **What changed → Why it matters → How to integrate** (for users upgrading from a prior version).

---

## [1.5] — 2026-04-18

### Added
- **`get_section` and `update_section` MCP tools** — surgical section-level reads and writes; `last_updated` frontmatter is auto-bumped on every write
- **`search_files` MCP tool** — BM25 keyword search across workspace files; returns ranked results with section context
- **Documentation standard for `status.md` files** — all status files now use exact headers in order: `## Active Work`, `## Priority Summary`, `## Open Questions`, `## Archive`
- **`## Archive` section pattern** — completed items move Active Work → Archive → completed.md; Archive is never loaded by default

### Changed
- CLAUDE.md updated: keyword triggers now call `get_section` instead of full file reads; `update_section` replaces Read → Edit pattern
- AGENT.md updated: session start step 2 uses `get_section` when MCP available; full Read as fallback for non-Claude environments

### Upgrade Guide
1. Add `## Archive` section to the bottom of each `status.md` (above any trailing content)
2. Update CLAUDE.md File Access section to use `get_section` on keyword trigger (see current CLAUDE.md)
3. If using the kai-tools MCP server: pull `setup/mcp-tools/server.js` — new tools are additive, no breaking changes

---

## [1.4] — 2026-04-11

### Added
- **kai-tools MCP server** — BM25 file search across the workspace; replaces manual grep for finding content; multi-root directory support
- **`_meta/VISION.md`** — documents the philosophy and pointer architecture behind MetaTemplate

### Changed
- MCP server renamed from kai-search → kai-tools; folder moved to `setup/mcp-tools/`
- SESSION.md header standard fixed — dates moved from headers into section bodies for `get_section` compatibility

### Upgrade Guide
1. If you have an existing kai-search server: rename `setup/mcp-search/` → `setup/mcp-tools/`; update `.mcp.json` and `settings.local.json` with new name
2. Update your SESSION.md: move dates from `## Last Session Decisions 2026-XX-XX` → `## Last Session Decisions` with `*YYYY-MM-DD*` as first line inside the section

---

## [1.3] — 2026-03-30

### Added
- **M365 Copilot support** — `_template/.github/copilot-instructions.md` added; AGENT.md and QUICKSTART.md updated with Copilot environment instructions
- **`_meta/IMPROVEMENTS.md`** — running log for MetaTemplate improvement ideas surfaced during sessions
- **VISION.md trigger** in TRIGGERS.md — loads when philosophy/architecture topics come up

### Changed
- Health workstream files moved to external path (outside the repo) — health data stays private by default

### Upgrade Guide
1. Copy `_template/.github/copilot-instructions.md` into your workspace `.github/` folder if using Copilot
2. Add `_meta/IMPROVEMENTS.md` if missing (blank file with `## Improvements` header is enough)

---

## [1.2] — 2026-03-29

### Added
- **Platform setup scripts** — `setup/setup-mac.sh`, `setup/setup-windows.ps1`, `setup/setup-m365.md` for first-time workspace setup
- **`/setup` skill** — guided first-time workspace initialization
- **`_template/commands/`** — blank skill templates for workstream context injection

### Changed
- Repo restructured for clean sharing: private kAI repo separated from public MetaTemplate repo
- `.gitignore` switched to whitelist model — only public MetaTemplate files tracked in git
- AGENT.md and QUICKSTART.md promoted to repo root

### Upgrade Guide
1. Pull `setup/` directory — setup scripts are new, no conflicts expected
2. If you copied the old structure: AGENT.md and QUICKSTART.md are now at root, not in a subdirectory

---

## [1.1] — 2026-03-28

### Added
- **Persona system** — `_meta/PERSONAS.md` with per-workstream response modes; cross-cutting MetaTemplate observation rule
- **Ops workstream** — `ops/status.md`, `ops/project_plan.md` for session architecture and configuration tracking
- **`_meta/DECISIONS.md`** — structural/design decision log with rationale

### Changed
- Session architecture refactored — `/open` and `/close` are now the canonical entry/exit points
- CLAUDE.md overhauled: lazy-load model formalized, trigger map introduced, workstream pattern documented

### Upgrade Guide
1. Copy `_meta/PERSONAS.md` from the template — add your own workstream persona entries
2. Add `_meta/DECISIONS.md` if missing
3. Update CLAUDE.md to include the File Map and Behavior sections (see current CLAUDE.md)

---

## [1.0] — 2026-03-27

### Added
- Initial public MetaTemplate release
- `AGENT.md` — AI-agnostic session instructions (Claude Code, Copilot, paste-based)
- `QUICKSTART.md` — human onboarding guide for all three environments
- `/open` and `/close` skills — session start and close checklist
- `SESSION.md` — pointer table, active projects, immediate focus, last session decisions
- `_meta/TRIGGERS.md` — keyword→file lazy-load map
- `_meta/EXAMPLES.md` — 5 generic personalization examples

---

*Versioning is approximate — tied to meaningful capability additions, not calendar releases.*

# Skills Index

Skills are self-contained AI behavior definitions — no external connections, no writes to structured data stores.
This includes updates to loose-structured markdown files — those are skill operations, not MCP tool calls.

**User-invoked skills** are dispatched via `.claude/commands/` or invoked by name in paste-based sessions.
**Operational patterns** are used internally by Kai — not slash commands.

## Session Skills

| Skill | File | Purpose |
|---|---|---|
| `/open` | `open.md` | Session start — read SESSION.md, format greeting |
| `/close` | `close.md` | Session end — mechanical wrap-up, update SESSION.md |
| `/checkTokens` | `checkTokens.md` | Estimate current session token usage |

## Workstream Skills

Add one row per effort. Copy `_template/skills/openWorkstream.md` → `skills/open[EffortName].md` and add a dispatcher in `.claude/commands/open[EffortName].md`.

| Skill | File | Loads | Persona |
|---|---|---|---|
| *(add your workstreams here)* | | | |

## Operational Patterns

| Pattern | File | Purpose |
|---|---|---|
| `update-section` | `update-section.md` | Update a named `##` section in any status.md using Edit tool; auto-bumps `last_updated` |

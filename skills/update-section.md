# Update Section

Update a named section in a kAI status file using the Edit tool directly. This is the standard pattern for all section updates — no MCP tool required.

## Steps
1. Read the target file
2. Locate the `## [Section Name]` header
3. Replace the content between that header and the next `##` header with updated content
4. Update the `last_updated:` frontmatter field to today's date (YYYY-MM-DD)

## Rules
- Always update `last_updated` in the same Edit pass
- Preserve all other sections exactly — do not reformat or reorder
- For `## Active Work`: move completed items to `## Archive` in the same file
- Never touch `## Archive` unless explicitly asked

## When to use
- After a task completes or changes → update `## Active Work`
- After a priority shift → update `## Priority Summary`
- Any time a named section in a `status.md` changes during a session

Use `mcp__kai-tools__search_files` to locate the file if the path is uncertain, then Read before Edit.

Execute the session close checklist below in order. Do not skip steps.

Documentation happens during the session — `/close` is mechanical wrap-up only. Do not rewrite status files or IMPROVEMENTS.md here; that should already be done.

Today's date is available in the system context. Use it for all date fields.

## Session Close Checklist

### 1. Update Last Session Decisions in SESSION.md
Replace the existing `Last Session Decisions` list with the 5–10 most important decisions or changes from this session. One line each. Update the section date to today. Most significant first. Pull from what was already documented during the session — do not invent new entries.

### 2. Update `last_updated` frontmatter
In every file that was changed this session, update the `last_updated:` frontmatter field to today's date (YYYY-MM-DD format).

### 3. Confirm
Respond with exactly:
"All files updated — ready for next session."

---

## GitHub Push — MetaTemplate Only

Do NOT push to GitHub automatically at close. Only propose a push when this session included changes to:
- `_meta/` (DECISIONS, EXAMPLES, IMPROVEMENTS, PROCESS, VISION, HTML files)
- `_template/` (blank template files)
- `setup/` (setup scripts)
- `AGENT.md`, `QUICKSTART.md`, `README.md`, `CHANGELOG.md`

When a push is warranted, say:
"This session included MetaTemplate changes — push to GitHub? Here's what would be included: [list the changed files]"

Wait for [Your Name] to confirm before pushing.

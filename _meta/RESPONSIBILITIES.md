---
type: reference
topic: User vs. AI responsibility split — who owns what
---

# [Your Name] vs. AI — Responsibility Split

Clear rules for who owns what. The core principle: the user directs and decides; the AI executes and documents without being asked.

---

## User Owns

**Direction**
- States what to work on and why — the AI does not choose the agenda
- Provides context that isn't in the files (domain knowledge, recent events, constraints)
- States session focus before loading a workstream — one sentence that primes attention before content loads

**Decisions**
- Approves all structural changes before they happen — AI proposes, user confirms
- Has final say on judgment calls: what gets kept, cut, or changed
- Approves before: git push, file structure changes, destructive operations

**Tighter guidance on complex tasks**
- Step-gates multi-step tasks explicitly when the stakes are high: "Do step 1 only and wait"
- Restates key facts at the start of load-bearing prompts — don't assume the AI remembers
- Runs `/compact` when the session is getting long — the AI will flag when appropriate

---

## AI Owns

**Execution**
- Does the work when directed — no scope creep beyond what was asked
- States intent before acting on any structural or file-level change

**Documentation (happens at the moment of change — never deferred)**
- Updates `status.md` when priorities, active work, or decisions change
- Logs structural decisions to `_meta/DECISIONS.md` immediately
- Updates behavioral rules to memory files when established

**File access discipline**
- Uses section-level retrieval (`get_section`) instead of full file reads — always
- Uses search before loading when location is uncertain
- Falls back to full read only when section not found or full context is required

**Proactive surfacing (without being asked)**
- Flags approaching deadlines and blocked items
- Surfaces explicitly prioritized items — asks for status when they've been idle
- Offers structural improvements — does not implement without confirmation

**Session state**
- Maintains a working memory block in complex multi-step sessions
- Keeps `## Active Work` current throughout — never lets a session end with stale state
- Runs the full close checklist — does not invent entries, only captures what was documented

---

## Shared

| Area | User | AI |
|---|---|---|
| System improvements | Decides | Proposes and flags |
| Quality | Final accountability | First-pass correctness |
| Effort files | Owns the content | Maintains the structure |
| Memory | Explicit "remember this" | Proactive capture and mirroring |

---

## Why This Split Matters

The AI has no persistent attention between sessions and degrades in long sessions (see `_meta/LITM.md`). The user has context the AI will never have. The split works because each party does what they're actually good at — the user provides direction and judgment, the AI provides reliable execution and documentation.

When the split breaks down: if the user doesn't state focus or provide context, the AI guesses wrong. If the AI doesn't document at the moment of change, decisions get lost. Both sides holding their end is what makes sessions productive.

---
type: reference
topic: Lost-in-the-Middle (LITM) — strategies for keeping long sessions coherent
---

# Lost-in-the-Middle (LITM) — Strategies Reference

LITM is a well-documented LLM research finding: models attend strongly to the beginning and end of context, and weakly to the middle. Long sessions cause important instructions, decisions, and facts to drift into the middle — where they degrade. This file documents all known strategies ranked by implementation priority.

## Strategy Rankings

| # | Strategy | Effort | Value | Notes |
|---|---|---|---|---|
| 1 | `/compact` — proactive compaction | None (built-in) | High | Run after major tasks; before starting new ones |
| 2 | Attention priming | None | High | User states focus before loading any file |
| 3 | Explicit anchoring | None | High | User restates key facts in load-bearing prompts |
| 4 | Working memory block | None (AI starts doing it) | Medium-High | AI maintains active state block at top of responses |
| 5 | Position-aware prompting | Low (edit instruction file) | Medium | Critical rules at top AND bottom of CLAUDE.md / AGENT.md |
| 6 | Read discipline | Low (enforce in instructions) | Medium | Never `Read` a file when section-level retrieval will do |
| 7 | Chunked sequential processing | None | Medium | Step-gate complex tasks explicitly |
| 8 | Map-reduce (subagents) | High | High for large files | For genuinely large documents; not routine files |
| 9 | Hierarchical summarization | High | High for dense files | Multi-layer map-reduce; build once, reuse every session |

---

## Strategy 1: `/compact` — Proactive Compaction

**What it does:** Replaces the raw conversation history with a compressed summary. Frees up context headroom without restarting.

**What you lose:** Raw dialogue. Nuance that was only implied, not stated explicitly. (This is what LITM already degrades anyway.)

**Best practice:** Run after a major task completes, before starting a new one. Surface critical facts explicitly before running — anything important that was only implied may not survive compression.

**Industry term:** Context compression / context compaction.

---

## Strategy 2: Attention Priming

**What it does:** Before loading a file or starting a task, the user tells the AI what to focus on. Primes attention before content loads.

**Example:**
> "I'm looking at the health protocol changes around potassium — focus on that before reading the file."

**Cost:** Zero. One sentence before loading any file.

**Implementation:** Add a prompt to the `/open` skill reminding the user to state focus before loading a workstream. If they don't, ask.

**Industry term:** Instructional priming / prompt steering.

---

## Strategy 3: Explicit Anchoring

**What it does:** The user restates critical facts at the start of a prompt when they're load-bearing. Pins key context at the beginning of the message — the strongest attention zone.

**Example:**
> "Key facts: we decided X, we're focused on Y, Z is out of scope. Now — let's work on the next step."

**When to use:** Any time the request depends on a decision made earlier in the session, especially after long back-and-forth.

**Cost:** Zero. Adds 1-2 lines to a prompt.

**Industry term:** Context anchoring / explicit context injection.

---

## Strategy 4: Working Memory Block

**What it does:** The AI maintains a small active state block at the top of responses, updated as the session progresses. Keeps critical facts in the strong attention zone.

**Example block:**
```
**Session state:** Working on X | decision Y = confirmed | Z is next
```

**Cost:** Zero build work. AI starts doing it when instructed (or add to behavioral rules).

**Industry term:** Working memory / active context block.

---

## Strategy 5: Position-Aware Prompting

**What it does:** Critical rules placed at BOTH the beginning AND end of instruction files — not just the beginning. Models attend strongly to both ends, weakly to the middle.

**Implementation:** Add a "Critical Rules" section at the very bottom of your AGENT.md / CLAUDE.md that repeats the 4-5 most important behavioral rules.

**Industry term:** Position-aware prompting / boundary anchoring.

---

## Strategy 6: Read Discipline

**What it does:** Never load a full file when section-level retrieval will do. Full file reads load thousands of tokens that may not be needed — wasted context that pushes important content into the middle.

**Rule:** If a `kai-tools` MCP server is available, use `get_section` for targeted reads. If not, extract only the relevant section manually rather than reading the whole file.

**Industry term:** Retrieval discipline / selective context loading.

---

## Strategy 7: Chunked Sequential Processing

**What it does:** Breaks complex multi-step tasks into explicit numbered steps. Each step completes before the next starts. Prevents context drift across long tasks.

**User drives it:**
> "Step 1: update the status file. Step 2: update memory. Do step 1 only and wait."

**AI drives it:** Before a complex task, the AI states the steps and waits for confirmation before proceeding.

**Industry term:** Sequential task decomposition / step-gated execution.

---

## Strategy 8: Map-Reduce (Subagents)

**What it does:** For large documents, subagents process parallel chunks (map), then results are combined (reduce). The full document never enters main context.

**Example:**
```
3 subagents, each reading one section of a large file
→ each returns a 50-word summary
→ main context receives ~150 tokens instead of ~3000
```

**When it's worth it:** Only for genuinely large files where isolation value is high. NOT routine status files.

**Industry term:** Map-reduce / parallel distillation.

---

## Strategy 9: Hierarchical Summarization

**What it does:** Map-reduce with layers. Raw content → chunk summaries → combined summary. Each layer compresses further.

**When to use:** Very large, structured documents where you need the whole picture. Build chunk boundaries and summary prompts carefully — then reuse every session.

**Effort:** Highest of all strategies. Worth it only for files you read every session.

**Industry term:** Hierarchical summarization / recursive distillation.

---

## Recommended Implementation Order

**Do now — zero effort:**
1. Run `/compact` at the end of long sessions
2. State focus before loading any file (attention priming)
3. Restate key facts at start of load-bearing prompts (explicit anchoring)
4. Ask AI to maintain a working memory block

**Low effort — one session:**
5. Add attention priming prompt to `/open` skill
6. Add read discipline rule to top of instruction file
7. Add critical rules section to bottom of instruction file (position-aware)

**High effort — when ready:**
8. Design map-reduce subagent pattern for large files
9. Build hierarchical summarization for dense recurring files

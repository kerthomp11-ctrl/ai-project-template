Estimate token usage for the current session.

Review what has been loaded and discussed so far in this conversation, then produce a token usage table in this format:

| Item | ~Tokens |
|---|---|
| System prompt + CLAUDE.md + MEMORY.md | [estimate] |
| Files read this session (list them) | [estimate] |
| Conversation turns + tool outputs | [estimate] |
| **Total** | **[total]** |

Context window is 200K tokens. Show percentage used and a one-line status:
- Under 20%: "Plenty of room."
- 20–50%: "Getting substantial — keep an eye on it."
- 50–80%: "Consider /compact or wrapping up soon."
- Over 80%: "Update all files and start a fresh session."

Base your estimates on what you can observe: files read via tools, conversation length, known system prompt overhead (~2,000 tokens), CLAUDE.md (~1,500 tokens), MEMORY.md (~500 tokens). Be honest that these are estimates, not exact counts.

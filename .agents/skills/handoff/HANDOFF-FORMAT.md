# Handoff document format

Write the file with exactly these sections, in this order. Every section must be filled in — if one genuinely has nothing to report, say so plainly (`No open questions.`) rather than omitting the heading.

```markdown
# Handoff — {topic}

Generated {date}. Read this before touching anything else in this work.

## Next focus

{What the next session should do — the user's argument if one was given, otherwise the last thing in flight when this session ended.}

## Current state

{What's done and what's in progress, in plain sentences a reader with zero prior context can follow.}

## Key decisions

- {Decision} — {why it was made, only if the reasoning isn't already written down in a referenced artifact.}

## Open questions / blockers

- {Anything unresolved that the next session needs to pick up or ask about.}

## Related artifacts

- {path or URL} — {one line on what it holds and why it matters here.}

## Suggested skills

- **{skill-name}** — {why it fits the work's current state.}
```

## Rules

- `Related artifacts` links out; it never pastes in the content of a spec, plan, ADR, issue, commit, or diff that already exists on disk or upstream.
- `Key decisions` and `Current state` carry only what isn't already written down elsewhere — a decision fully explained in a linked ADR gets a one-line pointer here, not a restatement.
- Redact every API key, token, password, connection string, and PII value with `[REDACTED]` before any section is written, including inside quoted conversation excerpts.

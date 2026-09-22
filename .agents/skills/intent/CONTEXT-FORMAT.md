# .shipyard/work/{title}/context.md Format

What the sounding log covers, and where each part comes from.

```markdown
# Intent: {title}

**Date:** {date the heading was confirmed}
**Tier:** Shallow | Moderate | Deep

## Request
{the original ask, as given}

## Discovery
- Q: {question asked in step 2}
  A: {answer given}
- Q: ...
  A: ...

## Confirmed heading
- **Objective:** ...
- **Constraints:** ...
- **Success looks like:** ...
```

- **Date** — the date of confirmation, not the original request, if the two differ.
- **Tier** — the tier from step 1, after any reclassification.
- **Request** — the task as the user first framed it, lightly trimmed for clarity, not rewritten.
- **Discovery** — every question-and-answer pair from step 2, in order. Empty (omit the section) only if the tier was Shallow-reclassified-to-Deep with no questions yet asked before this write.
- **Confirmed heading** — the exact objective, constraints, and success marker stated back to the user in step 3, verbatim.

On a follow-up to the same task: append new Q&A pairs to Discovery in place, and overwrite Confirmed heading with the latest state — the file always reflects the current agreed heading, not a history of every revision.

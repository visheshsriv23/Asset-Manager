# .shipyard/README.md Format

Every Shipyard skill writes its output somewhere under `.shipyard/`. This file is the one index every skill reads and writes to, so anyone opening the repo can see everything Shipyard has generated without searching the directory by hand.

## Location

`.shipyard/README.md`.

## If it doesn't exist yet

Create `.shipyard/` and this file with the skeleton below, then fill in only the section your skill just wrote to — leave the rest as placeholders for whichever skill runs next:

```markdown
# Shipyard Output

Index of everything Shipyard has generated in this repo. Check here before searching `.shipyard/` by hand.

## Knowledge Base

_Not yet docked — run `dock` to generate `context.md` and the knowledge base below._

## Work

| Work | Context | Spec | Worklist |
|---|---|---|---|

## Branch Reviews

_None yet._

## Handoffs

_None yet._
```

## If it already exists

Never regenerate it from scratch. Update only the section(s) your skill touched; leave every other section exactly as found.

## Section rules

### Knowledge Base

Written by `dock` only. Replace the placeholder line with one linked bullet per file it wrote, `context.md` first:

```markdown
- [context.md](./context.md) — digest, read this first
- [architecture.md](./architecture.md)
- [project-overview.md](./project-overview.md)
- [business-domain.md](./business-domain.md)
- [coding-conventions.md](./coding-conventions.md)
- [api.md](./api.md)
- [glossary.md](./glossary.md)
- [decisions.md](./decisions.md)
- [setup.md](./setup.md)
```

### Work

Written by `intent`, `blueprint`, and `worklist`. Each `{work-name}` gets exactly one row. If the row doesn't exist, add it; if it does, fill in only the column you just wrote — never touch another skill's column in that row. Use `—` for a column not written yet:

```markdown
| {work-name} | [context.md](./work/{work-name}/context.md) | [spec.md](./work/{work-name}/spec.md) | [worklist.md](./work/{work-name}/worklist.md) |
```

### Branch Reviews

Written by `branch-review`. Append one bullet per report, newest last:

```markdown
- [branch-review-{source}-into-{target}.md](./branch-review-{source}-into-{target}.md)
```

### Handoffs

Written by `handoff`. Append one bullet per handoff doc, newest last:

```markdown
- [{topic-slug}-{date}.md](./handoff/{topic-slug}-{date}.md)
```

# .shipyard/context.md Format

The concise digest — 300–500 lines, prioritizing whatever an agent needs before its first edit over completeness. Written for any AI agent, so it names no specific tool, model, or CLI.

## Sections, in order

1. **Project purpose** — 2–4 sentences.
2. **Tech stack** — language(s), framework(s), package manager, build/test/lint tools, from survey step 1.
3. **Architecture summary** — one paragraph plus the component list, condensed from `.shipyard/architecture.md`.
4. **Important folders** — an annotated tree, top two levels, one line of purpose per entry.
5. **Coding conventions** — the ~10 conventions most likely to matter on a first change; the full checklist lives in `.shipyard/coding-conventions.md`.
6. **Testing strategy** — frameworks in use, how to run them, and any coverage expectation found in CI config.
7. **Commands** — build, lint, format, test, dev; copy-pasteable, verified against the manifest.
8. **Deployment overview** — where it deploys and the pipeline file that does it, if inferable.
9. **Common terminology** — ~10 project-specific terms; the full glossary lives in `.shipyard/glossary.md` (or `CONTEXT.md`, if that's where the domain-modeling skill keeps it).
10. **Known constraints** — performance limits, unsupported patterns, deprecated modules to avoid, clusters of TODO/FIXME that signal a rough edge.
11. **Links to docs** — all eight `.shipyard/*.md` files, one grounded line each.

## Length budget

300–500 lines. When a section threatens to blow the budget, that's a signal the detail belongs in the matching `.shipyard/` file, not here — push it down, leave one grounded line and a link. Prioritize what an agent needs before its first edit; everything else can wait one hop away.

# Shipyard Blueprint

**intent** takes the sounding and logs it to `context.md`; this skill drafts the blueprint from that sounding — the plans the yard builds from, not another round of soundings. Every line in the blueprint is **grounded**: traceable to a confirmed decision in `context.md`, the conversation, or the codebase itself, never a guess standing in for one.

## Process

1. Identify `{work-name}` from the command argument or the current conversation. Ask only if it can't be determined from either.
2. Read `.shipyard/work/{work-name}/context.md` as the primary source. Draw on the current conversation only to fill gaps `context.md` leaves open.
3. Ground the blueprint in what already exists — architecture, terminology, conventions, related features, tests, ADRs. Prefer the docked knowledge base when present (`.shipyard/context.md`, `.shipyard/architecture.md`, `.shipyard/coding-conventions.md`, `.shipyard/decisions.md`, `.shipyard/glossary.md` — [dock](../dock/SKILL.md)'s output) over inspecting the repository fresh; fall back to direct inspection only for what those docs don't cover, or if they don't exist. Enough to write confidently, not a full audit.
4. Write `.shipyard/work/{work-name}/spec.md` following [SPEC-FORMAT.md](./SPEC-FORMAT.md). If the file already exists, update it in place, preserving whatever still holds rather than regenerating from scratch.
5. Update `.shipyard/README.md` per `../dock/INDEX-FORMAT.md` — add or update the `{work-name}` row's Spec column, leaving its Context/Worklist columns as found.
6. Run every item in Final checks below before reporting done.
7. Report done and suggest running **worklist** next to turn the spec into a tracer-bullet worklist.

Done when `spec.md` exists at that path, follows SPEC-FORMAT.md's structure, every Final check passes, and `.shipyard/README.md` reflects it.

## Rules

- Treat the discovery interview as closed material to draw from, not a conversation to reopen — the questions were already asked in `context.md` or this session.
- Ground every requirement and decision in `context.md`, the conversation, or the codebase; anything short of that belongs under Assumptions or Open Questions, not stated as fact.
- Label every entry in Implementation Decisions as either a confirmed decision or a recommendation — never let the two blur together.
- Use the project's own terminology and respect its existing ADRs rather than introducing new vocabulary.
- Describe behavior and contracts. Leave out code snippets and file paths unless a path is itself the contract.
- Scope every write to `spec.md` — `context.md`, application code, and unrelated files stay untouched.
- Leave publishing, committing, and pushing to the user; this skill only writes the file.
- Never start implementing the spec, even partially, in the same turn. Once `spec.md` is written, stop and report done — building from it is a separate step the user starts explicitly, later.

## Final checks

Before reporting done, confirm all of the following:

- Every decision confirmed in `context.md` or the conversation appears somewhere in the blueprint.
- Every Functional Requirement is objectively testable.
- Nothing unconfirmed is stated as fact — it's under Assumptions or Open Questions instead.
- Assumptions and Open Questions are each labeled and numbered (`A-001`, `OQ-001`, ...).
- A reader who has never seen `context.md` can understand the blueprint on its own.
- The file is saved at `.shipyard/work/{work-name}/spec.md`.

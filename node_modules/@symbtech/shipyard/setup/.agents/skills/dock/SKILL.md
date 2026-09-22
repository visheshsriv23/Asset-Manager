# Shipyard Dock

A ship gets outfitted at dock before it sails; this skill outfits a repo with the knowledge base an AI agent needs before it starts changing code. Every document is **grounded** in this specific codebase — one that could have come from any project rather than only this one has failed its purpose.

The knowledge base has two tiers: `.shipyard/*.md` carries the full depth, `.shipyard/context.md` is the concise digest that links back to it. Everything this skill writes lives under `.shipyard/` and is indexed from `.shipyard/README.md`. Write for **any** agent — Claude, Codex, ChatGPT, whatever opens this repo next — so neither file names a specific tool, model, or CLI.

## Process

### 1. Survey the stack

Determine, from manifests and config files — not assumptions:

- **Language(s) and framework(s)**
- **Package manager** — from the lockfile present (`package-lock.json` → npm, `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lockb` → bun, `Cargo.lock` → cargo, `poetry.lock`/`Pipfile.lock` → Poetry/pipenv, `go.sum` → Go modules, etc.)
- **Build tool(s)**
- **Testing framework(s)**
- **Lint/format tool(s)**
- **Monorepo structure** — `workspaces` in `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `lerna.json`
- **App/package/service boundaries** — `apps/`, `packages/`, `services/`, `libs/` and similar top-level directories, each with its own manifest

Every one of these seven categories needs an explicit finding — "none detected" is a finding, silence is not. Where a monorepo is detected, list every app/package/service by path; that list feeds the folder map in `project-overview.md` and `context.md`.

### 2. Detect conventions

Read actual source files, not just config, to answer every item on the checklist below. Ground each finding in a cited file or pattern; whatever you can't confidently ground, mark **not applicable** rather than guess:

- Naming conventions (files, dirs, variables, components, tests)
- Folder structure (by feature, by type, domain-driven, etc.)
- Component patterns (if a UI framework is present)
- State management (library, and where state lives)
- API patterns (how callers reach the backend, error envelope shape)
- Database access patterns (ORM/query builder, migrations, transactions)
- Authentication approach (mechanism, where checks live)
- Error handling (how errors propagate and surface)
- Logging (library, levels, destination)
- Environment variables (how they're loaded and validated)
- Feature flag system (if any)
- Dependency injection (if the language/framework uses it; else not applicable)

This feeds `.shipyard/coding-conventions.md` directly — see `.agents/skills/dock/DOCS-FORMAT.md` for the write-up shape.

### 3. Scaffold .shipyard/

Create `.shipyard/` if it doesn't exist. Write the eight files below using `.agents/skills/dock/DOCS-FORMAT.md` for what each one covers:

`architecture.md`, `project-overview.md`, `business-domain.md`, `coding-conventions.md`, `api.md`, `glossary.md`, `decisions.md`, `setup.md`

Two rules bind every file:

- **Grounded, not templated.** Every section names real files, real commands, real module names pulled from steps 1–2. A section with nothing to say states that plainly ("no API surface — this is a CLI-only package") rather than filling space.
- **Never write secret values.** Reference environment variable names only, even where a real value is visible in a local `.env` — the value never leaves the machine it's on.

If a file already exists, it's prior work: keep its existing prose untouched and only add what's missing, rather than regenerating it wholesale.

Done when all eight files exist under `.shipyard/`, each grounded per above.

### 4. Write context.md

Before writing, check what already answers to that name inside `.shipyard/` — filesystems that ignore case (the macOS/Windows default) mean `context.md` and `CONTEXT.md` are the same file:

- If a same-named file already has the `## Language` glossary shape (the `domain-modeling` skill's format), that file is the domain glossary, not this digest — leave it untouched and write this digest to `.shipyard/AI-CONTEXT.md` instead, with each file linking to the other.
- If a same-named file already matches this digest's own shape (the section list in `.agents/skills/dock/DIGEST-FORMAT.md`), this is a refresh — update it in place.
- Otherwise, create `.shipyard/context.md` fresh.

Follow `.agents/skills/dock/DIGEST-FORMAT.md` for the section list and length budget (300–500 lines). When a section threatens to blow the budget, push the depth down into the matching `.shipyard/` file and leave one grounded line plus a link here — the same progressive disclosure this skill's own documentation follows, applied to the repo you just docked.

Done when the digest exists, sits within budget, carries every required section, and links every file under `.shipyard/`.

### 5. Index it

Update `.shipyard/README.md` per `.agents/skills/dock/INDEX-FORMAT.md` — create it from the skeleton if this is the first Shipyard output in this repo, otherwise replace only its Knowledge Base section with a linked bullet per file written in steps 3–4.

### 6. Report

Tell the user what was created, what was refreshed, and what was left untouched because it already existed. Flag anything steps 1–2 couldn't ground confidently (an undetectable deployment target, a business rationale no comment or doc explains) as a question for the user rather than a guess baked into the docs. These are plain files under version control — point out that `git diff` shows exactly what landed, before anything is committed.

# .shipyard/*.md Format

What each of the eight files covers, and what to derive it from. Every section is **grounded**: name the real file, command, or module that backs the claim. A section with nothing to ground states that plainly instead of being generated anyway.

## project-overview.md

**Purpose:** what the project is, who it's for, its top-level goals.

**Sections:**

- What this is — 2–4 sentences, derived from the README and manifest description/name.
- Core capabilities — a bullet list derived from routes, top-level modules, or CLI commands, not from marketing copy.
- Repo layout at a glance — the top one or two levels of the tree, one line of purpose per entry. For a monorepo, this is the app/package/service list from survey step 1.
- Related docs — links to the other seven files.

## architecture.md

**Purpose:** how the system is put together.

**Sections:**

- Components and how they talk — the major services/modules and the protocol between them (HTTP, queue, direct call, shared DB). A short diagram (ASCII or Mermaid) if there's more than one component.
- Primary data flow — trace one representative request or job end to end through the modules that handle it.
- Key layers and responsibilities — derived from the folder structure (e.g. controllers/services/repositories, or app/components/hooks/lib).
- External dependencies — third-party APIs, databases, queues, found via config files and SDK imports, not guessed.
- Deployment topology — only if inferable from a Dockerfile, k8s manifest, `vercel.json`, `serverless.yml`, or CI deploy step. State "not inferable from the repo" otherwise.

## business-domain.md

**Purpose:** the real-world problem the software models, in plain language.

**Sections:**

- Core entities and processes — derived from model/entity/type names, database schema, and the dominant nouns in the code, not invented.
- Key workflows — the user- or system-journeys the code implements.
- Domain rules found in code or comments — cite the file.

If a root `CONTEXT.md` already exists (the `domain-modeling` skill's glossary), link to it instead of restating its definitions — one source of truth for domain terms.

## coding-conventions.md

**Purpose:** the write-up of survey step 2's checklist.

One subsection per checklist item from step 2. Each subsection: the finding, and the file(s) or pattern it's grounded in — or "not applicable" with a one-line reason (e.g. "no DI — the language has no container convention").

## api.md

**Purpose:** every externally callable surface.

List whichever apply: HTTP routes/controllers, GraphQL schema, RPC/gRPC services, CLI commands, public package exports. For each: method/route/command, purpose, auth requirement, request/response shape if easily derived from types or handler code.

If the project has no such surface (a pure library, a frontend-only app with no routes), say so explicitly — don't omit the file or leave it templated.

## glossary.md

**Purpose:** project-specific vocabulary — acronyms, internal names for entities/services, jargon that recurs in code, comments, or commit messages and would confuse a newcomer. Not general programming terms (those don't belong even if heavily used).

If a root `CONTEXT.md` already exists (the `domain-modeling` skill's glossary), link to it rather than duplicate its entries.

## decisions.md

**Purpose:** a lightweight decision log.

Seed it from whatever history is inferable: existing ADRs (`docs/adr/`, `decisions/`, RFC directories), CHANGELOG entries that state a rationale, or code comments explaining "why" rather than "what". One entry per decision: Decision / Context / Consequence. If nothing is inferable, write a single entry noting that no prior decision record was found, rather than leaving the file blank.

## setup.md

**Purpose:** how a new contributor — human or agent — gets the project running locally.

**Sections:**

- Prerequisites (runtime versions, system dependencies).
- Install command, from the package manager identified in survey step 1.
- Environment variables required — names only, never values, even when a real value is visible in a local `.env`.
- Commands to run dev, build, test, and lint — copy-pasteable, verified against the actual scripts in the manifest or Makefile, not assumed.

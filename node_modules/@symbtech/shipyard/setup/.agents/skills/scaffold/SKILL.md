This skill never writes a project file until a plan has been confirmed. Rushing to scaffold before the plan is settled is the one failure mode to guard against throughout.

## 1. Establish project type

Ask what's being built: backend, frontend, or full-stack (both) also confirm programming language, framework before choosing starting to create any project setup. If the user's request already states this unambiguously, confirm it back rather than re-asking.

Done when: project type is confirmed, and — for full-stack — both sides are identified separately.

## 2. Select the guide(s)

Map the confirmed project type/stack to a guide using the **Technology Guides** table below — the single source of truth for the mapping, kept here rather than in `CLAUDE.md`/`AGENTS.md` so it only loads when this skill fires, not on every prompt.

| Stack | Side | Guide |
|---|---|---|
| Next.js | Frontend | `.agents/skills/scaffold/references/next-js.md` |
| Python + FastAPI | Backend | `.agents/skills/scaffold/references/python-fastapi.md` |

- Full-stack: select one guide per side.
- No entry matches the requested stack: there is no org standard for it yet. This becomes an **ad hoc** scaffold — proceed, but it must be clearly flagged as non-standard at every later step (plan, and again in the scaffolded output itself).
- An entry exists: never substitute a different architecture. The guide is authoritative.

## 3. Gather requirements

Ask the full checklist in one batch, not one question per round trip:

- Project name
- Target directory/path to scaffold into
- Confirmation of the stack(s) selected in step 2
- Any **flagged decision** the guide itself calls out as something to ask the user, read the guide far enough in step 4 to know what these are before asking.

Wherever an item has a known, enumerable set of valid answers (stack confirmation, a flagged decision like choice of auth mechanism), present it as selectable options rather than open text. Free-text items (name, path) belong in the same batch alongside the option-based ones — don't split them into a separate round trip.

If the request is still vague or underspecified after this checklist — unclear scope, conflicting requirements, requirements that don't map cleanly to the checklist — interview the user relentlessly about every aspect of the plan until a shared understanding is reached:

- Walk down each branch of the design tree, resolving dependencies between decisions one by one.
- For each question, provide your recommended answer.
- Ask questions one at a time, waiting for feedback on each before continuing — asking multiple at once is bewildering.
- If a question can be answered by exploring the codebase, explore the codebase instead of asking.

Don't do this when the checklist already produced clear answers; that's needless overhead.

Done when: every checklist item has an explicit answer, and every flagged decision in the selected guide(s) has been resolved — never silently defaulted.

## 4. Read the guide(s) in full

Open the exact file the table entry pointed to in `.agents/skills/scaffold/` and read it completely, not just the layout section — required env vars, local commands, and any "ask the user" call-outs all shape the plan in step 5.

For an ad hoc (no-guide) stack, there's nothing to read; design a reasonable minimal structure instead.

## 5. Present the plan and get confirmation

Summarize before writing anything:

- Stack(s) and which guide governs each (or an explicit "**no organization guide — ad hoc, non-standard**" call-out)
- Target path
- Resolved flagged decisions
- Top-level structure about to be created

Wait for explicit user go-ahead. Do not scaffold on an implicit or assumed yes.

## 6. Scaffold

- Guide-governed stack: reproduce its file/directory layout, commands, and config exactly as specified. Don't add domain models, business logic, or routes beyond what the guide's skeleton defines unless the user explicitly asked for them.
- Ad hoc stack: build the structure from the plan, and mark it clearly in the scaffolded output (e.g. a top-level note) as not following an organization guide.
- Full-stack: scaffold each side as its own guide-governed subdirectory (e.g. `backend/`, `frontend/`) under one project root, unless the user specified a different layout.

Done when: every file and directory the guide's layout section enumerates exists on disk, for every guide involved. Suggest running **dock** next to establish the knowledge base future work will build on, while the stack and conventions are still fresh.

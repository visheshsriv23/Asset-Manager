# Shipyard Handoff

A fresh agent starting the next session has none of this conversation's context — this skill compacts it into a **cold-start** document that agent reads before touching anything else. It lives under `.shipyard/handoff/`, alongside the rest of Shipyard's durable output, indexed from `.shipyard/README.md` like every other artifact.

## Workflow

1. Determine the focus. If the command carried an argument, treat it as what the next session will work on and let it decide what to emphasize or compress. Otherwise infer the focus from wherever this conversation left off.
2. Inventory the durable artifacts that already carry this work's context instead of re-deriving them: `.shipyard/work/{work-name}/spec.md` and `worklist.md`, `.shipyard/*.md` ([dock](../dock/SKILL.md)'s output), ADRs, linked issues or PRs, and current git state (`git status`, `git diff`, recent `git log`). The handoff doc points at each by path or URL — it never restates their content.
3. Write the handoff following [HANDOFF-FORMAT.md](./HANDOFF-FORMAT.md), scanning every value that lands in it for API keys, tokens, passwords, connection strings, and PII, and replacing each with `[REDACTED]` before it touches disk — this file is committed to the repo, so a leaked secret here is as exposed as one in code.
4. Create `.shipyard/handoff/` if it doesn't exist, and save as `.shipyard/handoff/<topic-slug>-<date>.md`.
5. Update `.shipyard/README.md` per [dock](../dock/SKILL.md)'s `INDEX-FORMAT.md` — append the new file under Handoffs.
6. Report the full saved path and a short summary of what it contains, and tell the user to open a fresh session pointed at that file.

Done when the file exists at `.shipyard/handoff/<topic-slug>-<date>.md`, every HANDOFF-FORMAT.md section is filled in (a section with nothing to say states that plainly, not silently omitted), no secret or PII pattern survives in it, `.shipyard/README.md` lists it under Handoffs, and its path has been reported.

## Suggested skills section

The doc's own "Suggested skills" section names what the next session should run and why, picked from the work's actual state — not a fixed list:

- No `.shipyard/` knowledge base yet → [dock](../dock/SKILL.md).
- The next focus is still unclear or underspecified → [intent](../intent/SKILL.md).
- No `spec.md` for this work yet → [blueprint](../blueprint/SKILL.md).
- `spec.md` exists, no `worklist.md` → [worklist](../worklist/SKILL.md).
- `worklist.md` has bullets left unapproved → [implement](../implement/SKILL.md).
- A bug or regression was being chased, not yet fixed → [bughunt](../bughunt/SKILL.md).
- The work is complete and headed toward merge → [branch-review](../branch-review/SKILL.md).

Name every skill that plausibly fits, not just the first match — a session can be mid-implementation on one work item and about to review another.

## Rules

- Never duplicate content already captured in a spec, plan, ADR, issue, commit, or diff — reference it by path or URL.
- Save under `.shipyard/handoff/` only; never elsewhere in the repo.
- Redact before writing, not after.
- Leave committing, publishing, and pushing to the user.

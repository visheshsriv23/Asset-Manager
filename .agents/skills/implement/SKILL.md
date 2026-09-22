# Shipyard Implement

**worklist** hands off an approved `worklist.md` and its `spec.md`; this skill burns the worklist down — one **tracer bullet** at a time, stopping for the user's inspection after every single one. Passing tests, finished code, and enthusiasm are not the gate: only the user's own explicit word moves a bullet from `Verified` to `Approved`.

## Process

Repeat this cycle until every tracer bullet is `Approved`:

1. Identify `{work-name}` from the command argument or the conversation, and locate `.shipyard/work/{work-name}/worklist.md` and `.shipyard/work/{work-name}/spec.md`. Ask only if neither can be found.
2. Re-read both in full, plus the current repository state — never assume an earlier read still holds. If the repo has been docked (`.shipyard/coding-conventions.md`, `.shipyard/api.md` — [dock](../dock/SKILL.md)'s output), check those first for the conventions to follow instead of re-deriving them from scratch each pass.
3. Select the tracer bullet the user pointed to, or else the first one that is not yet `Approved`, in worklist order. Set its status to `In Progress`.
4. Implement exactly what that bullet's scope defines — its own slice, nothing borrowed from a later bullet and nothing beyond it.
5. Add or update tests at the highest behavioral level the change supports.
6. Run focused verification for the change, then the broader test suite when that's practical.
7. Record in the worklist, per [IMPLEMENT-FORMAT.md](./IMPLEMENT-FORMAT.md): files or modules touched, verification commands and results, user-visible behavior, and any limitations.
8. Set the bullet's status: `Verified` when implementation and verification both succeed, `Implemented` when the code is done but verification couldn't run, or `Blocked` when it can't proceed. Leave its approval `Pending` regardless of which.
9. Update the worklist's overall progress summary, report the result per Human approval gate below, and stop.

## Status lifecycle

- `Pending` — not yet started.
- `In Progress` — implementation underway.
- `Implemented` — code complete, verification not yet run.
- `Verified` — implementation and verification both passed.
- `Changes Requested` — the user asked for corrections on this same bullet.
- `Blocked` — cannot proceed; say why.
- `Approved` — the user said so, explicitly.

```text
Pending → In Progress → Implemented → Verified → Approved
```

Only the user moves a bullet from `Verified` to `Approved` — nothing in this skill's own hands, however positive, makes that move on their behalf.

## Human approval gate

Every stop reports: what was implemented, what to inspect, files touched, verification results, any limitations, and the next proposed tracer bullet. Then the user picks one:

- **Approve and continue** — mark the bullet `Approved` with a short approval note, update the progress summary, and run the cycle exactly once more for the next bullet.
- **Request changes** — mark it `Changes Requested`, fix only this same bullet, re-verify, and report again. Never advance to the next bullet on this path.
- **Stop** — end here; nothing further runs until the user resumes.

A completed worklist, a passing test run, or a vague "looks good" is none of these three — treat anything short of an explicit choice as staying on `Verified`, not `Approved`.

## Completion

Mark the worklist `Completed` only once every tracer bullet is `Approved`, its verification passed, a final full test run has been recorded, and that evidence is written to the worklist. Then hand off three artifacts, written for a non-technical reader — plain outcomes, never file names, stack traces, or test names — appended to the worklist under a `## Handoff` section before being presented to the user:

1. **Summary** — what the feature now does for its user, in a few plain sentences.
2. **Manual test plan** — a numbered list of steps a non-technical person can follow by hand (open X, do Y, expect Z) to confirm it works, covering every tracer bullet's user-visible result.
3. **JIRA comment** — a short, professional, ready-to-paste note stating the work is complete and what the reader can now do or expect. State the outcome and the next action only; a technical status report belongs in the worklist, not here.

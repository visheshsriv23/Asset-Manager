# Shipyard Worklist

**blueprint** hands off a confirmed `spec.md`; this skill turns it into a **Tracer Bullet** worklist — thin, ordered slices that each punch through every layer the feature touches (UI, API, business logic, persistence, tests) far enough to prove the path works, rather than building one layer to completion before the next. Executing that worklist is **implement**'s job, not this skill's — building the worklist is not permission to start it.

## Building the worklist

1. Identify `{work-name}` from the command argument or the current conversation. Ask only if it can't be determined from either.
2. Read `.shipyard/work/{work-name}/spec.md` — blueprint's output — as the primary specification if it exists. Otherwise use whatever PRD or spec the user points to, or the confirmed intent already established in the conversation; ask only if none of these give enough to decompose.
3. Decompose responsibly using existing architecture, conventions, related features, and the test seams already in place. Prefer the docked knowledge base when present (`.shipyard/context.md`, `.shipyard/architecture.md`, `.shipyard/coding-conventions.md` — [dock](../dock/SKILL.md)'s output) over inspecting the repository fresh; fall back to direct inspection only for what those docs don't cover, or if they don't exist. Enough to slice confidently, not a full audit.
4. Decompose the feature into tracer bullets. Each one is the smallest slice that goes end-to-end through every layer the feature actually needs — never a whole layer finished in isolation (all the UI, then all the API). Order them so the riskiest architectural assumption fires first; breadth and polish come later, once the path is proven.
5. Write `.shipyard/work/{work-name}/worklist.md` following [WORKLIST-FORMAT.md](./WORKLIST-FORMAT.md). If it already exists, update in place — keep every `[x] Completed` bullet and its Approval Log rows untouched, and only add, reorder, or revise bullets that haven't shipped yet.
6. Update `.shipyard/README.md` per `../dock/INDEX-FORMAT.md` — add or update the `{work-name}` row's Worklist column, leaving its Context/Spec columns as found.
7. Run every item in Final checks below, then report the worklist and stop.
8. Suggest running **implement** next to execute the worklist one tracer bullet at a time.

Done when `worklist.md` exists at that path, follows WORKLIST-FORMAT.md's structure, every Final check passes, and `.shipyard/README.md` reflects it.

### Final checks

- Every tracer bullet is a vertical slice through all layers the feature touches, not a single-layer task.
- Every bullet names a concrete Verification method and Completion criteria — "works" is not a criterion.
- Bullets are ordered for earliest architectural validation, not by convenience or file order.
- Progress's Completed/Total counts match the actual bullet statuses.
- The file is saved at `.shipyard/work/{work-name}/worklist.md`.

## Rules

- This skill only writes `worklist.md` and its `.shipyard/README.md` entry; it never executes a tracer bullet or touches application code — that's implement's job.
- Leave committing, publishing, and pushing to the user.

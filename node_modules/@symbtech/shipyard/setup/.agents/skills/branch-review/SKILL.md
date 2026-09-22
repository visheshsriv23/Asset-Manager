# Shipyard Branch Review

Review branch diffs for merge readiness and write the final report to a markdown file.

## Inputs

Require:
- source branch name
- target branch name

Optional:
- output file path

If the user does not provide an output path, write the report to:
`.shipyard/branch-review-<source>-into-<target>.md`

Normalize branch names in file names by replacing `/` with `-`.

## Workflow

1. Inspect repository safety first.
- Run `git status --short`.
- If the worktree is dirty and checkout would be risky, stop and tell the user the review is blocked by local changes. Do not reset, stash, or discard changes.

2. Sync exactly as requested.
- Checkout `master`.
- Pull the latest `master`.
- Checkout the source branch.

If `git pull` or branch checkout needs approval or fails because of sandbox/network restrictions, request escalation instead of skipping the step.

3. Build review context against the target branch.
- Prefer `origin/<target>` when that remote branch exists.
- Otherwise compare against the provided target branch name directly.
- Gather:
  - `git diff --stat <target>...<source>`
  - `git diff --name-only <target>...<source>`
  - `git log --oneline --no-merges <target>..<source>`
  - targeted diffs for changed files
- If the repo has been docked (`.shipyard/architecture.md`, `.shipyard/coding-conventions.md`, `.shipyard/decisions.md` — [dock](../dock/SKILL.md)'s output), read them too — they're the fastest way to judge whether the diff fits the existing architecture, style, and ADRs instead of inferring it from the diff alone.

4. Review with a code-review mindset.
- Prioritize:
  - bugs and behavioral regressions
  - unsafe assumptions
  - accessibility issues
  - API or contract mismatches
  - missing validation or documentation when it affects correctness
- Keep summaries brief; findings come first.
- If there are no findings, say so explicitly and note residual risks or missing verification.

5. Write the markdown report file.
- Use the template in `.agents/skills/branch-review/assets/report-template.md`.
- Replace placeholders with actual values.
- Add a `Change Summary` section that briefly explains what changed in the branch and what areas or behaviors are impacted.
- Keep findings ordered by severity.
- Add a final `Safe to merge` section with a direct recommendation:
  - `Yes` when no findings block the merge
  - `No` when findings make the branch unsafe to merge
- Include clickable absolute file paths when referencing files.

6. Index it. If the report was written to the default `.shipyard/` path, update `.shipyard/README.md` per [dock](../dock/SKILL.md)'s `INDEX-FORMAT.md` — create it from the skeleton if it doesn't exist yet, otherwise append a bullet linking the new report under Branch Reviews. Skip this step if the user gave an explicit output path outside `.shipyard/`.

7. Answer the user with the feedback list and the report path, and suggest running **md-to-pdf** next if they want a shareable PDF version of the report.

## Review Rules

- Use findings-first output.
- Each finding must include:
  - priority label like `P1`, `P2`, or `P3`
  - short explanation of impact
  - file reference with line number when available
- Keep `Change Summary` brief and factual. Focus on the changed components, features, or behaviors and their likely impact surface.
- `Safe to merge` must be explicit, not implied.
- Do not invent issues to fill the report.
- Do not modify application code unless the user explicitly asks for fixes.

## Report Structure

Follow the checklist in `.agents/skills/branch-review/references/review-checklist.md` and write the final markdown file using `.agents/skills/branch-review/assets/report-template.md`.

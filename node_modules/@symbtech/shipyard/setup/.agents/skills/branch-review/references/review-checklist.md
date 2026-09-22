# Review Checklist

Use this checklist while reviewing a source branch against a target branch.

## Context

- Confirm the comparison base branch.
- Inspect changed files and commit list first.
- Read the changed code before forming conclusions.

## Findings Priority

- `P1`: likely broken behavior, merge blocker, or serious regression
- `P2`: meaningful correctness, accessibility, or API risk
- `P3`: lower-severity issue, incomplete validation, or maintainability risk that still matters for merge readiness

## What To Look For

- Runtime bugs
- Regressions in existing behavior
- Accessibility regressions
- Incorrect or incomplete docs when they misstate behavior
- Unsafe public APIs or defaults
- Missing cleanup, invalid assumptions, and state bugs

## What To Include In Report

- Source branch
- Target branch
- Review date
- Changed files summary
- Change summary
- Findings ordered by severity
- `No findings` statement if clean
- Residual risks or unverified areas
- Safe to merge recommendation

## What Not To Do

- Do not rewrite the branch unless asked
- Do not hide uncertainty; call out missing verification
- Do not bury findings under long summaries

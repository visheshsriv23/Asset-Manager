# .shipyard/work/{work-name}/worklist.md Tracking Fields

Builds on worklist's `WORKLIST-FORMAT.md` — never restructure or delete what's already there; only add what's below where it's missing, and only for bullets this skill is executing.

## Per tracer bullet

Each `### {n}. {outcome}` bullet already carries a `- Status:` line. Once execution starts, write that field using this skill's status words (`Pending`, `In Progress`, `Implemented`, `Verified`, `Changes Requested`, `Blocked`, `Approved`) instead of the four-glyph set — the extra states this skill needs (`Verified` vs `Approved`, `Changes Requested`) don't fit the glyph vocabulary. Add these lines beneath the bullet's existing fields if they aren't already present:

```markdown
- Implementation: {files or modules changed, in one line or a short list}
- Verification: {commands run and their results}
- Evidence: {test output, logs, or other proof the verification actually happened}
- User approval: {Pending | Approved | Changes Requested}
- Approval note: {the user's own words, or "—" if none yet}
```

## Overall progress

Replace the worklist's `## Progress` section with:

```markdown
## Implementation Status

- Overall: {In Progress | Completed}
- Total tracer bullets: {n}
- Approved: {n}
- Awaiting approval: {n}
- Remaining: {n}
- Current tracer bullet: {number and name}
```

- Counts must match the actual per-bullet statuses; recompute them every time a status changes.
- Never remove a bullet, its tracking fields, or its Approval Log row once written — later passes only add or update fields on bullets not yet `Approved`.

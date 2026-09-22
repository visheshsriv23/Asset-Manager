# .shipyard/work/{work-name}/worklist.md Format

```markdown
# {Feature Name} Worklist

## Goal

{short description of the intended user outcome}

## Progress

- Completed: {n}
- Total: {n}
- Current tracer bullet: {number and name, or "Not started"}
- Overall status: {Pending | In progress | Blocked | Completed}

## Tracer Bullets

### {n}. {Small end-to-end outcome}

- Status: {[ ] Pending | [~] In progress | [x] Completed | [!] Blocked}
- User-visible result: {what a user or caller can observe once this slice lands}
- Layers involved: {e.g. UI, API, business logic, persistence, tests — only the ones this slice touches}
- Implementation scope: {exactly what gets built, and what's explicitly deferred to a later bullet}
- Verification: {the command, test, or manual check that proves the slice works}
- Completion criteria: {the observable condition that makes this bullet done}
- Dependencies: {earlier tracer bullets or external prerequisites this one needs}
- Notes: {anything else worth carrying forward}

## Approval Log

| Tracer Bullet | Result | User Approval | Date |
|---|---|---|---|
```

- **Tracer bullet** — the smallest slice that runs end-to-end through every layer this feature needs; never a task scoped to one layer alone.
- **Verification** and **Completion criteria** — required before a bullet starts; one without both isn't ready to work.
- **Status** — exactly one of the four glyphs at all times; this is the only place a bullet's state lives.
- **Approval Log** — one row per completed or blocked attempt, filled in once the user responds, never before.
- On update: keep every `[x] Completed` bullet and its Approval Log rows exactly as they are; only add, reorder, or revise bullets that haven't shipped.

---
name: intent
id: shipyard:intent
description: Calibrates how much clarification to gather before starting a task, from zero questions up to an open-ended discussion, then confirms understanding before work begins.
disable-model-invocation: true
---

# Shipyard Intent

Before a ship leaves dock, the crew takes a sounding — enough depth checks to clear the shallows safely, no more, no less. This skill takes the same sounding on a request: read how much water is under the keel before deciding how many soundings to take, then confirm heading before casting off.

If the repo has been docked (`.shipyard/context.md` — [dock](../dock/SKILL.md)'s output), skim it first for the stack and domain before asking anything — it turns a generic question into a sharp one and often answers what would otherwise need asking.

## 1. Read the depth

Classify the request into one tier before asking anything. The tier calibrates the rest of this process — it is not a hard question count.

- **Shallow** — clear, low-risk, self-contained work: a typo, a rename, a lint fix, a clearly-scoped refactor, a bug with an obvious fix. Ask nothing if intent is already obvious, or one clarifying question if not.
- **Moderate** — a new endpoint, a schema change, a new UI component, an automation script, a medium-sized refactor. Expect roughly 2–6 questions, each closing a real gap.
- **Deep** — a new feature, a large refactor, an architecture or infrastructure change, a public API, security- or performance-sensitive work. Keep exploring, challenge assumptions, and surface alternatives until the shape of the problem is solid.

A Shallow read can still hit Deep water once questions start — reclassify up when that happens. Never pad a Shallow tier with unearned questions to make it look thorough.

## 2. Sound until the bottom is solid

After every answer, check for three markers of solid ground:

- the objective is stated in concrete terms,
- the constraints (technical, scope, timeline) are named,
- success looks like something specific, not "it works."

All three present → stop, regardless of how many questions the tier suggested. Any one missing → ask the single highest-value question that would close it, not the next item on a checklist. Never ask past what this test calls for just to reach some expected number.

## 3. Confirm heading, then stop

State the objective, constraints, and success marker back in a short summary, and ask for confirmation. Do not treat that confirmation as license to start building — this skill's job is to land on a confirmed intent, not to implement it.

## 4. Log the sounding

Skip this step entirely for a Shallow request that never left Shallow water — a one-line confirmation with no real discussion isn't worth a folder. It applies once the request is Moderate, Deep, or a Shallow read that got reclassified up in step 1.

Once the user confirms in step 3, record the sounding at `.shipyard/work/{title}/context.md`, where `{title}` is a short kebab-case slug of the task (3–6 words). If this task already has a folder from earlier in the session (a follow-up, a scope change), write to that same `context.md` instead of creating a new one — append to Discovery, replace the Confirmed heading.

See [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md) for the file's exact shape.

Then index it: update `.shipyard/README.md` per `../dock/INDEX-FORMAT.md` — create it from the skeleton if it doesn't exist yet, otherwise add or update the `{title}` row's Context column, leaving any Spec/Worklist columns as found.

## 5. Hand off — do not start building

Once the user confirms in step 3 (and step 4 finishes logging, if it applied), stop. Do not write or edit application code, and do not start implementing the request in this same turn, no matter how small it looks.

Report the confirmed intent back to the user and wait for their reply. If a `context.md` was logged, suggest running **blueprint** next to turn it into an implementation-ready spec. If nothing was logged (a pure Shallow request), just say the intent is confirmed and wait — let the user tell you whether to proceed directly or run blueprint first.

## Rules

- This skill's only possible file output is `.shipyard/work/{title}/context.md`, plus its entry in `.shipyard/README.md`. It never touches application code.
- A confirmed summary in step 3 authorizes moving to blueprint or waiting for the user's next instruction — never authorizes coding directly from this skill.

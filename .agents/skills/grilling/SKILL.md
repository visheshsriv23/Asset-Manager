---
name: grilling
id: shipyard:grilling
description: Pressure-tests one already-chosen decision — a design, a candidate, an approach — with a single sharp question at a time until every constraint, dependency, and edge case is locked in, then hands back the confirmed shape.
disable-model-invocation: true
---

# Shipyard Grilling

**intent** decides whether to build a thing at all; this skill runs once something specific has already been picked and needs the heat turned up before anyone trusts it. One question at a time, each closing a real gap — never a checklist fired off in one breath.

## 1. Name what's on the grill

State plainly what decision is being pressure-tested — the candidate, design, or approach already chosen — and where it came from (the user, or the skill that handed off here). Ask once, only if it isn't already obvious from the conversation.

## 2. Ask one question, take the answer, ask the next

Never batch questions. Each one closes a specific gap — a constraint not yet named, a dependency not yet classified, a case not yet covered — never the next item on a fixed checklist. Follow the answer where it leads: an answer that opens a new gap earns its own follow-up before moving on.

Keep pressing until every one of these is pinned down (skip any that plainly doesn't apply to this decision, and say so):

- **Constraints** — what the decision must satisfy, technical or otherwise
- **Dependencies** — what it relies on, and how each one behaves (does it need a seam? see [codebase-design](../codebase-design/SKILL.md) if the decision is architectural)
- **Shape** — the concrete form the decision takes: an interface, a schema, a flow — not a description of one
- **What sits behind it** — the parts that stay hidden once the decision is made
- **What survives** — which existing tests, code, or assumptions still hold, and which don't

## 3. Confirm the locked-in shape

Summarize the decision back — constraints, dependencies, shape, what's hidden, what survives — in the fewest words that still cover all five, and ask for confirmation. An answer that reopens one of the five means the grilling isn't done; return to step 2.

## 4. Hand back — do not build from here

Once confirmed, stop. Report the locked-in shape to whichever skill (or the user) asked for it, and wait. This skill never writes application code and never edits files beyond what a hand-off (like logging a decision to `CONTEXT.md`) already required elsewhere.

## Rules

- One question at a time — a wall of questions is this skill's failure mode.
- If a term is fuzzy, sharpen it before proceeding — hand off to [domain-modeling](../domain-modeling/SKILL.md) inline if the fuzziness is about the project's own vocabulary.
- Never treat confirmation in step 3 as license to implement.

# .shipyard/work/{work-name}/spec.md Format

What the blueprint covers, section by section, and where each part's content comes from.

```markdown
# {Work Title}

## Summary
{the problem, the solution, and the expected outcome, in a few sentences}

## Problem Statement
{the user or business problem, and why it matters}

## Goals
- {intended outcome}

## Non-Goals
- {what is intentionally excluded}

## User Stories
1. As a {user}, I want {capability}, so that {benefit}.

## Functional Requirements
- FR-001: {numbered, testable requirement}
- FR-002: ...

## Implementation Decisions
{confirmed architecture, module, interface, schema, integration, and compatibility decisions}

## Acceptance Criteria
- {objectively verifiable criterion, Given/When/Then where it helps}

## Testing Strategy
{the highest practical testing seam, existing patterns to reuse, important behaviors and failure cases to cover}

## Edge Cases
{validation, boundary, failure, and recovery scenarios worth calling out}

## Dependencies and Constraints
{technical, operational, and third-party limitations that bound the work}

## Out of Scope
- {excluded work}

## Assumptions
- A-001: {assumption made where information was incomplete}

## Open Questions
- OQ-001: {open question, with why the answer matters}

## Risks
- {risk, with a possible mitigation}
```

- **Title** — the work's name in title case, matching `{work-name}` in spirit if not literally.
- **Summary** — written last, once every other section is settled; it's the compression of the rest, not a preview.
- **Functional Requirements** — every requirement gets an `FR-###` id, numbered in the order they'd be built, each one a single testable statement.
- **Implementation Decisions** — confirmed decisions only, stated as decisions ("uses X"), never mixed with unconfirmed recommendations — a recommendation goes here labeled as one, or into Open Questions if it needs the user's call.
- **Assumptions** and **Open Questions** — `A-###` and `OQ-###`, numbered independently. An Assumption is a gap this blueprint filled in to keep moving; an Open Question is a gap it left for the user, with the reason the answer changes the outcome.
- Any section with nothing to say states that plainly ("no third-party dependencies") rather than being cut — the structure stays complete even when a section is thin.

On an update to an existing `spec.md`: keep sections whose grounding still holds, and only rewrite what the new context actually changes — this file accumulates the confirmed shape of the work, not a history of every draft.

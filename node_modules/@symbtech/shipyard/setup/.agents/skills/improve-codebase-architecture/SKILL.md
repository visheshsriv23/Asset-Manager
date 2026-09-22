---
name: improve-codebase-architecture
id: shipyard:improve-codebase-architecture
description: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
disable-model-invocation: true
---

# Shipyard Improve Codebase Architecture

Surface architectural friction and propose **deepening opportunities** — refactors that turn shallow modules into deep ones, aimed at testability and AI-navigability.

Built on [codebase-design](../codebase-design/SKILL.md) for the vocabulary (**module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**) and its principles (the deletion test, "the interface is the test surface," "one adapter is a hypothetical seam, two is a real one"). Use these terms exactly in every suggestion — never drift into "component," "service," "API," or "boundary." `CONTEXT.md`'s domain language names the seams; ADRs under `docs/adr/` record decisions this skill should not re-litigate — see [domain-modeling](../domain-modeling/SKILL.md) for both.

## 1. Explore

**Scope before you scan.** Deepening a module pays off by making future changes to it easier, so weight the parts of the codebase that have recently changed:

- If the user named a direction — a module, a subsystem, a pain point — take it, and skip the inference below.
- Otherwise walk back `git log --oneline` far enough to find the codebase's hot spots, and let those paths pull attention first. Widen the net only if the changes are too scattered to show one.

If this repo has been docked (`.shipyard/context.md`, `.shipyard/architecture.md`, `.shipyard/decisions.md` — [dock](../dock/SKILL.md)'s output), read those first for the domain glossary and any ADRs in the area; otherwise read `CONTEXT.md` and `docs/adr/` directly.

Then use the Agent tool with `subagent_type=Explore` to walk the codebase, noting friction organically rather than against a rigid checklist:

- Where does understanding one concept require bouncing between many small modules?
- Where are modules **shallow** — interface nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called (no **locality**)?
- Where do tightly-coupled modules leak across their seams?
- Which parts of the codebase are untested, or hard to test through their current interface?

Apply the **deletion test** to anything suspected shallow: would deleting it concentrate complexity, or just move it? "Concentrates" is the signal to keep.

## 2. Present candidates as an HTML report

Write a self-contained HTML file to the OS temp directory so nothing lands in the repo. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/architecture-review-<timestamp>.html` so each run gets a fresh file. Open it for the user — `open` on macOS, `xdg-open` on Linux, `start` on Windows — and report the absolute path.

Use **Tailwind via CDN** for layout and **Mermaid via CDN** for diagrams where a graph, flow, or sequence reliably communicates the structure; use hand-built CSS/SVG for the more editorial visuals (mass diagrams, cross-sections, collapse animations). Mix both — leaning on Mermaid alone starts to look generic. Every candidate gets a **before/after diagram**. See [HTML-REPORT.md](./HTML-REPORT.md) for the full scaffold, diagram patterns, and styling rules.

Each candidate gets a card with:

- **Files** — which files/modules are involved
- **Problem** — why the current architecture is causing friction
- **Solution** — plain English description of what would change
- **Benefits** — explained in terms of locality and leverage, and how tests would improve
- **Before/After diagram** — side by side, illustrating the shallowness and the deepening
- **Recommendation strength** — `Strong`, `Worth exploring`, or `Speculative`

**Use `CONTEXT.md` vocabulary for the domain, and codebase-design's vocabulary for the architecture.** If `CONTEXT.md` defines "Order," say "the Order intake module" — not "the FooBarHandler," and not "the Order service."

**ADR conflicts**: if a candidate contradicts an existing ADR, only surface it when the friction is real enough to warrant revisiting the ADR. Mark it with a callout (_"contradicts ADR-0007 — but worth reopening because…"_). Don't list every theoretical refactor an ADR forbids.

End the report with a **Top recommendation** section: which candidate to tackle first and why, with an anchor link to its card.

Do not propose interfaces yet. After the file is written, ask the user: "Which of these would you like to explore?"

## 3. Grill the chosen candidate

Once the user picks a candidate, run [grilling](../grilling/SKILL.md) to walk the decision tree with them — constraints, dependencies, the shape of the deepened module, what sits behind the seam, what tests survive.

Side effects happen inline as decisions crystallize — run [domain-modeling](../domain-modeling/SKILL.md) to keep the domain model current as you go:

- **Naming a deepened module after a concept not in `CONTEXT.md`?** Add the term. Create the file lazily if it doesn't exist.
- **Sharpening a fuzzy term during the conversation?** Update `CONTEXT.md` right there.
- **User rejects the candidate with a load-bearing reason?** Offer an ADR, framed as: _"Want me to record this as an ADR so future architecture reviews don't re-suggest it?"_ Only offer when a future explorer would actually need it to avoid re-suggesting the same thing — skip ephemeral or self-evident reasons.
- **Want to explore alternative interfaces for the deepened module?** Run codebase-design's design-it-twice parallel sub-agent pattern ([DESIGN-IT-TWICE.md](../codebase-design/DESIGN-IT-TWICE.md)).

## Rules

- Never propose an interface in step 2 — candidates only, no implementation.
- Every suggestion uses codebase-design's vocabulary exactly; reach for a glossary term before inventing a new one.

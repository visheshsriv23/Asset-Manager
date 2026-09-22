# Shipyard Bughunt

A discipline for hard bugs and performance regressions. The feedback loop built in Phase 1 is the skill — every later phase just spends the signal it produces. Once Triage below routes a bug into this discipline, Phase 1 and Phase 2 are never skippable — skip any later phase only when you can name the specific reason.

If this repo has been docked (`.shipyard/context.md`, `.shipyard/architecture.md` — [dock](../dock/SKILL.md)'s output), read them first for a mental model of the area you're touching, and check `.shipyard/decisions.md` for ADRs that bind it.

## Triage — is this discipline earned?

Not every bug report needs a built loop. Skip straight to a fix, verified with one quick before/after check, only when **every** one of these holds:

- You can point at the exact line and explain why it fails — the cause is seen, not guessed.
- One obvious action reproduces it (run this one test, hit this one endpoint) — nothing to construct.
- The fix is small and local, not a design change.

Any one of these fails, or you're not fully certain — that uncertainty is the signal this is not a trivial case. Proceed to Phase 1 in full. And once a hypothesis has been tried and been wrong, the trivial-case window has closed for this bug: you've already spent the "obvious cause" budget, so drop back into Phase 1 rather than guessing again.

## Phase 1 — Build the loop

A **tight**, **red**-capable loop — one that goes red on exactly this bug and green once it's fixed — turns Phases 2-6 into consuming a signal you trust, instead of guessing. If you catch yourself reading code to build a theory before this loop exists, stop: jumping to a hypothesis before you have one is the exact failure this skill exists to prevent.

Pick a construction, roughly in this order of preference:

- Failing test at whatever seam reaches the bug — unit, integration, e2e.
- Curl / HTTP script against a running dev server.
- CLI invocation with a fixture input, diffing stdout against a known-good snapshot.
- Headless browser script (Playwright / Puppeteer) — drives the UI, asserts on DOM/console/network.
- Replay a captured trace — save a real request, payload, or event log to disk, replay it through the code path in isolation.
- Throwaway harness — a minimal subset of the system (one service, mocked deps) exercising the bug path via a single call.
- Property / fuzz loop — for "sometimes wrong output", run hundreds of random inputs and look for the failure mode.
- Bisection harness — if the bug appeared between two known states (commit, dataset, version), automate "boot at state X, check, repeat" for `git bisect run`.
- Differential loop — the same input through old vs. new (or two configs), diff the outputs.
- HITL script — last resort, when a human must click something. Fill in [scripts/hitl-loop.template.sh](scripts/hitl-loop.template.sh) so the human step still returns a captured, structured result instead of a live narration you can't verify.

**Tighten it.** A loop earns "tight" on three axes: faster (cache setup, skip unrelated init, narrow scope), sharper (assert the exact symptom, not "didn't crash"), and more deterministic (pin time, seed RNG, isolate the filesystem, freeze the network). A 30-second flaky loop is barely better than none; a 2-second deterministic one is a debugging superpower.

**Non-deterministic bugs** — the target isn't a clean repro but a higher flake rate. Loop the trigger 100x, parallelise, add stress, narrow timing windows, inject sleeps. A 50%-flake bug is debuggable; a 1%-flake bug isn't — keep raising the rate until it is.

**When you genuinely cannot build a loop** — stop and say so explicitly, with what you tried. Ask the user for one of: access to an environment that reproduces it, a captured artifact (HAR file, log dump, core dump, timestamped screen recording), or permission to add temporary production instrumentation. Do not hypothesise without a loop.

Completion criterion — name one command (script path, test invocation, curl) you have already run at least once; paste the invocation and its output. It must be:

- **Red-capable** — drives the actual bug path and asserts the user's exact symptom, so it goes red on this bug and green once fixed. Not "runs without erroring."
- **Tight** — fast and deterministic, per above (a pinned high flake rate counts, for non-deterministic bugs).
- **Agent-runnable** — you can run it unattended; a human enters only through the HITL script.

No red loop, no Phase 2.

## Phase 2 — Reproduce and minimise

Run the loop and watch it go red. Confirm before moving on:

- The failure matches the symptom the user described, not a different failure sitting nearby — wrong bug, wrong fix.
- It reproduces across multiple runs (or at the flake rate established in Phase 1).
- The exact symptom is captured (error text, wrong output, timing) so later phases can verify the fix against it.

Then minimise: cut inputs, callers, config, data, and steps one at a time, re-running the loop after each cut, keeping only what's load-bearing. A minimal repro shrinks the hypothesis space in Phase 3 and becomes the regression test in Phase 5.

Completion criterion — every remaining element is load-bearing: removing any one of them turns the loop green.

## Phase 3 — Hypothesise

Generate 3-5 ranked hypotheses before testing any of them — testing the first plausible one anchors you on it. Each must be falsifiable: "If `<X>` is the cause, then `<action>` will make the bug disappear / worse." If you can't state the prediction, the hypothesis is a vibe — sharpen it or drop it.

Share the ranked list with the user before testing. It's a cheap checkpoint: domain knowledge often re-ranks it instantly ("we just deployed a change to #3") or rules one out outright. Don't block on a reply if they're away — proceed with your own ranking.

## Phase 4 — Instrument

Each probe maps to a specific prediction from Phase 3; change one variable at a time.

Prefer, in this order: a debugger or REPL breakpoint, then targeted logs at the boundary that distinguishes hypotheses. Never log everything and grep after the fact. Tag every debug log with a unique prefix (`[DEBUG-a4f2]`) — cleanup in Phase 6 becomes one grep instead of a diff review.

Performance regressions: logs are usually the wrong tool. Establish a baseline measurement first — a timing harness, `performance.now()`, a profiler, a query plan — then bisect against it. Measure first, fix second.

## Phase 5 — Fix and regression-test

Check for a correct seam before writing a test: one where the test exercises the bug pattern as it actually occurs at the call site. A shallow seam — a single-caller test standing in for a bug that needs multiple callers, a unit test that can't replicate the chain that triggered it — gives false confidence, not coverage.

If a correct seam exists:

1. Turn the minimised repro into a failing test there.
2. Watch it fail.
3. Apply the fix.
4. Watch it pass.
5. Re-run the Phase 1 loop against the original, un-minimised scenario.

If no correct seam exists, that absence is itself the finding — the architecture is preventing this bug from being locked down. Carry it into Phase 6 instead of skipping the test silently.

## Phase 6 — Clean up and report

Before declaring done:

- The original repro no longer reproduces (re-run the Phase 1 loop).
- The regression test passes, or its missing seam is documented.
- Every `[DEBUG-...]` tag is gone (grep the prefix).
- Throwaway harnesses and prototypes are deleted or moved to a clearly-marked debug location.
- The commit or PR message states which hypothesis actually turned out correct, so the next debugger doesn't re-test the ones you already ruled out.

Then ask what would have prevented this bug. If the answer is architectural — no good seam, tangled callers, hidden coupling — raise it as a follow-up, separate from this fix. You know more now than when Phase 1 started; make that call after, not before.

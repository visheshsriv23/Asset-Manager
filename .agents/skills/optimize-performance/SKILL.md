# Shipyard Optimize Performance

Every fix here is a hypothesis until re-measured against its own **baseline**. Skip the baseline and you're guessing; guessing produces premature optimization that adds complexity without moving anything real. Measure, find the actual bottleneck, fix exactly that, re-measure, then decide — strictly — whether the change earns its keep.

If a specific change just made things slower and you're hunting for which one, that's a regression to diagnose, not tune: use [bughunt](../bughunt/SKILL.md)'s reproduce-first loop instead, which already covers performance regressions. Reach for this skill when there's no known-good prior state to bisect against — a budget to hit, a Core Web Vitals score to raise, a suspected N+1, or a profile full of unattributed time.

## Workflow

### 1. Baseline

Measure before changing anything, with both lenses:

- **Synthetic** (Lighthouse, DevTools Performance tab, `console.time`/APM spans) — controlled and reproducible; use it to isolate a specific issue.
- **RUM** (the `web-vitals` package, CrUX, production APM) — real conditions; the only way to confirm a fix helped an actual user.

Done when you have a specific number, captured the same way you'll re-measure in Step 4 (same command, same conditions, same fixed budget of runs or requests).

### 2. Identify

Trace the symptom to its likely cause before touching code — see [references/performance-patterns.md](references/performance-patterns.md) for the full symptom → cause → investigation tables (frontend and backend). Don't fix the first plausible thing; name the specific bottleneck the baseline points at.

Done when you can name the bottleneck in one sentence backed by what you measured, not what seems likely.

### 3. Fix

Apply the smallest change that addresses that one bottleneck. [references/performance-patterns.md](references/performance-patterns.md) has fixes for the common anti-patterns (N+1 queries, unbounded fetches, unsized/unoptimized images, unstable re-renders, oversized bundles, missing caching).

Change one variable at a time — three optimizations landed together produce one number, and none of them can be credited for it. If several must ship in the same commit, measure each in isolation first.

Done when exactly one change is in place, ready to re-measure.

### 4. Verify

Re-measure the same way as the baseline. Then decide, strictly:

| Result vs. baseline | Action |
|---|---|
| Past the threshold, tests green | Keep — commit with the before/after numbers in the message |
| Within run-to-run noise (no measurable change) | Revert |
| Worse | Revert |
| Improved, but a test went red | Revert — a regression wearing a win's clothing |

Neutral is a revert, not a keep — an unmeasured "it doesn't hurt" is exactly how dead complexity accumulates. Correctness gates the metric: a win that skips validation, staleness-tolerates something that must be fresh, or drops an await that was load-bearing is a regression, not a win, no matter what the number says.

Log the attempt either way — idea, baseline → result, verdict, and why — in the PR description or a `PERF.md` ledger. A reverted idea left unlogged gets retried next quarter by someone who didn't know it already failed.

Done when the re-measurement exists, the keep/revert call is made per the table above, and the ledger has an entry for it.

### 5. Guard

Add whatever stops this bottleneck from silently coming back: a budget check in CI, a regression test, a monitoring alert, or a Lighthouse CI run. If one already covers this metric, say so instead of adding a duplicate.

Done when a budget, test, or monitor now covers the metric that was just fixed, or an existing one is confirmed to already cover it.

## Targets

**Core Web Vitals:**

| Metric | Good | Needs Improvement | Poor |
|---|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| INP (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms | > 500ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |

**Performance budget:** JS bundle < 200KB gzipped (initial) · CSS < 50KB gzipped · above-the-fold images < 200KB each · fonts < 100KB total · API p95 < 200ms · Time to Interactive < 3.5s on 4G · Lighthouse Performance ≥ 90.

## Rules

- Don't optimize without baseline data pointing at a real bottleneck — that's premature optimization, not this skill.
- One change per measurement. Bundle only what you've already isolated.
- Neutral results are reverts. Reverted attempts are logged, not silently dropped.
- Existing tests must stay green; a metric win that costs correctness is a regression.

# Performance Patterns

Detail for Steps 2-3 of [SKILL.md](../SKILL.md) — read whichever section matches the symptom you're chasing.

## Where to Start Measuring

| Symptom | Check first |
|---|---|
| First page load, large bundle suspected | Bundle size, code splitting |
| First page load, slow server response | TTFB in the Network waterfall — DNS (add `dns-prefetch`/`preconnect`), TCP/TLS (HTTP/2, keep-alive, edge deployment), or server wait (profile backend, queries, caching) |
| First page load, render-blocking resources | Network waterfall for blocking CSS/JS |
| Interaction feels sluggish, UI freezes on click | Main-thread profile, long tasks (>50ms) |
| Interaction feels sluggish, form input lags | Re-renders, controlled-component overhead |
| Interaction feels sluggish, animation janks | Layout thrashing, forced reflows |
| Slow after navigation, data-bound | API response times, request waterfalls |
| Slow after navigation, render-bound | Component render time, N+1 client fetches |
| Backend: one endpoint slow | Database query log, indexes |
| Backend: all endpoints slow | Connection pool, memory, CPU |
| Backend: intermittent slowness | Lock contention, GC pauses, external dependency latency |

## Common Bottlenecks

**Frontend:**

| Symptom | Likely cause |
|---|---|
| Slow LCP | Large images, render-blocking resources, slow server |
| High CLS | Images without dimensions, late-loading content, font shifts |
| Poor INP | Heavy main-thread JS, large DOM updates |
| Slow initial load | Large bundle, too many requests |

**Backend:**

| Symptom | Likely cause |
|---|---|
| Slow API responses | N+1 queries, missing indexes, unoptimized queries |
| Memory growth | Leaked references, unbounded caches, oversized payloads |
| CPU spikes | Synchronous heavy computation, regex backtracking |
| High latency | Missing caching, redundant computation, extra network hops |

## Anti-Pattern Fixes

**N+1 queries:**

```js
// BAD — one query per row
const tasks = await db.tasks.findMany();
for (const task of tasks) {
  task.owner = await db.users.findUnique({ where: { id: task.ownerId } });
}

// GOOD — single query with a join
const tasks = await db.tasks.findMany({ include: { owner: true } });
```

**Unbounded data fetching:**

```js
// BAD
const allTasks = await db.tasks.findMany();

// GOOD — paginated
const tasks = await db.tasks.findMany({
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { createdAt: 'desc' },
});
```

**Images without dimensions or format optimization:**

```html
<!-- BAD -->
<img src="/hero.jpg" />

<!-- GOOD — above the fold: explicit dimensions, modern format, priority hint -->
<img src="/hero.webp" width="1200" height="600" fetchpriority="high" alt="…" />

<!-- GOOD — below the fold: lazy + async -->
<img src="/content.webp" width="800" height="400" loading="lazy" decoding="async" alt="…" />
```

**Unstable re-renders (React):**

```jsx
// BAD — new object identity every render
function TaskList() {
  return <TaskFilters options={{ sortBy: 'date', order: 'desc' }} />;
}

// GOOD — stable reference, plus memoized expensive work
const DEFAULT_OPTIONS = { sortBy: 'date', order: 'desc' };
function TaskList() {
  return <TaskFilters options={DEFAULT_OPTIONS} />;
}
const TaskItem = React.memo(function TaskItem({ task }) { /* expensive render */ });
function TaskStats({ tasks }) {
  const stats = useMemo(() => calculateStats(tasks), [tasks]);
  return <div>{stats.completed} / {stats.total}</div>;
}
```

**Oversized bundle:**

```js
// GOOD — defer heavy, rarely-used code
const ChartLibrary = lazy(() => import('./ChartLibrary'));
const SettingsPage = lazy(() => import('./pages/Settings'));
// wrap route/feature in <Suspense fallback={...}>
```

**Missing caching:**

```js
// In-process cache for frequently-read, rarely-changed data
let cachedConfig = null, cacheExpiry = 0;
async function getAppConfig() {
  if (cachedConfig && Date.now() < cacheExpiry) return cachedConfig;
  cachedConfig = await db.config.findFirst();
  cacheExpiry = Date.now() + 5 * 60 * 1000;
  return cachedConfig;
}

// HTTP caching for static assets and API responses
app.use('/static', express.static('public', { maxAge: '1y', immutable: true }));
res.set('Cache-Control', 'public, max-age=300');
```

## Rationalizations to Reject

| Rationalization | Reality |
|---|---|
| "We'll optimize later" | Performance debt compounds; fix obvious anti-patterns now |
| "It's fast on my machine" | Profile on representative hardware and network conditions |
| "This optimization is obvious" | If you didn't measure, you don't know — profile first |
| "Users won't notice" | Small delays measurably affect conversion; don't assume |
| "The framework handles performance" | Frameworks don't fix N+1 queries or oversized bundles |
| "It didn't help much, but it doesn't hurt" | Neutral is a revert — you maintain the complexity forever for nothing |
| "We already wrote it, may as well keep it" | Sunk cost — the measurement doesn't care how long it took to write |
| "The improvement is obvious, no need to re-measure" | Then re-measuring is cheap and proves it |

## Red Flags

- Optimization landed without profiling data to justify it
- N+1 query patterns in new data-fetching code
- List endpoints without pagination
- Images without dimensions, lazy loading, or responsive sources
- Bundle size growing without review
- No performance monitoring in production
- `React.memo`/`useMemo` sprinkled everywhere without a measured reason
- A "win" kept without a re-measurement, or one that required a test to be weakened
- Several optimizations landed in one commit, so no single change can be credited
- The same already-failed optimization attempted again because nobody logged the first result

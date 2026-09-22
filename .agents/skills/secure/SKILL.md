# Shipyard Secure

A breach is never found at the plate that got reinforced — it's found at the seam nobody checked. Every crossing where data from outside enters the system — an HTTP request, a form field, a file upload, a webhook, a third-party response, an LLM's output — is a seam, and an unhardened one is where the breach happens. This skill treats hardening as a constraint on every line touching untrusted data, authentication, or external systems, not a pass applied at the end.

If this repo has been docked (`.shipyard/context.md`, `.shipyard/architecture.md` — [dock](../dock/SKILL.md)'s output), read them first — knowing the stack and existing auth/data patterns turns a generic threat model into a sharp one.

## Phase 1 — Chart the trust boundaries

Controls added without this are guesses. Before touching code:

1. Name every **trust boundary** this feature touches — where untrusted data crosses in (HTTP requests, form fields, file uploads, webhooks, third-party API responses, message queues, LLM output) or sensitive data crosses out.
2. Behind each boundary, name the asset worth stealing or breaking — credentials, PII, payment data, admin actions, money movement.
3. Run STRIDE across each boundary — a lens, not a ceremony:

| Threat | Ask | Typical mitigation |
|---|---|---|
| Spoofing | Can someone impersonate a user/service? | Authentication, signature verification |
| Tampering | Can data be altered in transit or at rest? | Integrity checks, parameterized queries, HTTPS |
| Repudiation | Can an action be denied later? | Audit logging of security events |
| Information disclosure | Can data leak? | Encryption, field allowlists, generic errors |
| Denial of service | Can it be overwhelmed? | Rate limiting, input size caps, timeouts |
| Elevation of privilege | Can a user gain rights they shouldn't? | Authorization checks, least privilege |

4. Write the abuse case beside the use case — "how would I misuse this?" becomes the feature's first test.

Completion criterion: every trust boundary this feature touches is named, each with its asset and its abuse case. If you can't name them, you're not ready to secure this feature — this is OWASP A04: Insecure Design, and no control in Phase 2 fixes a design gap.

## Phase 2 — Apply the boundary controls

Three tiers, checked against every boundary named in Phase 1.

**Always** — no exception:
Validate all external input at the boundary (API routes, form handlers); parameterized queries only, never string-concatenated SQL; framework auto-escaping on all output; HTTPS everywhere; bcrypt/scrypt/argon2 for passwords; security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options); httpOnly/secure/sameSite session cookies; the native dependency audit run against the committed lockfile before every release.

**Ask first** — pause for human approval:
New authentication flows or auth-logic changes, new categories of stored sensitive data (PII, payment info), new external service integrations, CORS changes, file upload handlers, rate-limit/throttle changes, elevated permissions or roles.

**Never**:
Secrets in version control, sensitive data in logs, client-side validation treated as the security boundary, disabled security headers, `eval()`/`innerHTML` fed with user data, auth tokens in client-accessible storage (`localStorage`), stack traces or internal errors surfaced to users.

The concrete fix for each category — injection, broken authentication, XSS, broken access control, security misconfiguration, sensitive data exposure, SSRF, input validation, file upload safety, rate limiting, secrets management — is in [references/owasp-patterns.md](references/owasp-patterns.md). Open the entries matching this feature's boundaries; skip the rest.

## Phase 3 — Vet the supply chain

Skip this phase if the change touches no dependencies.

A native audit (`npm audit`, `pnpm audit`, etc.) only matches known advisories — it neither proves a package trustworthy nor proves the vulnerable code is reachable. Triage every finding:

- **Critical/high, reachable in a real path, fix available** → update now.
- **Critical/high, reachable, no fix available** → patch, replace, or allowlist with a review date.
- **Critical/high, confirmed unreachable** in runtime, build, test, or deployment paths → fix soon, not a release blocker.
- **Moderate** → next release cycle if reachable in production, backlog if dev-only.
- **Low** → track and fix during routine dependency updates.

Before installing anything new: confirm the one lockfile that owns this installation boundary, block dependency install scripts until reviewed, never run forced audit remediation (`npm audit fix --force` or equivalent) without reading the changelog and testing the result, and check new dependencies' ownership, maintenance, provenance, and transitive graph for typosquats. The package-manager command matrix and full checklist are in [references/security-checklist.md](references/security-checklist.md).

## Phase 4 — Harden AI/LLM surfaces

Skip this phase if the feature doesn't call an LLM.

Map the feature to the OWASP Top 10 for LLM Applications:

- Treat model output as untrusted input — never pass it straight into `eval`, SQL, a shell, `innerHTML`, or a file path (LLM05: Improper Output Handling).
- Assume the prompt can be hijacked by anything in its context window — a user message, a fetched page, a PDF. Enforce permissions in code, never in the system prompt (LLM01: Prompt Injection).
- Keep secrets, cross-tenant data, and the full system prompt out of the context — anything placed in it can be echoed back (LLM02/LLM07).
- Scope tool and agent permissions to the minimum and require confirmation for destructive or irreversible actions (LLM06: Excessive Agency).
- Cap tokens, request rate, and loop/recursion depth (LLM10: Unbounded Consumption). Partition vector-store retrieval per tenant and validate documents before indexing (LLM08).

The code pattern — parse defensively, validate against a schema, then encode — is in [references/owasp-patterns.md](references/owasp-patterns.md#aillm-output-handling).

## Verification

Before calling this done, every item below holds against the actual diff, not assumed — an unverified box is an open trust boundary. Full checklist and red flags: [references/security-checklist.md](references/security-checklist.md).

- No secrets in source or git history.
- Every protected endpoint checks both authentication and authorization.
- All user input validated at the boundary; queries parameterized; output encoded.
- Server-side URL fetches allowlisted (no SSRF).
- Security headers present (check DevTools); CORS restricted to known origins; error responses don't leak internals.
- Native audit has no unmitigated reachable critical/high findings; lockfile and script policy intact.
- LLM output (if any) validated and encoded before use.

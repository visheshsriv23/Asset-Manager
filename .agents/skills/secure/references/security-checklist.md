# Security Checklist

Full pre-commit checklist, the supply-chain package-manager matrix, red flags, and the OWASP ordering — referenced from `SKILL.md`'s Verification phase and Phase 3.

## Review Checklist

### Authentication
- [ ] Passwords hashed with bcrypt/scrypt/argon2 (salt rounds ≥ 12)
- [ ] Session tokens are httpOnly, secure, sameSite
- [ ] Login has rate limiting
- [ ] Password reset tokens expire

### Authorization
- [ ] Every endpoint checks user permissions
- [ ] Users can only access their own resources
- [ ] Admin actions require admin role verification

### Input
- [ ] All user input validated at the boundary
- [ ] SQL queries are parameterized
- [ ] HTML output is encoded/escaped
- [ ] Server-side URL fetches are allowlisted (no SSRF to internal services)

### Data
- [ ] No secrets in code or version control
- [ ] Sensitive fields excluded from API responses
- [ ] PII encrypted at rest (if applicable)

### Infrastructure
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] CORS restricted to known origins
- [ ] Dependencies audited for vulnerabilities
- [ ] Error messages don't expose internals

### Supply Chain
- [ ] One authoritative lockfile committed; CI uses that manager's frozen/immutable install
- [ ] Native audit triaged by reachability and fix risk; dependency install scripts blocked unless explicitly approved
- [ ] New dependencies reviewed (ownership, provenance, release age, transitive graph)

### AI / LLM (if used)
- [ ] Model output treated as untrusted (no eval/SQL/innerHTML/shell)
- [ ] Secrets and other users' data kept out of prompts
- [ ] Tool/agent permissions scoped; destructive actions require confirmation

## Supply-Chain Package Manager Matrix

Pin the manager version at the installation boundary before installing anything. Bootstrap with scripts disabled, then verify with the frozen/immutable install.

| Manager | Lockfile | Install with scripts disabled | Frozen/reproducible install | Audit command |
|---|---|---|---|---|
| npm | `package-lock.json` | `npm ci --ignore-scripts` | `npm ci` | `npm audit --audit-level=high` |
| pnpm | `pnpm-lock.yaml` | `pnpm install --ignore-scripts --frozen-lockfile` | `pnpm install --frozen-lockfile` | `pnpm audit` |
| Yarn Classic | `yarn.lock` | `yarn install --ignore-scripts --frozen-lockfile` | `yarn install --frozen-lockfile` | `yarn audit` |
| Yarn Berry | `yarn.lock` | `YARN_ENABLE_SCRIPTS=false yarn install --immutable` | `yarn install --immutable` | `yarn npm audit` |
| Bun | `bun.lockb` | `bun install --ignore-scripts --frozen-lockfile` | `bun install --frozen-lockfile` | `bun audit` (where available) |
| Cargo | `Cargo.lock` | n/a (no install scripts by default) | `cargo build --locked` | `cargo audit` |
| Poetry / pip | `poetry.lock` / `Pipfile.lock` | `poetry install --no-root` | `poetry install --sync` | `pip-audit` |
| Go modules | `go.sum` | `go mod download` (no install scripts) | `GOFLAGS=-mod=readonly go build` | `govulncheck` |

Corroborate `packageManager` (when present), the lockfile, and CI before trusting any of these — stop on disagreement or competing lockfiles at one installation boundary.

## Dependency Audit Triage

```text
The native audit reports a vulnerability
├── Severity: critical or high
│   ├── Is the vulnerable code reachable in runtime, build, test, or deployment paths?
│   │   ├── YES --> Fix immediately (update, patch, or replace the dependency)
│   │   └── NO (confirmed unused across those paths) --> Fix soon, but not a blocker
│   └── Is a fix available?
│       ├── YES --> Update to the patched version
│       └── NO --> Check for workarounds, consider replacing the dependency, or add to allowlist with a review date
├── Severity: moderate
│   ├── Reachable in production? --> Fix in the next release cycle
│   └── Dev-only? --> Fix when convenient, track in backlog
└── Severity: low
    └── Track and fix during regular dependency updates
```

When you defer a fix, document the reason and set a review date.

## OWASP Top 10 (2021) Quick Reference

| ID | Category |
|---|---|
| A01 | Broken Access Control |
| A02 | Cryptographic Failures |
| A03 | Injection |
| A04 | Insecure Design |
| A05 | Security Misconfiguration |
| A06 | Vulnerable and Outdated Components |
| A07 | Identification and Authentication Failures |
| A08 | Software and Data Integrity Failures |
| A09 | Security Logging and Monitoring Failures |
| A10 | Server-Side Request Forgery |

## Red Flags

- User input passed directly to database queries, shell commands, or HTML rendering
- Secrets in source code or commit history
- API endpoints without authentication or authorization checks
- Missing CORS configuration or wildcard (`*`) origins
- No rate limiting on authentication endpoints
- Stack traces or internal errors exposed to users
- Dependencies with known critical vulnerabilities, competing lockfiles at one installation boundary, non-reproducible installs, or blanket-approved scripts
- Server fetches user-supplied URLs without an allowlist (SSRF)
- LLM/model output passed into a query, the DOM, a shell, or `eval`
- Secrets, PII, or the full system prompt placed inside an LLM context window

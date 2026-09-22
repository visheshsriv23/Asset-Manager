# Next.js Organization Guide

This document defines the organization's standard architecture for all
Next.js frontend applications.

Whenever a Next.js project is scaffolded, this guide is the authoritative
source for project structure, tooling, dependencies, conventions, and coding standards.

Unless the user explicitly requests otherwise, always follow this guide.

This scaffold intentionally contains no business logic, domain-specific pages,
authentication flows, or API integrations beyond the application skeleton.

---

## Tech stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- ESLint
- Prettier
- shadcn/ui
- React Hook Form
- Zod
- Axios (or Fetch API if preferred)
- Jest
- React Testing Library

---

## Local commands

```bash
# install
npm install

# development
npm run dev

# build
npm run build

# lint
npm run lint

# test
npm run test
```

---

## Required env vars

All environment variables should be documented in `.env.example`.

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL |
| `NEXT_PUBLIC_APP_NAME` | Application name |
| `NEXT_PUBLIC_ENV` | `local` / `dev` / `staging` / `production` |
| `NEXT_PUBLIC_APP_VERSION` | Application version |

---

## Application layout

```
app/
    layout.tsx
    page.tsx
    globals.css

components/
    ui/
    common/

services/
    api/

hooks/

lib/

utils/

types/

constants/

public/

tests/
```

---

## Architecture

- Use the Next.js App Router.
- Prefer Server Components where possible.
- Use Client Components only when required.
- Keep business logic outside UI components.
- API calls should reside inside `services/`.
- Shared utilities belong in `utils/`.
- Shared types belong in `types/`.
- Reusable UI components belong in `components/`.
- Configure absolute imports using `@/`.
- Enable strict TypeScript mode.

---

## Styling

- Tailwind CSS is the default styling solution.
- Use shadcn/ui for reusable UI components.
- Follow a mobile-first responsive approach.
- Avoid inline styles.
- Create reusable components instead of duplicating UI.

---

## Authentication

Authentication is intentionally left unimplemented.

Before adding authentication, confirm the approach with the project owner
(Auth.js, Clerk, Firebase, JWT, OAuth, etc.).

Do not assume an authentication provider.

---

## Testing

Projects should include:

- Jest
- React Testing Library

End-to-end testing may be added later if required.

---

## Bare scaffold — nothing domain-specific yet

There are no pages, business features, API integrations, or authentication
flows included by default.

The scaffold should only generate the application structure, shared
configuration, and reusable project foundation.

Domain-specific pages, components, API clients, and features should only be
added after the scaffold has been generated.
# Hono — Legal Fee Management System

## Technology Stack Document

> **Version:** 1.0 — 2026

---

## Fixed Preferences

These libraries are non-negotiable

| Concern | Choice |
|---|---|
| Framework | TanStack Start |
| Routing | TanStack Router |
| Data fetching / async state | TanStack Query |
| Forms | TanStack Form |
| Tables | TanStack Table |
| Database ORM | Drizzle ORM |
| Database | PostgreSQL (hosted on Supabase) |
| File storage | Supabase Storage |
| Authentication | BetterAuth |
| UI components | HeroUI |
| Validation | Zod |
| Linting + formatting | Biome |
| Testing | Vitest + Testing Library |
| Language | TypeScript (strict mode) |
| Package manager | pnpm |

---

## Open Choices

For anything not listed above, prefer well-maintained, widely adopted libraries that integrate naturally with the fixed stack. Justify deviations from obvious defaults.

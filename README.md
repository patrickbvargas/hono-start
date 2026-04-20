# Hono

Hono is an internal legal fee management system for a law firm. It replaces spreadsheet-based control of clients, contracts, fees, and remunerations with a multi-tenant web application.

The product is desktop-first, uses pt-BR user-facing copy, and keeps code identifiers in English.

## Product Focus

Hono is built around law-firm operations, not generic CRM or case management.

- Centralize clients, employees, contracts, revenues, fees, and remunerations.
- Reduce manual remuneration calculation errors.
- Preserve auditable business history.
- Enforce role-aware visibility of financial data.
- Keep all tenant-scoped data isolated by firm.

## Current Code Surface

Implemented feature slices live under `src/features/`:

- `clients`
- `employees`
- `contracts`
- `fees`
- `remunerations`

Routes currently expose:

- `/` dashboard shell
- `/clientes`
- `/colaboradores`
- `/contratos`
- `/honorarios`
- `/remuneracoes`

The Prisma schema includes the core tenant model, lookup catalogs, clients, employees, contracts, contract assignments, revenues, fees, and system-generated remunerations.

## Documented Stack

- TanStack Start
- TanStack Router
- TanStack Query
- TanStack Form
- TanStack Table
- Prisma
- PostgreSQL
- Supabase Storage
- BetterAuth
- HeroUI React v3 through shared UI re-exports
- Zod
- Biome
- Vitest and Testing Library
- TypeScript strict mode
- pnpm

## Project Contract

`docs/` is the canonical project contract. If code and docs disagree, docs describe intended truth.

Start here before non-trivial changes:

1. `docs/index.md`
2. `docs/domain/PRODUCT_SENSE.md`
3. `docs/implementation/STACK.md`
4. `docs/implementation/ARCHITECTURE.md`
5. `docs/implementation/CONVENTIONS.md`
6. `docs/implementation/WORKFLOW.md`

For full context, follow the reading order in `docs/index.md`.

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create `.env` with:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

Generate Prisma client:

```bash
pnpm db:generate
```

Apply migrations and seed local data:

```bash
pnpm db:migrate
pnpm db:seed
```

Run the app:

```bash
pnpm dev
```

The dev server uses port `3000`.

## Useful Scripts

```bash
pnpm dev          # start TanStack Start dev server
pnpm build        # production build
pnpm test         # run Vitest
pnpm lint         # run Biome lint
pnpm format       # run Biome format
pnpm check        # run Biome check --write
pnpm db:generate  # generate Prisma client
pnpm db:migrate   # create/apply local Prisma migration
pnpm db:seed      # seed lookup and demo operational data
pnpm db:studio    # open Prisma Studio
```

## Repository Shape

```text
src/
  features/<feature>/
    api/
    components/
    constants/
    data/
    hooks/
    rules/
    schemas/
    utils/
    index.ts
  routes/
  shared/
  styles/
```

Feature slices own business behavior. Routes compose feature APIs and UI. Shared code is for generic infrastructure and reusable primitives only.

## Development Rules

- Import feature functionality from the feature public barrel.
- Keep route files thin.
- Keep Prisma access in feature `data/` modules and route-facing wrappers in `api/`.
- Put pure throwing business assertions in feature `rules/`.
- Consume HeroUI only through `@/shared/components/ui`.
- Keep user-facing text in pt-BR.
- Keep code names, comments, and logs in English.
- Use lookup `value` at application boundaries, not lookup database IDs.
- Scope tenant data by firm.
- Treat deletes as soft deletes unless docs say otherwise.

## Seed Data

`prisma/seed.ts` creates:

- firm `Matriz`
- lookup values for employee types, roles, client types, legal areas, contract statuses, assignment types, and revenue types
- sample employees, clients, contracts, revenues, fees, and generated remunerations

Seed data is intended for local development and feature verification.

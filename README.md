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
- `expenses`
- `attachments`
- `audit-logs`
- `dashboard`, `authentication`, and `app-sidebar`

Routes currently expose:

- `/` dashboard
- `/clientes`
- `/colaboradores`
- `/contratos`
- `/honorarios`
- `/remuneracoes`
- `/despesas`
- `/auditoria`

The Prisma schema includes the core tenant model, lookup catalogs, clients, employees, contracts, contract assignments, revenues, fees, and system-generated remunerations.

## Documented Stack

- TanStack Start
- TanStack Router
- TanStack Query
- TanStack Form
- TanStack Table
- Prisma
- PostgreSQL
- Private local attachment storage (`ATTACHMENTS_DIR`)
- Clerk Auth
- shadcn/ui through shared UI re-exports
- Zod
- Biome
- Vitest and Testing Library
- TypeScript strict mode
- pnpm

## Project Contract

`docs/` records the project contract. During the final organization pass, preserve the user's current code behavior and update stale docs to match it; functional changes require an explicit decision.

Start here before non-trivial changes:

1. `docs/index.md`
2. `docs/domain/PRODUCT_SENSE.md`
3. `docs/implementation/ARCHITECTURE.md`
4. `docs/implementation/CONVENTIONS.md`
5. `docs/implementation/QUALITY_WORKFLOW.md`

For full context, follow the reading order in `docs/index.md`.

## Local Setup

Install dependencies:

```bash
pnpm install
```

Copy `.env.example` to `.env` and configure database URLs, Clerk keys, `APP_URL` and the private absolute `ATTACHMENTS_DIR`. See [Clerk setup](docs/implementation/CLERK_MIGRATION.md) and [attachment storage](docs/implementation/ATTACHMENTS.md). Minimal database values:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

Generate Prisma client:

```bash
pnpm db:generate
```

Apply existing migrations to a confirmed local development database, then seed demo data:

```bash
pnpm exec prisma migrate deploy
pnpm db:seed
```

Run the app:

```bash
pnpm dev
```

The dev server uses port `3000`.

For schema development, follow the disposable-database workflow in [Data Access](docs/implementation/DATA_ACCESS.md). Demo seed data is for development only. Production deployment uses reviewed migrations and separately prepared lookup/firm bootstrap; never run a reset or demo seed against production.

## Useful Scripts

```bash
pnpm dev          # start TanStack Start dev server
pnpm build        # production build
pnpm test         # run Vitest
pnpm lint         # run Biome lint
pnpm format       # run Biome format
pnpm check        # run Biome check --write
pnpm check:ci     # read-only source and root configuration checks
pnpm typecheck    # validate TypeScript
pnpm verify       # read-only checks, types, full tests, production build
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
- Consume shadcn/ui only through `@/shared/components/ui`.
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

## Release verification

Run `pnpm verify` before release. Automated success does not verify live Clerk settings, database migrations or authenticated browser workflows. Follow [release prerequisites](docs/implementation/QUALITY_WORKFLOW.md#release-verification) before deployment.

## Why

The current Prisma seed only bootstraps lookup catalogs, one firm, employees, and clients, which leaves the contract, fee, and remuneration flows without realistic data to exercise core business behavior. We need deterministic financial fixtures now because the repository has added contract and fee foundations, and those screens are hard to validate without seeded aggregates that cover normal paths and edge cases.

## What Changes

- Expand Prisma seed data to create a deterministic contract financial fixture set for the default firm.
- Seed at least 20 contracts with realistic client, team-assignment, revenue, fee, and remuneration relationships.
- Cover the primary business scenarios used by contract and fee workflows, including referral teams, fees without remuneration generation, partially paid contracts, fully paid contracts, and inactive or soft-deleted records where the seed contract allows them.
- Keep seeded records idempotent so repeated `prisma db seed` runs converge to the same fixture graph instead of duplicating child rows.
- Make seeded data useful for administrators and regular users by distributing assignments across multiple employees and ensuring non-admin visibility paths have meaningful records.

## Capabilities

### New Capabilities
- `development-seed-fixtures`: deterministic Prisma seed fixtures for contract, revenue, fee, and remuneration flows with scenario coverage suitable for local development and manual verification

### Modified Capabilities
- None.

## Impact

- Affected code: `prisma/seed.ts` and any local seed helpers introduced alongside it.
- Affected systems: Prisma seed workflow, local developer bootstrap, manual QA, and any demos that depend on populated financial data.
- Affected roles: administrators and regular users who need seeded contract and fee visibility to validate access scope and financial behavior.
- Multi-tenant impact: seeded financial fixtures remain scoped to the default firm and must preserve tenant-safe foreign-key relationships.

## Non-goals

- This change does not add new production runtime behavior, routes, or APIs.
- This change does not define a public fixture-import interface or user-managed seed customization.
- This change does not introduce a second seeded firm unless a later change explicitly requires cross-tenant fixtures.

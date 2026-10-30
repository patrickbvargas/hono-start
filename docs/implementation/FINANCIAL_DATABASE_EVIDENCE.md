# Financial database foundation — implementation evidence

Date: 2026-10-29 (America/Sao_Paulo). Scope approved in chat: complete Prisma schema and seed first; application/API/UI may remain unavailable during transition.

## Applied target

Project: Supabase `hono-start`, ref `zboxtzuzhdfvjnbfwuys`, PostgreSQL database `postgres`, schema `public`. The target was verified empty before applying migrations. `hono-sdd` was inspected read-only before the user changed `.env`; no data was changed there.

All 27 migrations applied through `20261030060000_prefix_reference_catalogs`. Legacy Client/Employee/Fee/Remuneration/ExpenseCategory/ClientType/UserRole tables are retired. New Person and EmployeeProfile, ContractAssignment, operational origins, titles, generation/direct origins, settlements, unique reversals and calculation evidence are persisted. All financial/operational links enforce Firm with composite FKs. Money uses Decimal(14,2), percentages Decimal(5,4), business dates PostgreSQL DATE.

Technical origin decision: Receivable has exactly one Revenue or DirectFinancialEntry source. Payable has exactly one Expense, DirectFinancialEntry or RemunerationCalculation source. Generation is an optional structured handoff link to the same Revenue/Expense; later extras can preserve operational origin without inventing another initial generation. RemunerationCalculation owns the source Receipt and exact assignment; Payable has a unique FK to that calculation. A deferred constraint requires its Payable in the same transaction. No remuneration formula columns are stored on generic Payable, no settlement lots exist, and balances/status/cash flow are derived.

Database checks/triggers enforce origin exclusivity, generation total equality on initial confirmation, same-origin generation links, positive face/principal, cash equation, nonnegative adjustments, reasons, date bounds, locked remaining principal, cancellation/adjustment floors, immutable events/calculations/audit, unique reversals and beneficiary consistency. Receipt reversal blocks valid remuneration payments, including zero-cash payments, and cancels unpaid generated titles atomically. API authorization, audited title adjustments, request replay response semantics and full application transaction orchestration remain future work; database constraints do not replace them.

RLS is enabled on all 29 application tables and anon/authenticated direct table access is revoked. Prisma's server connection remains the business access boundary. No permissive browser policies were added.

## Persisted fixtures

- 2 Firms; 15 Persons including a company, shared multi-role people and inactive identity; 11 professional profiles.
- 5 Contracts across areas/statuses; assigned teams including responsible/referring/referred/assistant roles.
- 20 Receivables; 26 Payables; 6 Receipts; 3 Payments; 21 immutable remuneration calculations.
- 1 receipt reversal and 1 payment reversal; pending/overdue/partial/settled/cancelled examples; partial and multiple settlements; discounts, charges, zero-cash full discounts in both directions; direct origins; ungenerated Revenue; completed/cancelled operational origins with debt.
- Entry titles remain forecast until actual receipt; exact initial generation totals; 100/3 schedules end in 33.34.
- Ten unpaid lawyer remuneration Payables of 500.00 each, total 5000.00, for later multi-selection payment testing.
- 5 real PNG fixtures uploaded to the configured private Storage bucket: Person, Contract, Expense, Receipt and Payment owners. Downloaded bytes match local fixture; bucket privacy was checked.

## Repeatable commands and results

- `pnpm exec prisma validate`: passed.
- `pnpm exec prisma generate`: passed, installed Prisma 7.10.1.
- `pnpm exec prisma migrate deploy`: passed against initially empty target and subsequent incremental migrations.
- `pnpm exec prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code`: no difference.
- `pnpm run db:seed`: passed, including repeated runs without duplicate monetary events.
- `pnpm exec tsc --noEmit -p prisma/tsconfig.json`: passed for the seed boundary.
- `pnpm exec vitest run src/shared/lib/__tests__/financial-seed-fixtures.test.ts`: 4 tests passed (business date, cutoff/year rollover, clamping, CPF digits).
- `pnpm exec tsx prisma/verify-financial-db.ts`: 11 real database assertions passed. Invalid writes and positive source-reversal/cancellation scenario run in rolled-back transactions. Also verifies RLS/no browser read grants and absence of legacy tables.
- Seed assertions: no over-settlement, orphan calculation, wrong beneficiary, future realized cash or missing eligible remuneration; ten-lawyer total exactly 5000.00.

Seed uses one advisory-locked transaction for catalogs and scenario writes. Marker `financial-target-seed-v1` identifies completed fixtures. Re-running validates existing monetary history and adds named missing fixtures deterministically; it never rewrites confirmed events. Files in `seed-financial-*.ts` replace legacy seed orchestration; old standalone fixture helpers are not executed. Reference dates are generated from America/Sao_Paulo business date on initial seeding. Repetition preserves event dates rather than rewriting history.

External prerequisites: valid DIRECT_URL to intended development database; SUPABASE_URL, SUPABASE_STORAGE_BUCKET and SUPABASE_SECRET_KEY for private evidence. Missing Storage config is explicitly reported; configured storage failures fail the seed. Clerk remains external: future API/session work must explicitly coordinate personId metadata, active EmployeeProfile, membership grants and existing Firm mapping. No provider roles/users/metadata were changed, and employeeId is never silently treated as personId. Deterministic demonstration Person/Profile IDs are not account authorization.

## Limits

`pnpm run db:reset` was attempted but Prisma's AI safety guard refused execution pending specific user confirmation. No reset ran and no guard was bypassed. Initial empty-database migration deployment was verified; two destructive reset cycles were not verified.

Whole-application TypeScript currently fails because legacy APIs/session/attachments still reference removed Prisma models. This is expected in the user-approved schema-first transition; no suppression or legacy compatibility tables were introduced. No passing whole-app `pnpm verify`, usable UI, Clerk login, or concurrent multi-request settlement claim is made. Those are later implementation/release gates, not completed OpenSpec phases.

## Reference catalog prefix

Migration `20261030060000_prefix_reference_catalogs` renames all ten physical catalog tables to `ref_*`, including TitleKind. Primary keys, value indexes and sequences follow the renamed tables. IDs, rows, foreign-key links, RLS and grants are preserved. Prisma model names remain unchanged; raw seed SQL uses the new physical names. Schema validation, scoped seed TypeScript and 11 real database checks passed after migration; schema diff reported no differences and repeated seed completed with unchanged counts and five verified private attachments.

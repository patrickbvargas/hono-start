## 1. Seed Fixture Modeling

- [x] 1.1 Define deterministic fixture inputs for seeded contracts, assignments, revenues, fees, and remunerations using stable business keys.
- [x] 1.2 Map fixture scenario families that cover standard contracts, referral contracts, assistant participation, no-remuneration fees, partially paid contracts, and fully paid contracts with at least 20 total contracts.
- [x] 1.3 Confirm no DB migration is required and keep the change limited to seed-layer behavior.

## 2. Seed Implementation

- [x] 2.1 Extend `prisma/seed.ts` with helper logic to resolve seeded clients, employees, statuses, legal areas, assignment types, and revenue types by stable keys.
- [x] 2.2 Implement transactional per-contract reconciliation so seeded contracts and child rows remain idempotent across repeated seed runs.
- [x] 2.3 Add remuneration-generation helpers that persist seeded remuneration rows using the documented assignment-type formulas and fee payment dates.

## 3. Verification

- [x] 3.1 Run `npx prisma db seed` and verify the seeded dataset includes at least 20 contracts plus the required financial scenario coverage.
- [x] 3.2 Manually inspect seeded contracts, fees, and remunerations to confirm partially paid, fully paid, referral, assistant, and no-remuneration cases are present and internally consistent.
- [x] 3.3 Run `pnpm check` and `npx tsc --noEmit`, fixing any issues before marking the change complete.

## 1. Schemas & Rules

- [x] 1.1 Create `src/features/financial-titles/constants/errors.ts` and `values.ts`
- [x] 1.2 Create `src/features/financial-titles/schemas/form.ts` with Zod validation schemas
- [x] 1.3 Create `src/features/financial-titles/rules/balance.ts` and `counterparty.ts`

## 2. Data Mutations & Bridges

- [x] 2.1 Implement `generateReceivablesFromRevenue` with `ContractRevenueReceivable` bridge in `data/mutations.ts`
- [x] 2.2 Implement `generatePayablesFromExpense` with `ExpensePayable` bridge in `data/mutations.ts`
- [x] 2.3 Implement `createDirectReceivable` and `createDirectPayable` in `data/mutations.ts`

## 3. Server Functions (API Layer)

- [x] 3.1 Create `src/features/financial-titles/api/mutations.ts` with auth middleware, permissions check, and tenant scoping

## 4. Testing & Verification

- [x] 4.1 Unit tests for closure balance lock and title validation rules
- [x] 4.2 Tests for revenue receivable generation and bridge persistence
- [x] 4.3 Tests for expense payable generation and bridge persistence
- [ ] 4.4 Tests for direct titles and verification via `pnpm check:ci` and Vitest

## 5. Contract workflow and testing fixtures

- [x] 5.1 Add and run additive, idempotent contract-generation demo seed without reset.
- [x] 5.2 Replace contract Fee creation with protected Receivable generation from both contract surfaces.
- [x] 5.3 Implement responsive editable table, automatic installment preview and exact closure chip.
- [x] 5.4 Cover automatic updates, cent distribution, seed preservation and closure feedback with focused tests.
- [x] 5.5 Fix single-selection clearing and provide pt-BR validation messages with regression coverage.

## Verification notes

- Implementation and direct-title tests are complete. Task 4.4 remains open because repository-wide checks are not green.
- Focused Vitest verification: 158 tests passed across financial titles, architectural/validation/boilerplate boundaries, session authorization, server session and Member grant boundaries. Prisma clients are mocked, following `QUALITY_WORKFLOW.md`; no live-database concurrency or rollback verification was performed.
- Full Vitest run: 1,198 passed and 14 failed across 219 files. One failure was the missing new-feature barrel registration; it was corrected and its complete suite passes in focused verification. The other 13 failures concern existing removed client/employee routes, outdated detail layouts and dashboard/navigation expectations. The full suite was not repeated after the registry fix.
- Biome passes for all 14 changed/new TypeScript files. `pnpm check:ci` reports 101 existing errors elsewhere in the repository.
- `pnpm typecheck` reports 124 errors in existing attachments, dashboard, fees and remuneration code using outdated model fields. No diagnostics reference `financial-titles` or `member-policy`.
- `openspec validate financial-title-generation --strict` passes. No schema migration or database reset was required.
- Subsequent workflow checks passed: automatic preview, integer-cent schedules, seed guard/idempotency, live closure chip, and scalar autocomplete clearing. The demo contract seed was executed successfully: contract IDs 6 and 7, revenue IDs 8 and 9, initially with no bridges.
- Archive requested explicitly by the user after the outstanding repository-wide verification failures had been reported. Task 4.4 remains unchecked to preserve that limitation; archival does not claim release readiness.
- Final pre-commit verification: 199 tests passed across 17 affected feature, shared-control, session and boundary suites. Biome passed on all 39 checked changed/new source/configuration files. TypeScript reported 125 repository-wide errors, with no diagnostics in changed feature, seed, session-policy or autocomplete modules. Earlier repository-wide failures remain outside this change.

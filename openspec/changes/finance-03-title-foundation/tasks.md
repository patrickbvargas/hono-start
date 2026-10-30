## 1. Implementation

- [ ] 1.1 Design and review Prisma schema for Receivable, Payable, origin/generation/direct-entry relationships, catalogs and Firm cutoff/due-day settings.
- [ ] 1.2 Define Person counterparty, one analytic, expected method, title kind, face amount, due date, cancellation, reason and timestamps; keep remuneration calculation columns out of Payable.
- [ ] 1.3 Introduce constrained global PaymentMethod and a constrained title kind field (DOWN_PAYMENT/INSTALLMENT/EXTRA), without a TitleKind lookup and evolve ExpenseCategory into FinancialAnalytic preserving stable existing values; no Firm FK on catalogs.
- [ ] 1.4 Enforce at most one concrete operational/calculation source (none for manual titles) and same-Firm relationships at database/service boundaries; use concrete validated FKs rather than unchecked polymorphic IDs.
- [ ] 1.5 Create reviewed development schema migrations and deterministic fixtures; add parallel target structures without enabling old dashboards to count both systems.
- [ ] 1.6 Test cancellation, settled-title adjustment floor, analytic correction, counterparty requirements and direct-origin denial for Members.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

## Incremental development seed gate

- [ ] Update seed entrypoint, fixtures/scenarios/evidence and seed assertions alongside this phase's schema/catalog/identity/workflow changes; verify compatibility even if no new fixtures are needed. Preserve deterministic IDs/bindings where configured, domain invariants, Member confidentiality, current UI style and a reproducible final `pnpm run db:reset` path. Record actual validation and external Clerk/Storage prerequisites; do not defer a broken seed to the final phase or execute an unverified database reset.

## Person revision gate — 2026-10-30

- [ ] Follow docs/domain/PERSON_REGISTRATION.md over prior separate-screen/document assumptions. Unified Pessoas route with role checkboxes/filters; employee implies supplier; optional 1:1 ClientProfile, SupplierProfile and EmployeeProfile from this revision; receivable customer/payable supplier eligibility; seeded Pagamentos diversos/Recebimentos diversos generic counterparties without fiscal documents or professional profiles. Ordinary documents stay required/unique. Apply role/document constraints and deterministic generic seed keys first, verify database/seed, then review Clerk/session/projections. Preserve explicit grants, Member field/record confidentiality, real employee commission origin and existing UI style. Record new implementation evidence separately from commits8c0718b/d0cb812; do not mark whole phases done from foundation work.

## Role-profile FK gate

- [ ] Implement/verify the approved ClientProfile/SupplierProfile/EmployeeProfile 1:1 extensions now, derive role checkboxes from active profiles, atomically enforce employee→supplier for the same Person. Explicitly map Contract/Receivable to ClientProfile and Expense/Payable to SupplierProfile. Keep Clerk actor identity as Person, assignment as EmployeeProfile, and resolve beneficiary Person via SupplierProfile in own-scope/calculation checks. Update migrations, seeds (including documentless generic role profiles), FK/lifecycle/ID-mismatch tests and API projections; no duplicate personal fields or independent role-flag truth. Prisma/seed validation precedes Clerk policy work. No bank/address/family implementation now; reference docs/domain/PERSON_REGISTRATION.md.


Revision: remove DirectFinancialEntry and its FKs/triggers; manual titles store their own required data and atomic AuditLog. Replace titleKindId/TitleKind with constrained kind, preserving existing classification. Migrate existing direct titles without losing IDs, counterparties, money, settlements, history or permissions. Update Prisma, SQL guards, seed/reset and verification scripts together; manual titles must not generate remuneration. FinancialGeneration remains for acerto idempotency.

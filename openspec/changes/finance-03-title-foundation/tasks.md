## 1. Implementation

- [ ] 1.1 Design and review Prisma schema for Receivable, Payable, origin/generation/direct-entry relationships, catalogs and Firm cutoff/due-day settings.
- [ ] 1.2 Define Person counterparty, one analytic, expected method, title kind, face amount, due date, cancellation, reason and timestamps; keep remuneration calculation columns out of Payable.
- [ ] 1.3 Introduce constrained global PaymentMethod/TitleKind and evolve ExpenseCategory into FinancialAnalytic preserving stable existing values; no Firm FK on catalogs.
- [ ] 1.4 Enforce exactly one origin and same-Firm relationships at database/service boundaries; use concrete validated FKs rather than unchecked polymorphic IDs.
- [ ] 1.5 Create reviewed development schema migrations and deterministic fixtures; add parallel target structures without enabling old dashboards to count both systems.
- [ ] 1.6 Test cancellation, settled-title adjustment floor, analytic correction, counterparty requirements and direct-origin denial for Members.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

## Incremental development seed gate

- [ ] Update seed entrypoint, fixtures/scenarios/evidence and seed assertions alongside this phase's schema/catalog/identity/workflow changes; verify compatibility even if no new fixtures are needed. Preserve deterministic IDs/bindings where configured, domain invariants, Member confidentiality, current UI style and a reproducible final `pnpm run db:reset` path. Record actual validation and external Clerk/Storage prerequisites; do not defer a broken seed to the final phase or execute an unverified database reset.

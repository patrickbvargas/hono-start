## 1. Implementation

- [ ] 1.1 Create independent Receipt and unique reversal events with per-event effective date, actual PaymentMethod, generate-remuneration choice, principal, discount, interest, penalty, cash and optional proof. No ReceiptBatch/lot or person grouping.
- [ ] 1.2 Build checkbox allocation UI with full-balance defaults, manual adjustment fields and explicit cash versus principal totals; future titles remain selectable.
- [ ] 1.3 Implement cross-Person/origin title multi-selection within one Firm/direction, one common date/actual method copied to each Receipt, all-or-nothing server locking, duplicate-title rejection, idempotency, per-title scope validation and downstream generation inside the transaction.
- [ ] 1.4 Reject future effective dates and above-due allocations; permit reasoned full discounts with zero cash and no remuneration.
- [ ] 1.5 Implement individual/selected-event atomic reversal with dated immutable events; remove target dependence on Fee uniqueness, sequential installment and exhausted-count rules.
- [ ] 1.6 Keep target receipt writes disabled in released navigation until phase 07 atomic remuneration integration and phase 09 acceptance pass.
- [ ] 1.7 Test concurrent double settlement, inaccessible selected title, zero cash, per-Receipt proof ownership, mixed contract/direct eligibility, actual payment method, and reversal/report reconciliation.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

## Incremental development seed gate

- [ ] Update seed entrypoint, fixtures/scenarios/evidence and seed assertions alongside this phase's schema/catalog/identity/workflow changes; verify compatibility even if no new fixtures are needed. Preserve deterministic IDs/bindings where configured, domain invariants, Member confidentiality, current UI style and a reproducible final `pnpm run db:reset` path. Record actual validation and external Clerk/Storage prerequisites; do not defer a broken seed to the final phase or execute an unverified database reset.

## 1. Implementation

- [ ] 1.1 Create ReceiptBatch, Receipt and unique reversal events with effective date, actual method, principal, discount, interest, penalty, cash and shared proof.
- [ ] 1.2 Build checkbox allocation UI with full-balance defaults, manual adjustment fields and explicit cash versus principal totals; future titles remain selectable.
- [ ] 1.3 Implement same-Person/Firm/direction grouping and all-or-nothing server locking, idempotency, scope validation and downstream generation extension inside the transaction.
- [ ] 1.4 Reject future effective dates and above-due allocations; permit reasoned full discounts with zero cash and no remuneration.
- [ ] 1.5 Implement individual/whole-group reversal with dated immutable events; remove target dependence on Fee uniqueness, sequential installment and exhausted-count rules.
- [ ] 1.6 Keep target receipt writes disabled in released navigation until phase 07 atomic remuneration integration and phase 09 acceptance pass.
- [ ] 1.7 Test concurrent double settlement, inaccessible group member, zero cash, proof ownership and reversal/report reconciliation.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

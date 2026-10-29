## 1. Implementation

- [ ] 1.1 Create PaymentBatch, Payment and unique dated reversal models parallel to receipt semantics, while preserving separate directional tables and policy boundaries.
- [ ] 1.2 Build payable selection, grouping, adjustment, optional proof and reversal flows using shared UI and feature-owned orchestration.
- [ ] 1.3 Reuse approved formulas and transactional guarantees through proven small helpers only; no new generic engine imposed on all features.
- [ ] 1.4 Permit expense/remuneration/direct payments only with action and resource grants; Member read_own never implies ability to pay or view other beneficiaries.
- [ ] 1.5 Test discounts/charges on remuneration, zero-cash payments, blocked counterparty edits, partial group reversals and concurrent overpayments.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

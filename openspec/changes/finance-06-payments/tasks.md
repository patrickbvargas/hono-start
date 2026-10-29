## 1. Implementation

- [ ] 1.1 Create Payment and unique dated reversal models; store effective date/actual method and proof ownership on each Payment. Do not create PaymentBatch, payment lots or beneficiary subgroups; retain technical request idempotency/audit correlation.
- [ ] 1.2 Build multi-selection of authorized Payables across beneficiaries/origins in one Firm, with full remaining principal prefilled, partial amounts/adjustments per line and one common effective date/method. Confirm all lines atomically without a same-person check, using shared UI and feature-owned orchestration; support per-Payment proof and reversal.
- [ ] 1.3 Reuse approved formulas and transactional guarantees through proven small helpers only; no new generic engine imposed on all features.
- [ ] 1.4 Permit expense/remuneration/direct payments only with action and resource grants; Member read_own never implies ability to pay or view other beneficiaries.
- [ ] 1.5 Test ten Payables across lawyers totaling5000, partial amounts, discounts/charges, zero cash, cross-Firm/denied/stale lines rolling back everything, duplicate title IDs/retries, per-Payment reversal/proof confidentiality and concurrent overpayments.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

## Incremental development seed gate

- [ ] Update seed entrypoint, fixtures/scenarios/evidence and seed assertions alongside this phase's schema/catalog/identity/workflow changes; verify compatibility even if no new fixtures are needed. Preserve deterministic IDs/bindings where configured, domain invariants, Member confidentiality, current UI style and a reproducible final `pnpm run db:reset` path. Record actual validation and external Clerk/Storage prerequisites; do not defer a broken seed to the final phase or execute an unverified database reset.

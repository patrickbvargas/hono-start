## 1. Implementation

- [ ] 1.1 Preserve Contract/Expense notes and attachments; add separately stored negotiated amount and generated-title financial projections.
- [ ] 1.2 Build TanStack Form acerto preview with inherited amount, optional entry/date, installment count, explicit first due date, method and analytic defaults.
- [ ] 1.3 Implement decimal allocation, final-cent remainder, original-day monthly scheduling, row edits/add/remove and exact cent-level equality between agreed total and preview sum (including entry), enforced on client and transactionally on server; justification cannot bypass a mismatch.
- [ ] 1.4 Confirm generation once per origin atomically with idempotency token/unique boundary; repeat requests return prior result rather than duplicate obligations.
- [ ] 1.5 Expose generation and post-generation adjustments under distinct action grants; keep origin cancellation/status separate from title cancellation.
- [ ] 1.6 Test Jan 31 boundaries, entry-only preview, rejection of both shortfall and excess (even with a reason), exact equality including entry, stale agreed amount at confirmation, permitted post-generation adjustments, duplicate submissions, access denial and shared-contract evidence.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

## Incremental development seed gate

- [ ] Update seed entrypoint, fixtures/scenarios/evidence and seed assertions alongside this phase's schema/catalog/identity/workflow changes; verify compatibility even if no new fixtures are needed. Preserve deterministic IDs/bindings where configured, domain invariants, Member confidentiality, current UI style and a reproducible final `pnpm run db:reset` path. Record actual validation and external Clerk/Storage prerequisites; do not defer a broken seed to the final phase or execute an unverified database reset.

## Person revision gate — 2026-10-30

- [ ] Follow docs/domain/PERSON_REGISTRATION.md over prior separate-screen/document assumptions. Unified Pessoas route with role checkboxes/filters; employee implies supplier; optional 1:1 ClientProfile, SupplierProfile and EmployeeProfile from this revision; receivable customer/payable supplier eligibility; seeded Pagamentos diversos/Recebimentos diversos generic counterparties without fiscal documents or professional profiles. Ordinary documents stay required/unique. Apply role/document constraints and deterministic generic seed keys first, verify database/seed, then review Clerk/session/projections. Preserve explicit grants, Member field/record confidentiality, real employee commission origin and existing UI style. Record new implementation evidence separately from commits8c0718b/d0cb812; do not mark whole phases done from foundation work.

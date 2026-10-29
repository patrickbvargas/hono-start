## 1. Implementation

- [ ] 1.1 Replace legacy scheduled revenue and expense-date cash queries with authorized title/settlement event projections.
- [ ] 1.2 Implement monthly remaining-principal forecast, overdue bucket and effective-cash realized streams with signed dated reversal events.
- [ ] 1.3 Expose negotiated amount, title financial total, post-generation difference, principal abated, cash, discounts/charges and balance with unambiguous labels. Show separate authorized Person receivable/payable balances per Firm, without automatic offset. Do not introduce competence fields/reports; due dates never create automatic settlements.
- [ ] 1.4 Update origin financial status: all active revenue generations plus valid title balances; do not mutate operational status on settlement/reversal.
- [ ] 1.5 Update dashboard, pending work, exports, related drawers, individual Receipt/Payment proof and own remuneration views under pre-aggregation scopes.
- [ ] 1.6 Test partial receipts, full discounts, month-boundary reversals, cancelled origins, ungenerated revenues, out-of-window arrears and Member confidentiality.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

## Additional implementation tasks

- [ ] Implement feature-owned Zod/query/URL contracts and shared-UI filters/grouping for LegalArea, RevenueType and AssignmentType alongside FinancialAnalytic in title lists and reports. Resolve Receivable via Revenue/Contract and remuneration Payable via its exact calculation/assignment and source receipt. Include “Sem vínculo com contrato” for Expense/direct origins. Use authorized existence predicates/deduplicated title/event identities; preserve stable server pagination and consistent counts/exports/options. AssignmentType grouping for Receivables is explicitly overlapping/non-additive, with distinct grand total; no rateio or extra contract-specific title columns.

- [ ] Test multiple same-type assignments, multi-type filters, exact remuneration participation, unrelated origins, combined OR/AND filters, partial/reversed cash, no duplicate grand totals and negative Member/cross-Firm options/export/drilldown cases. Preserve immutable monetary calculation snapshots; dimensions resolve existing origin lookups.

## Incremental development seed gate

- [ ] Update seed entrypoint, fixtures/scenarios/evidence and seed assertions alongside this phase's schema/catalog/identity/workflow changes; verify compatibility even if no new fixtures are needed. Preserve deterministic IDs/bindings where configured, domain invariants, Member confidentiality, current UI style and a reproducible final `pnpm run db:reset` path. Record actual validation and external Clerk/Storage prerequisites; do not defer a broken seed to the final phase or execute an unverified database reset.

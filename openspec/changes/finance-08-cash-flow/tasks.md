## 1. Implementation

- [ ] 1.1 Replace legacy scheduled revenue and expense-date cash queries with authorized title/settlement event projections.
- [ ] 1.2 Implement monthly remaining-principal forecast, overdue bucket and effective-cash realized streams with signed dated reversal events.
- [ ] 1.3 Expose negotiated amount, title financial total, difference, principal abated, cash, discounts/charges and balance with unambiguous labels.
- [ ] 1.4 Update origin financial status: all active revenue generations plus valid title balances; do not mutate operational status on settlement/reversal.
- [ ] 1.5 Update dashboard, pending work, exports, related drawers, batch proof and own remuneration views under pre-aggregation scopes.
- [ ] 1.6 Test partial receipts, full discounts, month-boundary reversals, cancelled origins, ungenerated revenues, out-of-window arrears and Member confidentiality.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

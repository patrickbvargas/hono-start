## 1. Implementation

- [ ] 1.1 Preserve Contract/Expense notes and attachments; add separately stored negotiated amount and generated-title financial projections.
- [ ] 1.2 Build TanStack Form acerto preview with inherited amount, optional entry/date, installment count, explicit first due date, method and analytic defaults.
- [ ] 1.3 Implement decimal allocation, final-cent remainder, original-day monthly scheduling, row edits/add/remove and reasoned reference difference.
- [ ] 1.4 Confirm generation once per origin atomically with idempotency token/unique boundary; repeat requests return prior result rather than duplicate obligations.
- [ ] 1.5 Expose generation and post-generation adjustments under distinct action grants; keep origin cancellation/status separate from title cancellation.
- [ ] 1.6 Test Jan 31 boundaries, entry-only preview, divergent reference, duplicate submissions, access denial and shared-contract evidence.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

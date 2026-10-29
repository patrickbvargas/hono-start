## 1. Implementation

- [ ] 1.1 Inventory every legacy Client/Employee/Fee/Remuneration reference in schema, session, route/search, attachments, audit, export, query keys, tests and docs; resolve each explicitly.
- [ ] 1.2 Prepare coordinated disposable-dev schema recreation and target seed only after confirming intended connection; no production reset or live provider mutation.
- [ ] 1.3 Replace old fee/remuneration/expense semantics in canonical OpenSpec specs and domain docs, including schedule uniqueness and automatic receipt/entry cash assumptions.
- [ ] 1.4 Verify Member/Admin provider setup, Person bindings, exact permissions and all negative access paths; record provider-limit decision without guessing.
- [ ] 1.5 Run full pnpm verify plus isolated real PostgreSQL concurrency/reversal/generation checks and private attachment transport checks.
- [ ] 1.6 Perform documented walkthroughs for contract and expense handoff, direct titles, partial/full/batch settlement, remuneration, reversals and monthly reconciliation.
- [ ] 1.7 Record evidence and remaining blockers; enable target navigation/writes only after preceding gates pass; preserve baseline commit and schema/config rollback recipe.

## 2. Acceptance

- [ ] 2.1 Add focused Vitest coverage for every requirement scenario and relevant denied-scope and rollback boundaries.
- [ ] 2.2 Run pnpm check and npx tsc --noEmit; fix failures without suppressions; record actual focused/integration evidence.
- [ ] 2.3 Reconcile owning canonical docs/specs for implemented behavior, verify predecessor completion and leave later target surfaces gated.

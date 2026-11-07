## 1. Financial operations

- [x] 1.1 Define validated settlement/reversal contracts and money/date rules; no DB migration required.
- [x] 1.2 Implement authorized, locked, idempotent receipt/payment and reversal transactions with audit.
- [x] 1.3 Generate remuneration payables and enforce reversal dependencies atomically.

## 2. Contextual interface

- [x] 2.1 Add feature-owned form hooks, options and guarded settlement/reversal modals.
- [x] 2.2 Compose actions in title workspaces/summaries and movement lists; refresh affected queries.
- [x] 2.3 Update canonical documentation for the implemented scope.

## 3. Verification

- [x] 3.1 Cover financial invariants, grants, retries, locks, remuneration and contextual actions with focused tests.
- [ ] 3.2 Run pnpm check, TypeScript, relevant Vitest coverage and production build; validate OpenSpec.

Verification executed; final gate remains pending because TypeScript reports 124 errors in existing legacy modules outside this change. See verification.md. Do not mark the global gate complete until those errors are resolved.

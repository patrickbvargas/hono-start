## 1. Audit rules-layer naming drift

- [x] 1.1 Review each feature `rules.ts` module and identify private helpers that diverge from the `get...Issue` plus `ValidationIssue | null` convention.
- [x] 1.2 Confirm which exported validator names remain unchanged for this refactor and which local imports or tests must move with the helper cleanup.

## 2. Normalize feature validation helpers

- [x] 2.1 Refactor `src/features/employees/rules.ts` so private single-issue helpers return `ValidationIssue | null` and use `get...Issue` names without changing messages or paths.
- [x] 2.2 Update employee schema and test call sites to match the normalized helper and validator naming used by the refactor.
- [x] 2.3 Apply the same normalization to any other feature `rules.ts` helper discovered in the audit that still returns message-only fragments or uses inconsistent single-issue naming.

## 3. Verify contract alignment

- [x] 3.1 Update or add targeted tests so the refactored `rules.ts` modules still produce the same validation outcomes as before.
- [x] 3.2 Run `pnpm check` and fix any reported issues.
- [x] 3.3 Run `npx tsc --noEmit` and fix any reported issues.

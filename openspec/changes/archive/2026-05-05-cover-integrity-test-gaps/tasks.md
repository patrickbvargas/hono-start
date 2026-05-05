## 1. OpenSpec And Coverage Alignment

- [x] 1.1 Add the OpenSpec proposal, design, and delta spec for the targeted integrity-test coverage gaps

## 2. Mutation Coverage

- [x] 2.1 Extend employee mutation tests to cover delete and restore success and blocked lifecycle cases
- [x] 2.2 Extend fee mutation tests to cover reparenting guards, disabled-remuneration preservation, and contract-status synchronization branches
- [x] 2.3 Extend contract mutation tests to cover successful lifecycle writes and remaining status guards
- [x] 2.4 Extend attachment mutation tests to cover negative infrastructure and missing-record branches

## 3. Hook Coverage

- [x] 3.1 Add authentication password-reset hook tests for success feedback, cache invalidation, and redirect orchestration

## 4. Verification

- [x] 4.1 Run focused Vitest coverage for the changed suites
- [x] 4.2 Run `pnpm check` and `npx tsc --noEmit` and fix any resulting issues

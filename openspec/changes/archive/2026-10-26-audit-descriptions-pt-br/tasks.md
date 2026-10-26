## 1. Persistence and documentation

- [x] 1.1 Translate all existing business audit description templates to pt-BR; no database migration required.
- [x] 1.2 Document the description persistence language and technical-value exception.

## 2. Verification

- [x] 2.1 Extend focused mutation tests to verify Portuguese observations and unchanged operational values.
- [x] 2.2 Run focused Vitest suites, pnpm check, npx tsc --noEmit and OpenSpec validation; inspect the final diff.

Validation: 87 focused tests passed across 16 files (the expense suite was rerun after correcting its expected fixture ID from 1 to 9). pnpm check, npx tsc --noEmit, strict OpenSpec validation and git diff --check passed.

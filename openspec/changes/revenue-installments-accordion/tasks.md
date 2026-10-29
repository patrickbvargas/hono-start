## 1. Data and presentation

- [x] 1.1 Extend validated contract detail with schedule and receipt dates; no DB migrations required.
- [x] 1.2 Add initially collapsed shared accordion with masked amounts and payment statuses.

## 2. Verification

- [x] 2.1 Cover schedule math, status and disclosure behavior with focused tests; update domain docs.
- [x] 2.2 Run pnpm check, TypeScript and focused Vitest coverage; validate OpenSpec.


Validation: pnpm check and npx tsc --noEmit passed; focused Vitest run: 5 files, 24 tests passed; openspec strict validation passed.

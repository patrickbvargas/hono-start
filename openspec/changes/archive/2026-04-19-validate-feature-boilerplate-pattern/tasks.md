## 1. Contract Update

- [x] 1.1 Add the concise feature boilerplate matrix to the owning implementation docs.
- [x] 1.2 Update active OpenSpec specs for `entity-foundation` and `form-validation-boundaries`.
- [x] 1.3 Ensure overlapping docs point to the canonical pattern instead of duplicating conflicting rules.

## 2. Feature Audit

- [x] 2.1 Audit `src/features/clients` as the reference slice.
- [x] 2.2 Audit `src/features/employees` against the same responsibility matrix.
- [x] 2.3 Audit `src/features/contracts` against the same responsibility matrix.
- [x] 2.4 Audit `src/features/fees` against the same responsibility matrix.
- [x] 2.5 Audit `src/features/remunerations` against the same responsibility matrix.
- [x] 2.6 Record justified exceptions in the implementation docs or feature-specific spec where needed.

## 3. Synchronization

- [x] 3.1 Normalize public feature barrels so route-facing consumers see a consistent surface.
- [x] 3.2 Normalize feature-local error catalogs and thrown safe error messages.
- [x] 3.3 Normalize pure rule modules so exported entrypoints are `assert...` throwing assertions.
- [x] 3.4 Normalize equivalent hook options, route-facing params, and component props naming.
- [x] 3.5 Normalize utility placement for defaults, normalization, and formatting helpers.
- [x] 3.6 Confirm route files consume feature barrels and do not import feature internals.
- [x] 3.7 Replace inline `if` single-statement returns with braced blocks in all synchronized feature code.
- [x] 3.8 Remove nested feature-folder barrel `index.ts` and `index.tsx` files, preserving only each feature's top-level public barrel.

## 4. Verification

- [x] 4.1 Add or update targeted tests/checks for public barrels and high-value boilerplate drift.
- [x] 4.2 Add or update checks that detect nested feature-folder barrels and inline braceless `if` statements.
- [x] 4.3 Run `pnpm check`.
- [x] 4.4 Run `npx tsc --noEmit`.
- [x] 4.5 Fix all reported issues before marking the change complete.

## Notes

- DB migrations required: No.
- User-facing behavior changes intended: No.

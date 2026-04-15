## Context

`contracts` currently stores aggregate write assertions in `utils/validation.ts`, including assignment, revenue, referral, and percentage compatibility rules. Those assertions are central business logic and should be discoverable from one canonical feature-local file.

## Goals / Non-Goals

**Goals:**
- Make `src/features/contracts/rules.ts` the canonical home for contract business validation that does not require Prisma.
- Keep exported contract validators on the `validate...` naming convention.
- Preserve current aggregate contract write behavior.

**Non-Goals:**
- Changing lookup resolution or current-record checks in `api/lookups.ts`.
- Reworking the contract route, UI, or server transaction shape.

## Target Slice Shape

```text
src/features/contracts/
  api/
  components/
  constants/
  hooks/
  rules.ts
  schemas/
  utils/
  index.ts
```

## Decisions

### D1. `rules.ts` owns non-Prisma contract assertions

Move contract write rules such as:

- required active assignments
- required active revenues
- revenue limit
- unique active assignments
- unique active revenue types
- down payment bounds
- assignment compatibility
- referral composition and percentage compatibility
- responsible lawyer presence

into `src/features/contracts/rules.ts`.

### D2. Exported contract entrypoints use `validate...`

Preferred exported entrypoints:

- `validateContractWriteRules(...)`

Private helpers may remain narrower and internal.

### D3. Persisted-state and lookup checks stay in API helpers

Rules that depend on Prisma-backed resolution remain outside `rules.ts`, but the pure/non-Prisma business-rule implementation becomes discoverable from one file.

### D4. Zod remains the authoritative parsed-valid boundary

Where a contract rule is pure and database-free, the contract schema boundary should enforce it so a successful Zod parse means the payload is valid for all pure non-Prisma contract rules.

### D5. Feature tests live under `__tests__`

Focused tests for the contract refactor live inside feature-local `__tests__` folders, colocated with the contract context they validate.

## Migration Plan

1. Create `src/features/contracts/rules.ts`.
2. Move non-Prisma contract validation/assertion logic from `utils/validation.ts` into `rules.ts`.
3. Rename exported contract rule entrypoints to the `validate...` convention.
4. Update current API write modules to import from `rules.ts`.
5. Remove `utils/validation.ts`.
6. Add or update focused tests under `src/features/contracts/**/__tests__/`.

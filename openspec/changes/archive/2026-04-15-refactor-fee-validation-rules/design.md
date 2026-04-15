## Context

`fees` currently mixes normalization, non-Prisma fee assertions, and Prisma-backed resource checks across `utils/` and `api/`. The `clients` feature established `rules.ts` as the canonical home for pure business validation, and `fees` should adopt the same pattern.

## Goals / Non-Goals

**Goals:**
- Make `src/features/fees/rules.ts` the first place to inspect fee business validation.
- Keep exported fee rule entrypoints on the `validate...` naming convention.
- Preserve current fee create and update behavior.

**Non-Goals:**
- Changing remuneration-generation side effects or parent-resource authorization.
- Reworking fee normalization if it already belongs in the schema or helper boundary.

## Target Slice Shape

```text
src/features/fees/
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

### D1. `rules.ts` owns non-Prisma fee rules

Move rules such as:

- amount must be positive
- installment number must be at least one
- active installment uniqueness
- fee parent consistency
- remuneration-generation decision helpers

into `src/features/fees/rules.ts`.

### D2. Exported fee validators use `validate...`

Preferred exported entrypoints:

- `validateFeeWriteRules(...)`
- `validateUniqueActiveInstallment(...)`

Internal helpers may remain private support functions.

### D3. Resource lookups remain outside `rules.ts`

Firm-scoped parent-resource reads and persisted-state checks remain in API helpers. `rules.ts` owns the non-Prisma business validation only.

### D4. Zod remains the authoritative parsed-valid boundary

Where a fee rule is pure and database-free, the fee schema boundary should enforce it so a successful Zod parse means the payload is valid for all pure non-Prisma fee rules.

### D5. Feature tests live under `__tests__`

Focused tests for the fee refactor live inside feature-local `__tests__` folders, colocated with the fee context they validate.

## Migration Plan

1. Create `src/features/fees/rules.ts`.
2. Move non-Prisma fee validation from `utils/validation.ts` into `rules.ts`.
3. Rename exported fee rule entrypoints to the `validate...` convention.
4. Update fee API write modules to import from `rules.ts`.
5. Remove `utils/validation.ts`.
6. Add or update focused tests under `src/features/fees/**/__tests__/`.

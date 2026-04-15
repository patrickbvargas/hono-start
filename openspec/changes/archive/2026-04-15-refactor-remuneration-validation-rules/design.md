## Context

`remunerations` currently uses `utils/validation.ts` for amount and effective-percentage validation. The feature is small, but it should still align with the repository's `rules.ts` convention established by `clients`.

## Goals / Non-Goals

**Goals:**
- Make `src/features/remunerations/rules.ts` the canonical home for pure remuneration validation.
- Keep exported remuneration rule entrypoints on the `validate...` naming convention.
- Preserve current remuneration update behavior.

**Non-Goals:**
- Changing remuneration authorization, persisted-state checks, or export behavior.
- Reworking remuneration route or UI composition.

## Target Slice Shape

```text
src/features/remunerations/
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

### D1. `rules.ts` owns pure remuneration rules

Move rules such as:

- amount must be positive
- effective percentage must stay between 0 and 1

into `src/features/remunerations/rules.ts`.

### D2. Exported remuneration validators use `validate...`

Preferred exported entrypoints:

- `validateRemunerationAmountRules(...)`
- `validateRemunerationEffectivePercentageRules(...)`

### D3. Persisted remuneration checks remain in API helpers

Current-record access and lifecycle checks remain in API/resource helpers. `rules.ts` owns the pure validation only.

### D4. Zod remains the authoritative parsed-valid boundary

Where a remuneration rule is pure and database-free, the remuneration schema boundary should enforce it so a successful Zod parse means the payload is valid for all pure remuneration rules.

### D5. Feature tests live under `__tests__`

Focused tests for the remuneration refactor live inside feature-local `__tests__` folders, colocated with the remuneration context they validate.

## Migration Plan

1. Create `src/features/remunerations/rules.ts`.
2. Move pure remuneration validation from `utils/validation.ts` into `rules.ts`.
3. Rename exported remuneration rule entrypoints to the `validate...` convention.
4. Update remuneration API write modules to import from `rules.ts`.
5. Remove `utils/validation.ts`.
6. Add or update focused tests under `src/features/remunerations/**/__tests__/`.

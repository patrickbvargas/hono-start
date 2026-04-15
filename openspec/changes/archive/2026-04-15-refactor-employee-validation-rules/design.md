## Context

`employees` currently uses `utils/validation.ts` for pure rules such as OAB requirements and referral percentage constraints. The repository now treats `rules.ts` as the canonical home for pure feature business validation, so `employees` should adopt the same discoverable pattern used by `clients`.

## Goals / Non-Goals

**Goals:**
- Make `src/features/employees/rules.ts` the first place a maintainer checks for pure employee business validation.
- Keep exported employee validators on the `validate...` naming convention.
- Preserve current employee create and update behavior.

**Non-Goals:**
- Changing lookup resolution, authorization, or server persistence flow.
- Reworking employee normalization beyond what the current schema already owns.

## Target Slice Shape

```text
src/features/employees/
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

### D1. `rules.ts` owns pure employee rules

Move pure rules such as:

- OAB required when type is lawyer
- referral percentage cannot exceed remuneration percentage

into `src/features/employees/rules.ts`.

### D2. Exported employee rule entrypoints use `validate...`

Preferred entrypoints:

- `validateEmployeeBusinessRules(input)`

Private helper functions may keep narrower names when they support the main validator.

### D3. Schema remains the authoritative boundary for pure form validation

`schemas/form.ts` continues to call the canonical validator during refinement so a successful parse still means the submitted payload is valid for pure employee rules.

### D4. Feature tests live under `__tests__`

Focused tests for the employee refactor live inside feature-local `__tests__` folders, colocated with the employee context they validate.

## Migration Plan

1. Create `src/features/employees/rules.ts`.
2. Move pure employee validation from `utils/validation.ts` into `rules.ts`.
3. Update `schemas/form.ts` imports.
4. Remove `utils/validation.ts`.
5. Add or update focused tests under `src/features/employees/**/__tests__/`.

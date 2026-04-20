## Why

The `employees` feature still keeps pure business validation in `utils/validation.ts`, while `clients` now uses a canonical `rules.ts` file. That makes validation placement inconsistent across feature slices and increases the cost of finding or changing employee rules.

## What Changes

- Introduce `src/features/employees/rules.ts` as the canonical home for pure employee business validation.
- Move the current employee business validation from `utils/validation.ts` into `rules.ts`.
- Standardize exported employee rule entrypoints on the `validate...` prefix.
- Update `schemas/form.ts` to reuse `rules.ts` so a successful Zod parse means the payload is valid for all pure employee rules.
- Keep lookup-backed employee type and role checks in `api/`.
- Add or update focused tests under feature-local `__tests__` folders.

## Non-Goals

- Changing employee-facing behavior, permissions, or lookup resolution flow.
- Refactoring employee option queries or route composition.
- Moving Prisma-backed checks out of `api/`.

## Capabilities

### Modified Capabilities
- `employee-management`: keep employee create and update behavior unchanged while relocating pure validation into `rules.ts`.

## Impact

- Affected code: `src/features/employees/**`
- Affected specs: `openspec/specs/employee-management/spec.md`
- Affected tests: employee form and validation tests

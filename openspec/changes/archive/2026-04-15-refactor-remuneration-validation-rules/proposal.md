## Why

The `remunerations` feature still keeps its pure validation helpers in `utils/validation.ts`, while `clients` now uses a canonical `rules.ts` file. Even though the remuneration slice is smaller, keeping the same pattern across features reduces maintenance friction.

## What Changes

- Introduce `src/features/remunerations/rules.ts` as the canonical home for pure remuneration business validation.
- Move the current remuneration validation helpers from `utils/validation.ts` into `rules.ts`.
- Standardize exported remuneration rule entrypoints on the `validate...` prefix.
- Update the remuneration update schema and/or API usage so a successful Zod parse means the payload is valid for all pure remuneration rules.
- Keep persisted remuneration access checks in `api/`.
- Add or update focused tests under feature-local `__tests__` folders.

## Non-Goals

- Changing remuneration lifecycle, authorization, or export behavior.
- Refactoring remuneration resource access or route composition.

## Capabilities

### New Capabilities
- `remuneration-management`: define the remuneration feature's validation-boundary contract.

## Impact

- Affected code: `src/features/remunerations/**`
- Affected specs: new `openspec/specs/remuneration-management/spec.md`
- Affected tests: remuneration validation tests

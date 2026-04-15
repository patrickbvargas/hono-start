## Why

The `fees` feature still keeps pure fee validation in `utils/validation.ts`, while `clients` now uses a canonical `rules.ts` file. Adopting the same pattern keeps feature internals consistent and makes fee rules easier to find.

## What Changes

- Introduce `src/features/fees/rules.ts` as the canonical home for fee business validation that does not require Prisma.
- Move current fee rule helpers from `utils/validation.ts` into `rules.ts`.
- Standardize exported fee rule entrypoints on the `validate...` prefix.
- Update fee write schemas and/or API usage so a successful Zod parse means the payload is valid for all pure non-Prisma fee rules.
- Keep fee reference normalization and Prisma-backed resource checks in their current layers.
- Add or update focused tests under feature-local `__tests__` folders.

## Non-Goals

- Changing fee lifecycle behavior, remuneration side effects, or contract-status sync.
- Refactoring fee write orchestration or route composition.
- Moving Prisma-backed resource access out of `api/`.

## Capabilities

### Modified Capabilities
- `fee-management`: keep fee create and update behavior unchanged while relocating non-Prisma validation into `rules.ts`.

## Impact

- Affected code: `src/features/fees/**`
- Affected specs: `openspec/specs/fee-management/spec.md`
- Affected tests: fee validation and write-path tests

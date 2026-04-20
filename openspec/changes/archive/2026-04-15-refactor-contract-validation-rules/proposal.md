## Why

The `contracts` feature still keeps aggregate contract validation in `utils/validation.ts`, while `clients` now uses a canonical `rules.ts` file. The contract slice has the largest concentration of business assertions, so discoverability matters even more there.

## What Changes

- Introduce `src/features/contracts/rules.ts` as the canonical home for contract business validation that does not require Prisma.
- Move current contract business assertions from `utils/validation.ts` into `rules.ts`.
- Standardize exported contract rule entrypoints on the `validate...` prefix.
- Update contract write schemas and/or API usage so a successful Zod parse means the payload is valid for all pure non-Prisma contract rules.
- Keep lookup resolution and persisted-state checks in `api/`.
- Preserve current create and update behavior.
- Add or update focused tests under feature-local `__tests__` folders.

## Non-Goals

- Rewriting contract create/update orchestration.
- Moving Prisma-backed lookup resolution out of `api/`.
- Changing route behavior, permissions, or lifecycle semantics.

## Capabilities

### Modified Capabilities
- `contract-management`: keep contract aggregate write behavior unchanged while relocating business rules into `rules.ts`.

## Impact

- Affected code: `src/features/contracts/**`
- Affected specs: `openspec/specs/contract-management/spec.md`
- Affected tests: contract write validation tests

## Why

The feature-local `rules.ts` layer has drifted into two naming and return-shape styles. Most features expose `validate...` entrypoints and use private helpers named `get...Issue` that return `ValidationIssue | null`, but the employee slice still uses `get...Message` helpers that return string messages and build issues later.

This change standardizes the `rules.ts` convention before more features copy the inconsistent shape. The goal is to make the business-validation layer easier to read, compare, and refactor without changing any business rule behavior or user-facing Portuguese messages.

## What Changes

- Standardize feature-local `rules.ts` private helper naming around `get...Issue` for helpers that return a single validation problem.
- Standardize pure business-rule helpers to return `ValidationIssue` objects directly instead of returning message strings that are adapted later.
- Align the employee feature with the established `rules.ts` pattern already used by contracts, fees, and remunerations.
- Review existing feature `rules.ts` modules and tests to remove naming drift while preserving validation behavior.
- Clarify the canonical contract for `rules.ts` naming so future refactors and new features follow the same pattern.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `entity-foundation`: clarify the canonical naming contract for feature-local `rules.ts` validators and private single-issue helpers.
- `form-validation-boundaries`: clarify that reusable pure validation helpers should return `ValidationIssue` objects directly rather than message-only fragments.

## Impact

- Affected code: `src/features/*/rules.ts`, with direct updates expected in `src/features/employees/rules.ts` and related tests or schema imports.
- Affected docs/specs: `openspec/specs/entity-foundation/spec.md` and `openspec/specs/form-validation-boundaries/spec.md`.
- Affected roles: developers and reviewers maintaining feature validation layers.
- Multi-tenant impact: none; this change does not alter tenant scoping, authorization, or persisted business behavior.

## Non-goals

- Changing any validation rule outcome, error message text, or field path semantics.
- Moving Prisma-backed lookup validation into `rules.ts`.
- Renaming unrelated exported validators when their current `validate...` prefix already matches the contract.
- Introducing a shared validation framework or cross-feature abstraction beyond the existing `ValidationIssue` contract.

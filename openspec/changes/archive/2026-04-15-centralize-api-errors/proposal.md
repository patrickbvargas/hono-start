## Why

The codebase currently repeats the same Portuguese error strings in the place where an error is thrown and again in `hasExactErrorMessage(...)` checks during API handling. That duplication makes the error contract fragile: when a message changes, multiple call sites must be updated in sync.

## What Changes

- Introduce per-feature `constants/errors.ts` modules as the canonical source for all feature-specific Portuguese error messages.
- Split each feature's `constants/index.ts` into focused files instead of keeping cache keys, domain values, sorting config, and errors together.
- Update feature validation helpers, lookup resolvers, resource guards, and API handlers to import error constants instead of hardcoding strings.
- Revise `hasExactErrorMessage(...)` so feature handlers can compare against a canonical error catalog without duplicating the same string list at the catch site.
- Preserve the current user-facing Portuguese messages and current validation behavior.

## Non-Goals

- Changing user-visible wording for the current error messages.
- Introducing a new error-code system or changing exception types.
- Refactoring non-feature shared modules beyond what is required to support the new error constant pattern.

## Capabilities

### New Capabilities
- `feature-error-catalogs`: feature-level server and validation errors are centralized in canonical Portuguese catalogs and reused by exact error matching logic.

### Modified Capabilities
- None.

## Impact

- Affects all feature slices under `src/features/{clients,contracts,employees,fees,remunerations}`.
- Affects `src/shared/lib/error-mapping.ts` and selected shared authorization helpers if they currently own hardcoded Portuguese messages.
- Requires new `constants/errors.ts` files and smaller `constants/*` modules for each feature.
- Updates API handlers, validation helpers, lookup resolvers, and resource guards to consume shared feature error constants.

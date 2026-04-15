## Why

The feature `rules.ts` files now share the same private helper convention, but the exported validator names still drift between `BusinessRules`, `WriteRules`, `DocumentRules`, and other purpose-specific suffixes. That makes the feature boundary less predictable than it should be when reading, importing, or reviewing validation entrypoints across slices.

This change standardizes the exported validator naming contract so feature-local `rules.ts` modules use the same public pattern where they serve the same role. The goal is consistency at the feature boundary, not any change to business rules or validation outcomes.

## What Changes

- Standardize exported `rules.ts` validator naming across feature slices around a single predictable public pattern for write-oriented validation entrypoints.
- Rename exported validators whose current names drift from the chosen pattern and update all direct imports, schema refinements, and tests that consume them.
- Preserve feature-local helper behavior, validation messages, field paths, and business outcomes.
- Clarify the repository contract for exported validator names so future features do not reintroduce mixed suffixes.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `entity-foundation`: clarify the canonical public naming contract for exported `rules.ts` validators.
- `form-validation-boundaries`: clarify how form schemas consume the standardized exported write-validator entrypoint from `rules.ts`.

## Impact

- Affected code: `src/features/*/rules.ts`, plus direct consumers in `schemas/form.ts`, server-side validation call sites, and feature tests.
- Affected docs/specs: `openspec/specs/entity-foundation/spec.md` and `openspec/specs/form-validation-boundaries/spec.md`.
- Affected roles: developers and reviewers working on feature validation and feature-slice consistency.
- Multi-tenant impact: none; this change is limited to naming and import consistency at the validation boundary.

## Non-goals

- Changing any validation rule, message text, field path, or persistence behavior.
- Renaming non-validator exports such as server-side assertion helpers that intentionally serve a different purpose.
- Introducing shared cross-feature validator abstractions.
- Standardizing unrelated naming in APIs, hooks, or schema files beyond the direct validator entrypoints touched by this refactor.

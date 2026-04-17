## Why

The feature slices now share the same top-level folder anatomy and the validation layer is much more consistent, but the implementation still drifts in several important places: public barrel surface area, form-hook submit flow, utility naming, API module naming, and test depth outside schemas and rules. The codebase feels close to standardized, but not yet reliably interchangeable feature to feature.

This change aligns the remaining slice-level inconsistencies so every feature follows the same practical house pattern, not just the same folder shape. The goal is that a contributor can move between `clients`, `employees`, `contracts`, `fees`, and `remunerations` and find the same ownership boundaries, naming rules, and orchestration style.

## What Changes

- Standardize the public feature barrel contract so slices expose the same category of feature-level APIs, components, hooks, constants, and types.
- Align feature form hooks to the same submit orchestration pattern, including parsed payload handling and default-value naming.
- Review feature-local utility and API module naming so equivalent responsibilities use the same conventions across slices.
- Expand consistency beyond the validation layer by defining expected test coverage for feature schemas, rules, and orchestration-critical modules.
- Remove remaining implementation drift that makes one slice feel structurally different from another without a documented product reason.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `entity-foundation`: clarify the canonical public feature surface, feature-local naming, and cross-slice consistency contract for equivalent slice responsibilities.
- `form-validation-boundaries`: clarify the canonical form-hook submission pattern and how validated payloads flow from schema to mutation boundaries without inconsistent reparsing or casting.

## Impact

- Affected code: `src/features/*/index.ts`, `src/features/*/hooks/use-form.ts`, selected `src/features/*/utils/*.ts`, selected `src/features/*/api/*.ts`, and tests that validate these conventions.
- Affected docs/specs: `openspec/specs/entity-foundation/spec.md` and `openspec/specs/form-validation-boundaries/spec.md`.
- Affected roles: developers and reviewers maintaining feature slices and evaluating consistency across entities.
- Multi-tenant impact: none; this change is structural and convention-focused, not a change to tenant scope or permissions.

## Non-goals

- Changing business rules, permissions, or user-facing behavior merely for stylistic symmetry.
- Forcing unrelated features to export identical functions when their product responsibilities are genuinely different.
- Introducing a shared framework for all feature logic.
- Rewriting route composition or persistence behavior when the current implementation already matches the contract.

## Why

The current implementation docs describe a generic feature-slice contract, but they no longer point to the most coherent real example in the codebase. `src/features/clients_v2` now represents the clearest working pattern for feature boundaries, naming, server orchestration, read-model mapping, and route-facing public surface, so the docs should adopt it explicitly before other slices continue drifting.

## What Changes

- Update the implementation docs to treat `src/features/clients_v2` as the canonical reference slice for future feature work.
- Clarify the canonical feature-slice folder anatomy, including `api/queries.ts`, `api/mutations.ts`, `data/queries.ts`, `data/mutations.ts`, `hooks/`, `components/`, `schemas/`, `rules/`, `utils/`, and `index.ts`.
- Clarify the expected responsibility split between `api/`, `data/`, `rules/`, `hooks/`, and route files based on the `clients_v2` pattern.
- Clarify the canonical read-model convention that feature read schemas expose UI-ready label fields alongside stable lookup `value` fields when both are needed.
- Clarify the expected public barrel shape and the intended minimal route-facing feature surface.
- Clarify the expected write-flow pattern for feature form hooks, including schema selection, parsed payload submission, toast feedback, and cache refresh behavior.
- Align implementation docs with the `assertX` rule-entrypoint convention actually used by the reference slice.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `entity-foundation`: redefine the canonical reference feature slice and the expected feature-slice structure, ownership boundaries, naming, and public barrel shape around `src/features/clients_v2`.
- `form-validation-boundaries`: clarify the canonical write-flow, lookup-value handling, read-model mapping expectations, and form-hook submission pattern used by the reference slice.

## Impact

- Affected docs: `docs/implementation/ARCHITECTURE.md`, `docs/implementation/CONVENTIONS.md`, and `docs/implementation/FRONTEND.md`.
- Affected OpenSpec capabilities: `openspec/specs/entity-foundation/spec.md` and `openspec/specs/form-validation-boundaries/spec.md`.
- Affected code expectations: future and refactored slices under `src/features/*` should follow the `clients_v2` structure unless a documented exception exists.
- Affected roles: developers and reviewers establishing or evaluating feature-slice structure.
- Multi-tenant impact: none; this change standardizes implementation structure, not firm-scoping or permissions behavior.

## Non-goals

- Refactoring all existing feature slices in the same change.
- Changing business rules, permissions, or user-facing behavior.
- Introducing shared abstractions merely to make slices look identical.
- Turning the reference slice into a copy-paste template that suppresses justified feature-specific differences.

## Why

The repository already separates read-model schemas in `schemas/model.ts` from request-shape schemas in `schemas/form.ts`, but the current naming only makes that distinction partially explicit. As more features translate between persisted models and write payloads in the same file, names like `Contract` vs `ContractUpdate` and `contractSchema` vs `contractUpdateSchema` make the boundary harder to scan and easier to misuse.

## What Changes

- Standardize feature request and write schemas to use explicit `Input` naming in `schemas/form.ts`.
- Keep read-model schemas and inferred types in `schemas/model.ts` concise and domain-oriented.
- Rename create, update, id, and nested write contracts across feature slices to follow the same `...InputSchema` and `...Input` pattern.
- Update the implementation contract and feature-local references so hooks, API handlers, defaults, and validation utilities use the new names consistently.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `form-validation-boundaries`: form-side schema naming must explicitly communicate request and write input intent, while model-side schema naming remains concise.

## Impact

- Affected code: `src/features/*/schemas/form.ts`, feature-local hooks, API modules, defaults, validation helpers, and any contract docs that name form-side schema symbols.
- Affected docs/specs: `docs/implementation/CONVENTIONS.md`, `openspec/specs/form-validation-boundaries/spec.md`.
- Dependencies: none.
- User roles: none; this is an internal implementation and contract clarity change.
- Multi-tenant impact: none; firm scoping and authorization behavior remain unchanged.

## Non-goals

- Changing runtime validation behavior or business rules.
- Renaming read-model schemas in `schemas/model.ts` to add `Model` suffixes.
- Introducing new feature structure, shared abstractions, or API behavior changes.

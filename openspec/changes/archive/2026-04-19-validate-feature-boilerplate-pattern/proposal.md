## Why

The principal feature slices are implemented, but the project still needs one concise, validated boilerplate pattern that every feature follows. Today the contract describes the broad slice shape and names `src/features/clients` as the reference slice, but contributors still have to infer practical details from code: exact file responsibilities, equivalent naming, thrown-error expectations, rule assertion boundaries, hook options, component props, and route-facing parameter shape.

This change formalizes that pattern, audits the implemented principal features against it, and syncs the implementation docs and OpenSpec specs so future feature work does not drift.

## What Changes

- Define the canonical feature boilerplate pattern for entity-management slices.
- Validate `clients`, `employees`, `contracts`, `fees`, and `remunerations` against the same responsibility matrix.
- Normalize unjustified drift in folder structure, file naming, public barrels, rule assertions, error constants, hook option interfaces, component prop interfaces, and route-facing parameter shapes.
- Standardize control-flow style so `if` statements always use braces and do not use inline single-statement returns.
- Remove nested barrel `index` files inside feature folders, keeping only the top-level feature public barrel.
- Update `docs/implementation/*` and active OpenSpec specs so the concise pattern is documented in one place and referenced by related docs.
- Add or update targeted checks that make feature-slice drift visible during review.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `entity-foundation`: define the canonical feature boilerplate pattern, including folder structure, naming conventions, file responsibilities, public-barrel scope, error throwing, rule assertions, and props/options shape.
- `form-validation-boundaries`: clarify how form inputs, parsed payloads, hook options, and mutation parameters flow through the canonical feature pattern.

## Impact

- Affected code: `src/features/clients`, `src/features/employees`, `src/features/contracts`, `src/features/fees`, `src/features/remunerations`, feature-barrel tests, and targeted convention checks.
- Affected docs/specs: `docs/implementation/ARCHITECTURE.md`, `docs/implementation/CONVENTIONS.md`, `docs/implementation/FRONTEND.md`, `docs/implementation/WORKFLOW.md`, `openspec/specs/entity-foundation/spec.md`, and `openspec/specs/form-validation-boundaries/spec.md`.
- Affected roles: developers and reviewers maintaining feature slices.
- Multi-tenant impact: none intended; this change standardizes implementation shape without changing tenant scope, permissions, or business behavior.

## Non-goals

- Do not change product behavior, business rules, permissions, routes, or UI copy solely for symmetry.
- Do not force features with different product responsibilities to have identical file counts.
- Do not extract a generic feature framework that hides feature-local ownership.
- Do not replace the documented stack or route/list/modal/drawer interaction pattern.
- Do not remove the top-level feature public barrel; it remains the route-facing entrypoint.

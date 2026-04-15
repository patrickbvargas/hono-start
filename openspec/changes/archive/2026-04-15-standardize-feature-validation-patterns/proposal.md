## Why

The codebase has reached the point where the employee slice is acting as the practical reference for how feature code should be shaped, but the pattern is still uneven in places. Some validations are duplicated between form schemas, hooks, and server handlers, while a few checks are hardcoded compatibility shims instead of being expressed through one canonical boundary.

This change makes that pattern explicit so every feature follows the same code shape for validation, lookup resolution, and server-side business checks. The goal is not to change product behavior, but to make the implementation easier to read, compare, and extend without re-inventing the same flow in each slice.

## What Changes

- Standardize a single feature-slice pattern across the repository for schemas, API modules, hooks, components, and route composition.
- Keep form schemas focused on request shape, pure refinements, and normalization.
- Move persisted-state checks and lookup-resolution checks to the feature API boundary.
- Remove redundant validation layers where the same rule is already enforced by the canonical boundary.
- Replace compatibility shims and string-based error routing with consistent server-side checks and user-facing errors.
- Use `src/features/employees` as the reference slice for the final patterned shape, while preserving its business behavior.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `entity-foundation`: clarify the canonical feature-slice workflow and ownership pattern so every feature follows the same structural shape.
- `form-validation-boundaries`: tighten the separation between pure form validation and server-side lookup / persisted-state validation so redundant checks can be removed consistently.

## Impact

- Affected code: `src/features/*`, especially `src/features/employees`, plus any feature-local API, hook, schema, and utility modules that currently duplicate boundary checks.
- Affected docs/specs: `openspec/specs/entity-foundation/spec.md`, `openspec/specs/form-validation-boundaries/spec.md`, and implementation contract docs that describe feature ownership and validation boundaries.
- Affected roles: developers and future contributors implementing or reviewing feature slices.
- Multi-tenant impact: none to the tenant model itself, but the standardization must continue to derive tenant scope from authenticated session context at the server boundary.

## Non-goals

- Changing domain business rules for employees, clients, contracts, fees, remunerations, or attachments.
- Changing route URLs, permissions, or tenant isolation behavior.
- Introducing a generic CRUD framework or a new shared abstraction prematurely.
- Refactoring runtime behavior merely for aesthetic consistency when the current behavior already matches the contract.

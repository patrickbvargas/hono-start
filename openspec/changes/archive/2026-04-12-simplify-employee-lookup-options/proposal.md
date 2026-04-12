## Why

The employees feature currently handles inactive lookup values through UI-only merge helpers and duplicate validation paths. That makes the reference slice harder to understand and pushes a backend contract problem into the form component tree.

This change simplifies the contract: lookup option queries return all rows, forms render inactive options as disabled, and the employees feature stops fabricating preserved options for historical selections.

## What Changes

- Change lookup option-query behavior so employee type and user role loaders return all lookup rows, not only active rows.
- Standardize form option rendering so inactive lookup rows are shown as disabled instead of being omitted from the data source.
- Remove employee form-specific merged option helpers that synthesize inactive current selections in the UI.
- Remove redundant client-side employee form validation that treats active lookup eligibility as a local form concern.
- Align employee and shared docs with the new reference behavior so future entity slices follow the simpler contract.

## Capabilities

### New Capabilities

### Modified Capabilities
- `employee-management`: Employee create and edit flows must load type and role options from the backend without UI-side merged inactive options.
- `lookup-reference-data`: Lookup option queries must return all lookup rows while inactive values remain non-selectable in form controls.
- `entity-foundation`: Shared form option behavior must define disabled rendering for inactive rows instead of active-only lookup datasets.

## Non-goals

- Adding a lookup-table administration UI.
- Changing employee list filtering semantics for `isActive` or soft-delete visibility.
- Generalizing all employee code into shared abstractions beyond the option-loading contract.
- Changing multi-tenant scoping or employee authorization boundaries.

## Impact

- Affected code: `src/features/employees/api/get.ts`, `src/features/employees/components/form/index.tsx`, `src/features/employees/hooks/use-form.ts`, `src/features/employees/utils/validation.ts`, and shared option/form primitives already used by the employees slice.
- Affected docs/specs: `docs/CONVENTIONS.md`, `docs/PRD.md`, `docs/DATA_MODEL.md`, `openspec/specs/employee-management/spec.md`, `openspec/specs/lookup-reference-data/spec.md`, and `openspec/specs/entity-foundation/spec.md`.
- Affected roles: administrators continue to manage employees; no permission changes.
- Multi-tenancy: unchanged, because lookup tables remain global and employee mutations remain firm-scoped from session state.

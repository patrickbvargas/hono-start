## Context

The employees feature currently fetches only active lookup rows for employee types and user roles, then reconstructs inactive persisted selections in the form component with `getMergedTypeOptions` and `getMergedRoleOptions`. That split contract makes the backend data incomplete for edit screens and leaks historical-selection handling into feature UI code.

The shared option schema and form components already support disabled options through `isDisabled`, derived from `isActive`. The missing piece is the data contract: the backend still filters inactive lookup rows out of the option dataset, forcing the employee form to synthesize them locally.

## Goals / Non-Goals

**Goals:**
- Make lookup option queries return the full dataset needed by employee forms.
- Rely on shared form option rendering to disable inactive lookup rows.
- Remove employee-specific merged option helpers and redundant client-side active-option validation.
- Align the reference slice and docs around one simpler rule future entities can copy.

**Non-Goals:**
- Adding new lookup management screens.
- Changing employee list filters, route authorization, or multi-tenant behavior.
- Reworking shared form primitives beyond the existing disabled-option behavior.

## Decisions

### D1. Lookup option queries return all lookup rows, ordered by label

Employee type and user role queries will stop filtering by `isActive`. They will return all lookup rows sorted by `label`, and the shared option schema will continue exposing `isDisabled = !isActive` for the form layer.

This keeps the dataset complete for both create and edit contexts without introducing separate edit-only query variants.

Alternative considered: keep active-only queries and inject the current inactive row in edit mode. Rejected because it preserves the same special-case complexity that the user wants removed.

### D2. Disabled rendering, not dataset surgery, handles inactive options

The shared autocomplete/listbox path already supports disabled options. The employees form will consume the raw query result directly and let inactive values render as disabled options.

This removes the need for `getMergedTypeOptions` and `getMergedRoleOptions` entirely.

Alternative considered: transform labels in the employee form to append `(inativo)`. Rejected because the disabled state is sufficient and the extra label mutation couples display policy to one feature.

### D3. Client form hooks stop owning active-option validation

`useEmployeeForm` will keep basic schema parsing and mutation orchestration, but it will no longer enforce active/inactive lookup eligibility locally. The server remains the authority for mutation acceptance, including the rule that unchanged inactive references may remain valid while newly choosing an inactive option is rejected.

Alternative considered: keep mirrored client and server validation for faster feedback. Rejected because the current duplication adds complexity to the reference slice and is not required for correct behavior.

## Risks / Trade-offs

- [Risk] Returning all lookup rows could accidentally enable inactive selections if a form control ignores disabled state. → Mitigation: keep `isDisabled` derived centrally in the shared option schema and verify the shared autocomplete uses it for each item.
- [Risk] Removing client-side validation could shift some feedback from pre-submit to submit time. → Mitigation: preserve server-side Portuguese errors and keep client-side shape validation in Zod.
- [Risk] Future business-entity option loaders may incorrectly copy the lookup-table rule. → Mitigation: update the shared specs/docs to distinguish lookup rows from business entities explicitly.

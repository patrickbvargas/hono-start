## Why

Entity table action menus now repeat the same dropdown UI across clients, employees, contracts, fees, and remunerations. Each table redefines the trigger button, icons, pt-BR labels, item ordering, lifecycle visibility, and destructive delete styling. The duplicated UI makes small behavior changes error-prone and weakens the documented expectation that equivalent entity tables use the same shared pattern.

## What Changes

- Add a shared entity action menu component under `src/shared/components`, tentatively named `EntityActions` or `EntityTableActions`.
- Move the common dropdown UI for row actions into that shared component while keeping feature-specific authorization and lifecycle decisions in the feature table.
- Let feature tables pass the current row item and action callbacks for view, edit, delete, and restore.
- Support per-action visibility or disabled state so contracts and fees can keep their existing read-only lifecycle rules.
- Replace the repeated action dropdown markup in the clients, employees, contracts, fees, and remunerations table definitions.
- Preserve current pt-BR labels, icons, menu ordering, trigger accessibility label, and destructive styling.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `shared-ui-vendor-boundary`: Entity list action menus use a shared component while preserving the shared UI import boundary and current lifecycle behavior.

## Impact

- Affected code: `src/shared/components`, entity table components under `src/features/*/components/table`.
- Affected UI: row action menus for clients, collaborators, contracts, fees, and remunerations.
- Affected APIs: none.
- Database migrations: none.
- Affected roles: all authenticated users who can access entity lists; action availability must remain role-aware through existing feature inputs.
- Multi-tenant impact: none directly; server-side authorization and tenant enforcement remain unchanged.

## Non-goals

- Do not change domain permissions, lifecycle rules, or server-side authorization.
- Do not change route overlay orchestration for view, edit, delete, or restore flows.
- Do not introduce a generic table abstraction beyond the row action menu.
- Do not move feature-specific read-only decisions, such as completed/cancelled contract edit blocking, into shared code.
- Do not add direct shadcn, Radix, Base UI, or vendor primitive imports to routes or features.

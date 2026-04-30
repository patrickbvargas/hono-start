## Why

Entity tables already support details drawers, but the fastest way to open them is hidden inside row actions. Adding a small clickable internal identifier in the first column gives users a predictable shortcut for opening details while preserving the existing fallback path through `Visualizar`.

## What Changes

- Add a shared entity-table pattern where the first column shows the internal row id as a clickable value such as `#123`.
- Make the clickable id open the same details drawer currently opened by the row-level `Visualizar` action.
- Preserve the existing row actions menu as a fallback way to open details.
- Apply the pattern consistently across principal entity tables: clients, employees, contracts, fees, and remunerations.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `entity-foundation`: extend the canonical entity-table pattern so principal entity tables expose a clickable first-column id that opens the details drawer while preserving the existing actions-menu fallback.

## Impact

- Affected code: shared table presentation helpers, shared entity actions, and table components under `src/features/clients`, `src/features/employees`, `src/features/contracts`, `src/features/fees`, and `src/features/remunerations`.
- Affected UX: faster details access from list views without changing overlay orchestration or tenant/role behavior.
- Dependencies: no new runtime dependencies expected.

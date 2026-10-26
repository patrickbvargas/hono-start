## Why

Entity summaries and lifecycle actions currently require locating the row overflow button. A context menu on the row provides direct access at the pointer while retaining primary-click navigation.

## What Changes

- Add context menus to client, employee, contract, fee, expense, remuneration and audit collection rows.
- Keep the existing overflow button and primary-click/Enter/Space navigation.
- Offer the same permitted page, summary and lifecycle actions from both menu surfaces.
- Support the context-menu key and Shift+F10 on focused rows; preserve native interaction on nested controls.

## Capabilities

### New Capabilities
- `entity-row-context-menu`: Pointer and keyboard access to existing authorized row actions.

### Modified Capabilities
None.

## Impact

Shared UI menu primitives, DataTable, EntityActions and seven feature tables; frontend contract and focused tests. All existing user roles benefit within their current grants. Firm, assigned and own scopes remain unchanged. No API, database migration or new dependency is required.

## Non-goals

Changing navigation defaults, adding mutation permissions, replacing mobile overflow actions, changing contextual/dashboard tables, or bypassing delete confirmations.

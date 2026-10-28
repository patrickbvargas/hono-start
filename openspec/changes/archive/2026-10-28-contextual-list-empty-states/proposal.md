## Why

Empty collections currently show a generic sentence without a next step. Users need to distinguish filtered results from an empty authorized collection and recover directly.

## What Changes

- Add a shared contextual empty presentation with an icon, title, explanation and optional action.
- Apply it to desktop tables and mobile cards in clients, employees, contracts, receipts, expenses, remunerations, audit and pending work.
- Offer clearing non-default filters, or the existing permission-checked create flow for manually created collections.
- Preserve read-only and derived collection semantics, scoped visibility and existing loading/error states.

## Capabilities

### New Capabilities
- `contextual-list-empty-states`: Consistent actionable empty states across primary collections.

### Modified Capabilities
None.

## Impact

Shared UI, collection presentation components, feature filter orchestration, route composition and frontend/query documentation. All authenticated roles benefit within existing grants; no tenant query or server authority changes. No new dependency or migration.

## Non-goals

Dashboard widgets, contextual relationship tables, attachment lists, new creation workflows, global record existence checks and changes to filtering defaults.

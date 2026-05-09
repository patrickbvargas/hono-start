## Why

Principal entity tables already expose the internal entity id in the first column as a stable entrypoint for record details, but users cannot use that same column to sort the list. This creates friction when users need to scan records by creation order surrogate, reconcile support requests that reference numeric ids, or jump quickly between lower and higher ids across paginated lists.

Adding sortable id behavior now aligns the first-column interaction with the documented server-driven sorting model and removes one of the remaining inconsistencies between visible table affordances and supported list behavior.

## What Changes

- Add sortable `id` support to principal entity-management lists whose first visible column shows the entity id.
- Make the first-column `ID` header participate in the same URL-driven sort behavior already used by other sortable columns.
- Extend shared list and feature contracts so id sorting remains deterministic and consistent across server queries, validated route search state, and table UI.
- Preserve the existing clickable id entrypoint to open details drawers; sorting the column must not replace the details affordance.

## Non-goals

- No change to default sort order for existing routes unless explicitly required by a feature spec.
- No change to filter semantics, pagination defaults, or detail drawer behavior beyond preserving current interactions.
- No rollout to tables that do not expose an entity id as the first visible column.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `entity-foundation`: clarify that the canonical first-column id entrypoint can also act as sortable list header state without losing the details action.
- `client-management`: allow sorting the clients list by internal id from the first column.
- `employee-management`: allow sorting the employees list by internal id from the first column.
- `contract-management`: allow sorting the contracts list by internal id from the first column.
- `fee-management`: allow sorting the fees list by internal id from the first column.
- `remuneration-management`: allow sorting the remunerations list by internal id from the first column.
- `audit-log-management`: allow sorting the audit-log list by internal id from the first column when that first column exposes the audit record id.

## Impact

- Affected specs: shared entity-table behavior plus list contracts for clients, employees, contracts, fees, remunerations, and audit logs.
- Affected code areas likely include route search schemas, sortable-column definitions, feature query builders, shared table header wiring, and list-focused tests.
- No new external dependencies or API families are expected.

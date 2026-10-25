## Why

The team needs a consistent, professional place to manage each record. Contracts already have a dedicated workspace, while other primary collections rely on drawers and interrupt the distinction between managing a record and inspecting a relationship.

## What Changes

- Make dedicated record pages the default destination from desktop tables and mobile lists for clients, employees, fees, expenses, remunerations and audit logs, following the contract workspace layout.
- Provide an explicit page action in collection menus, while preserving detail drawers and their permitted lifecycle actions for contextual inspection.
- Keep validated collection return state and addressable tabs across reloads; reuse existing protected queries, forms, confirmations and mutation invalidation.
- Present overview, existing attachment support and permission-scoped history consistently. Audit records remain read-only.
- Update the canonical project contract and cover navigation, lifecycle, permissions and contextual-drawer behavior.

## Capabilities

### New Capabilities

- `entity-management-pages`: Dedicated entity workspaces with default collection navigation, validated return context, applicable tabs and existing lifecycle operations.

### Modified Capabilities

- `platform-workflows`: Scope default inline contract page navigation to its primary collection; relationships from other entities use contextual drawers. Legacy detailId URLs remain supported.

## Impact

Routes, public feature entrypoints, feature workspace schemas/hooks/components, shared presentation components, collection triggers and project documentation. All existing authorized staff benefit; Clerk grants, assigned/own resource access and firm isolation remain enforced by existing server boundaries. No database migrations or dependencies.

## Non-goals

No new business entities, permission model, form library, financial rules, global workspace registry or changes to dashboard drilldowns. No editing or deletion of audit records.

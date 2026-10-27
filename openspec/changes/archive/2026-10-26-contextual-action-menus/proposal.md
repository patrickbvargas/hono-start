## Why

Dashboard drilldown rows, pending work and attachment items expose useful secondary actions inconsistently. Add explicit menus and right-click shortcuts to reduce navigation while preserving the current primary action.

## What Changes

- Dashboard rows offer Abrir página and Ver resumo via context menu and visible overflow button.
- Pending-work rows and mobile cards offer Abrir página and Ver resumo for the contract, preserving validated pending return filters.
- Attachments offer Baixar arquivo and authorized Excluir via context menu and overflow, retaining download shortcut and deletion confirmation.
- Keyboard menu access and dismissal retain focus and parent screen state.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dashboard-row-summary`: add explicit row actions and direct page navigation.
- `pending-work-center`: add context and overflow actions with contextual contract summaries.
- `attachment-management`: expose existing file actions through equivalent menus.

## Impact

Dashboard, drilldown, related-records, pending-work and attachments presentation/orchestration, focused tests and canonical documentation. Existing read scopes, own/assigned visibility, tenant checks, download authorization and deletion confirmations remain authoritative. No database migrations, new dependencies or API changes.

## Non-goals

Menus on filters or KPI cards, changing primary click behavior, new lifecycle operations, replacing attachment delivery, or global context menus.

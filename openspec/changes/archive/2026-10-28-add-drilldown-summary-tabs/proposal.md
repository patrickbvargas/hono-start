## Why

Drilldown records need a compact overview of the largest contributing categories before users inspect individual rows. Remembering the selected tab avoids repeatedly switching views.

## What Changes

- Add Resumo and Dados tabs, defaulting to Resumo on first use.
- Show simultaneous contextual grouping blocks, each sorted by absolute amount descending while preserving signs, with the existing total above them.
- Persist the latest selected tab in localStorage across drilldowns; invalid or unavailable storage falls back safely.
- Preserve the current table and authorized complete-data query.

## Capabilities

### New Capabilities
- `drilldown-grouped-overview`: Contextual grouped amounts and persistent tab preference.

### Modified Capabilities

None.

## Impact

Standalone drilldown presentation accepts an optional grouped overview renderer; dashboard owns grouping and stable identity fields. All existing authorized roles retain their current scope. No new permissions, tenant access, dependencies or database migrations.

## Non-goals

No new filters, exports, record actions or changes to financial calculations.

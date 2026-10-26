## Why

Dashboard drilldown rows cannot open the underlying record summary. Users need contextual inspection without losing their analysis.

## What Changes

- Activate modal table rows by mouse and Enter/Space to open existing entity drawers.
- Include validated entity kind and persisted ID with each drilldown row.
- Preserve modal sorting, pagination, scroll and filters beneath the summary.

## Capabilities

### New Capabilities
- `dashboard-row-summary`: Contextual entity summaries from dashboard drilldown rows.

### Modified Capabilities
None.

## Non-goals

No new record pages, financial calculations, editing workflows or database migrations.

## Impact

Dashboard data/schema and modal composition, generic drilldown row action support, shared table action labels and dialog stacking. Existing authorized roles retain their current read/resource scopes and firm isolation; this change grants no permissions.

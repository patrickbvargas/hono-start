## Why

Dashboard totals currently cannot be traced to their contributing records without navigating away and reconstructing filters. Users need to inspect the exact composition of each bar while retaining the dashboard context and existing financial visibility boundaries.

## What Changes

- Enable the five dashboard KPI cards through explicit metric selectors, including scheduled gross revenue and period Result composition. Preserve each card's subject-specific access and separate help/comparison controls.

- Introduce an isolated `src/features/drilldown` feature: a standalone modal/table configured through typed props for context, filters, columns, data-query options, row identity and optional summaries. It supports activation from charts, cards or other controls without knowing the source screen.
- Keep dashboard-specific financial selection and authorization in the dashboard consumer. Adding a new chart or a registration-page card must not require modifying the drilldown feature or registering the trigger in a central chart switch.
- Allow consumers to supply reusable listing column definitions through the owning feature's public API; the drilldown does not import entity features or their internal tables.
- Make every dashboard bar open a read-only modal containing its contributing records, complete monetary values, pagination and a total across all matching records.
- Support monthly revenue, remuneration and expenses; monthly balance composition; revenue by legal area, type and client; remuneration by assignment function; outstanding future installments; overdue installments by age; and expenses by category.
- Include activation of a monthly point on the financial evolution Result line, showing the same signed composition as monthly balance.
- Preserve each chart's effective filters, month range, reference date, lifecycle exclusions and calculation rules. Include initial down payments in receipts and only outstanding amounts in debt and forecast details.
- Enforce dashboard and financial-subject permissions on every detail request. Own/assigned scope and server-derived firm boundaries remain mandatory for administrators, lawyers, administrative assistants and expense-only users.
- Use stable entity identities for selection and grouping, including clients with identical names.
- Load detail records only when requested; expose accessible activation and explicit loading, empty, denied and failure states.

## Capabilities

### New Capabilities

- `dashboard-chart-drilldown`: Permission-scoped record inspection and reconciliation for all dashboard bars and monthly Result points.
- `standalone-drilldown`: Source-independent, props-configured modal and table with reusable columns, isolated pagination and lazy queries.

### Modified Capabilities

None. Existing dashboard behavior is preserved except for stable client identity grouping, specified within the new capability as a prerequisite for reliable selection.

## Impact

- New isolated drilldown feature; dashboard schemas, server query options, data selectors and chart integration. Entity listing column factories may be extracted locally and exported explicitly where actual reuse is needed.
- Existing shared overlay, modal, table and pagination patterns; existing TanStack Query cache and Zod contracts.
- Canonical dashboard behavior, query behavior and permission documentation will be updated during implementation.
- No new permissions, dependencies or database migrations are expected. No changes to Clerk grants or tenant resolution.
- Coordinate with `improve-dashboard-financial-analysis`; preserve its current schedule, scope and consolidated-result restrictions.

## Non-goals

- Editing, deleting, exporting or settling records from this modal.
- Drilldown of the existing dashboard tables, or changing chart layout, colors and types.
- Adding filters to the modal, bank reconciliation, expense allocation or changing remuneration settlement semantics.
- Persistent financial snapshots or historical version storage.
- Adding cards to registration pages in this change. Those pages are supported consumers of the standalone contract, validated through a representative non-dashboard test.

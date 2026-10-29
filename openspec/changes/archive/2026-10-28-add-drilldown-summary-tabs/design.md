## Context

Drilldown already fetches the complete authorized dataset and delegates local pagination to DataTable. Dashboard owns all financial semantics. Shared Tabs and schema-validated useLocalStorage already exist.

## Goals / Non-Goals

Goals: simultaneous grouped blocks, magnitude-descending totals, remembered tab, unchanged table actions and query scope.
Non-goals: new filters, server aggregation endpoints, permissions or migrations.

## Decisions

- Add optional renderOverview to the generic Drilldown; consumers without it retain table-only behavior. Existing renderSummary remains visible above both panels.
- Use shared Tabs and useLocalStorage with a feature-owned enum schema and global drilldown.tab key. Read after mount for SSR safety; store only summary/data, never business data. Keep Dados mounted while switching to preserve pagination/sort.
- Dashboard builds contextual groups from full validated rows: client/type, employee/assignment, category, or movement for result. Omit irrelevant dimensions. Stable client/employee IDs and lookup values prevent label collisions. Missing dimensions use an explicit fallback.
- Accumulate monetary cents to avoid common floating point artifacts. Sort totals by absolute magnitude descending while preserving signs with label/key tie breakers.
- Context7 is unavailable in this session; reuse repository wrapper implementations and existing hook contracts without introducing library APIs.

## Risks / Trade-offs

Large datasets create long lists -> use existing ScrollArea and responsive columns.
Unavailable browser storage -> existing hook retains in-memory interaction.
Optional IDs on older test fixtures -> isolate unknown identities by record key rather than merging names.

## Migration Plan

No migration. Deploy normally; rollback feature changes. Stored preference is harmless without the feature.

Final presentation: fixed 80dvh height, 25 records per page, standard table border, no monthly grouping. Loading retains tabs and total; Dados uses one borderless block and Resumo uses one or two contextual blocks.


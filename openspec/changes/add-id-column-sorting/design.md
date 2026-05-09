## Context

Principal list routes already follow a shared URL-driven sorting contract, and the shared entity contract already requires a clickable first-column id entrypoint for details. Today that first column is visually prominent but functionally incomplete because users cannot sort by the same id they see and reference in support or reconciliation workflows.

This change is cross-cutting because it touches shared table behavior plus multiple feature slices that each validate route search state, expose sortable columns, and build stable server-side order clauses. The implementation must preserve current default sorts and must not break the existing detail-drawer affordance tied to the id cell.

## Goals / Non-Goals

**Goals:**

- Extend principal list contracts so internal ids can be used as an explicit sortable field.
- Keep sorting URL-driven and server-driven across all affected features.
- Preserve the current clickable id cell that opens the details drawer.
- Keep deterministic pagination by retaining stable tie-break ordering around id sorts.

**Non-Goals:**

- Changing default route sort fields or directions.
- Reworking list layouts, filter placement, or overlay orchestration.
- Introducing a new shared table abstraction if existing feature patterns already cover sortable headers.

## Decisions

### Decision: treat `id` as a feature-level sortable field, not a UI-only convenience

Affected feature search schemas, query builders, and column metadata will explicitly accept `id` as an allowed sort field. This keeps the contract aligned from URL parsing through server ordering instead of adding an ad hoc client-side sort toggle that would drift from the documented list architecture.

Alternative considered: sorting only in the rendered table component. Rejected because list routes are contractually server-driven and URL-driven, and client-side sorting would desynchronize pagination and sharing behavior.

### Decision: keep current default sorts and add `id` as opt-in ordering

Each route keeps its existing documented default sort. Users gain `id` ordering only when they actively choose it from the first-column header.

Alternative considered: making `id desc` the new default for all tables. Rejected because it would silently change established route behavior and could disrupt workflows that rely on current alphabetical or date-based defaults.

### Decision: preserve separate interactions for header sort and cell detail entry

The id header becomes sortable, while the id cell content remains the clickable entrypoint for details. This keeps the existing entity-foundation contract intact and avoids ambiguous click handling on the data cell itself.

Alternative considered: toggling sort when users click the id cell. Rejected because it conflicts with the existing details action and would create inconsistent row behavior versus other columns.

### Decision: continue using stable server ordering with id-compatible tie-breaks

Queries that sort by non-unique fields already need deterministic ordering. Adding primary-key sorting should continue to compose with stable tie-break logic so pagination does not drift when rows share the selected sort field. When `id` itself is selected, the query can use that primary order directly and only add a secondary deterministic clause if the data layer pattern requires one.

Alternative considered: special-casing `id` sorts outside existing order-builder utilities. Rejected because it would create unnecessary divergence across features.

## Risks / Trade-offs

- [Feature drift across list implementations] → Update shared contract plus every affected feature spec and verify all route search schemas accept `id`.
- [UI confusion between sortable header and clickable id cell] → Keep sorting on header only and preserve current detail behavior in the row value.
- [Pagination instability if one feature omits deterministic ordering updates] → Cover affected query builders and search-schema tests in implementation tasks.
- [Over-scoping into non-principal or non-id tables] → Limit rollout to tables whose first visible column is the entity id per the proposal.

## Migration Plan

- No data migration required.
- Deploy as application-only change after route search schemas, table headers, and query ordering are aligned.
- Rollback is low risk: remove `id` from allowed sort fields and revert first-column sortable headers without persistence impact.

## Open Questions

- Whether the audit-log table currently exposes the audit record id as its first visible column in production code should be confirmed during implementation; if it does not, that feature can be excluded from the final code rollout while keeping the principal-entity scope intact.

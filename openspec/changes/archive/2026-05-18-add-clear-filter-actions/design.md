## Context

Each entity list uses the shared `useFilter` hook to parse validated route search state and push new filter values back into the URL. Feature-local filter hooks then wire `useAppForm` listeners so inline query fields and popover fields submit immediately. The current setup already knows both the current filter object and the default filter object, but it exposes only `handleFilter` and the active-indicator helper. Because the requested behavior spans six list surfaces, the clean implementation point is the shared filter orchestration rather than duplicating reset logic in every feature.

## Goals / Non-Goals

**Goals:**
- Add one canonical reset path for URL-driven list filters.
- Let every entity list clear inline query plus advanced filters in one action.
- Preserve the current sort and page-size state while moving pagination back to page 1.
- Keep the change inside the existing shared hook and shared UI boundaries.

**Non-Goals:**
- Change route search schemas or add new filter keys.
- Reset sorting together with filters.
- Introduce server-side changes, migrations, or new dependencies.

## Decisions

### Add reset helpers to `useFilter`
`useFilter` already computes both the current parsed filter and the parsed default filter. The shared hook will expose a `handleResetFilter` helper plus the default filter object so feature hooks can reset route state without reimplementing merge behavior.

Alternative considered:
- Reset from each feature by manually building a default payload. Rejected because it duplicates route-search merge rules and increases drift risk across entities.

### Preserve non-filter search state during reset
Resetting filters should restore only the fields owned by the feature filter schema, keep sort and page-size state unchanged, and force `page` back to `1`. This matches the user request to clear filters without silently changing how the list is ordered.

Alternative considered:
- Reset the entire route search object. Rejected because it would also clear sorting and any other non-filter route state.

### Render one explicit clear action per filter surface
Each entity filter component will render a `Limpar filtros` action near the existing search and advanced-filter controls. The action will target the full filter form state, not only the popover fields, so users can clear inline query and advanced selections together.

Alternative considered:
- Put the action only inside the advanced popover. Rejected because inline search is outside the popover and would remain active unless the user opened a second control.

### Reuse existing active/non-default detection
The same shared comparison used for popover active indicators can drive whether the clear action is enabled. This keeps the default-state definition aligned with the validated route search defaults and avoids ad hoc empty-string checks in each feature.

Alternative considered:
- Track dirty state inside each form instance. Rejected because URL state, not local form dirtiness, is the canonical filter source.

## Risks / Trade-offs

- Shared hook regression across multiple lists -> Mitigation: add focused tests for reset semantics and verify all affected filter components still use the same URL-driven contract.
- Reset behavior could accidentally clear sort state -> Mitigation: define and test reset as filter-only merge behavior.
- UI clutter in compact headers -> Mitigation: use a simple secondary action alongside existing controls instead of a larger layout redesign.

## Migration Plan

1. Extend the shared filter hook with reset behavior.
2. Update affected feature filter hooks/components to expose and render the clear action.
3. Add focused tests for shared reset behavior and representative filter UI wiring.
4. Run `pnpm check` and `npx tsc --noEmit`.

Rollback is low risk: revert the shared reset helper and remove the feature-level clear actions. No data migration is involved.

## Open Questions

- None. Scope is limited to existing entity list filters and does not alter route contracts.

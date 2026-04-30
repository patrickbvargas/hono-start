## Context

Principal entity routes already share one list-management pattern: route loader, table in body, route-local `useOverlay`, and details drawer opened by `onView(id)`. Today, the fastest details entrypoint is hidden inside the row actions menu even though every row already has a stable internal numeric id.

This change is cross-cutting because it touches five equivalent table components plus shared table affordances. The repository already converges equivalent micro-patterns into shared or repeated shapes, so the clickable id behavior should become part of the canonical entity-table contract instead of a one-off tweak in one feature.

## Goals / Non-Goals

**Goals:**
- Add a predictable first-column clickable id pattern for principal entity tables.
- Reuse the existing details overlay contract by calling the same `onView(id)` callback used by `Visualizar`.
- Keep the actions menu as an explicit fallback path to details.
- Apply the pattern consistently across clients, employees, contracts, fees, and remunerations.

**Non-Goals:**
- Do not change table sorting defaults or introduce id-based sorting where the route contract does not already allow it.
- Do not make entire rows clickable.
- Do not redesign overlay state, route composition, or details drawer internals.
- Do not add database fields or API contract changes.

## Decisions

### Use a shared presentational id-trigger component
Decision: add one small shared UI helper that renders `#${id}` as a low-emphasis clickable control and receives `id` plus `onView`.

Why:
- Prevents five table components from reimplementing the same styling and click behavior.
- Fits the existing house rule that `shared/` owns generic primitives used by multiple features.
- Keeps feature tables focused on column composition rather than duplicated presentation details.

Alternative considered:
- Inline the clickable id cell separately in each table. Rejected because the behavior is intentionally cross-feature and would drift again.

### Use an accessor/display column as the first visible column in each entity table
Decision: prepend a dedicated `id` column before existing business columns in each principal entity table.

Why:
- TanStack Table supports custom cell rendering cleanly through column helpers, so adding a first-column clickable cell is straightforward.
- Keeping the existing business column order after the new id column minimizes visual disruption.
- The internal id remains visible for support/debug workflows without replacing business identifiers such as contract process number.

Alternative considered:
- Make the primary business column clickable instead. Rejected because it is less consistent across features and competes with business-specific reading/scanning patterns.

### Keep `Visualizar` in row actions as the fallback details path
Decision: preserve the current view action in `EntityActions` while reordering it after `Editar` when edit exists.

Why:
- Matches the requested primary/fallback interaction model: id click first, actions menu second.
- Preserves an explicit details affordance for users who scan actions menus.
- Avoids coupling details access only to a small first-column target.

Alternative considered:
- Remove `Visualizar` after adding clickable ids. Rejected because it removes discoverability and reduces resilience for users who expect details in the actions menu.

## Risks / Trade-offs

- Small click target in dense tables → Use a clear interactive style with enough horizontal padding and hover affordance.
- Wider tables after adding one column → Keep the id column narrow and low-emphasis so the impact is limited.
- Conditional action availability changes menu order → Accept that `Visualizar` may become first when `Editar` is unavailable; fallback behavior still remains correct.
- Shared helper drift from existing tests → Update boundary tests to recognize the new shared pattern explicitly.

## Migration Plan

No data migration required.

Implementation sequence:
1. Add shared clickable id cell helper.
2. Update `EntityActions` ordering.
3. Prepend the id column in principal entity tables.
4. Update or add focused Vitest coverage.
5. Run `pnpm check` and `npx tsc --noEmit`.

Rollback:
- Remove the shared helper usage from tables.
- Restore prior action ordering in `EntityActions`.

## Open Questions

- None at the moment. Existing overlay and read-model contracts already support the change.

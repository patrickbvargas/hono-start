## Context

The repository already has a shared `ScrollArea` export in `@/shared/components/ui`, but equivalent internal scrolling surfaces still use mixed patterns. Shared drawers and layout regions can fall back to raw `overflow-auto`, which produces visual drift and makes long content overlays behave differently from list and dashboard surfaces that already rely on `ScrollArea`.

This change is cross-cutting because it touches shared wrappers rather than one feature slice. The immediate implementation has already proven the pattern in `EntityDetail.Body`, and the proposal captures how to extend that pattern to other shared surfaces without forcing popup primitives or page-level route layout into the same solution.

## Goals / Non-Goals

**Goals:**
- Define a canonical contract for internal product content regions that scroll inside shared wrappers.
- Reuse the existing shared `ScrollArea` component rather than adding another scroll abstraction.
- Keep drawer and modal chrome stable while long body content scrolls inside the body region.
- Identify sidebar content as the next equivalent shared surface to align with the same pattern.

**Non-Goals:**
- Replace vendor-managed scrolling inside command menus, dropdown menus, selects, or combobox popups.
- Redesign authenticated route shell height behavior or table-scroll behavior already governed by existing shared table and app-layout patterns.
- Introduce new vendor dependencies or bypass the shared UI boundary.

## Decisions

### Use `ScrollArea` only for internal application content surfaces
Internal product surfaces such as detail drawer bodies, sidebar content panels, and long overlay bodies will standardize on the shared `ScrollArea` wrapper.

Why:
- Preserves one shared scrollbar treatment.
- Keeps route, feature, and shared UI code inside the documented vendor boundary.
- Matches the existing direction already taken by dashboard and table surfaces.

Alternative considered:
- Keep native `overflow-auto` everywhere. Rejected because it preserves drift and pushes scrollbar styling decisions into each wrapper.

### Exclude vendor popup lists from this pattern
Command, select, dropdown, and combobox popups keep their existing vendor-driven scrolling unless a separate change explicitly standardizes them.

Why:
- Those components are tightly coupled to popup positioning and primitive behavior.
- The current request is about product content surfaces, not popup internals.
- A smaller boundary makes the pattern safer to apply incrementally.

Alternative considered:
- Sweep all `overflow-y-auto` usage into `ScrollArea` immediately. Rejected because it mixes distinct interaction surfaces and raises regression risk.

### Standardize through shared wrappers first
When multiple features depend on the same scroll behavior, shared wrappers such as `EntityDetail` and sidebar content containers should own the change instead of patching feature components one by one.

Why:
- One wrapper change updates all equivalent consumers.
- It matches repository guidance to extract stable shared behavior only after repeated usage is proven.
- It reduces feature drift and future maintenance cost.

Alternative considered:
- Patch each feature details component separately. Rejected because it would duplicate the same scroll decision across slices.

## Risks / Trade-offs

- Wrapper-level scroll changes can affect flex sizing in drawers and sidebars → Mitigation: require `min-h-0` and `flex-1` on shared scroll hosts and verify long-content overlays.
- Different popup primitives may still show native scrollbars while shared surfaces use `ScrollArea` → Mitigation: document popup lists as out of scope for this change.
- Future long-form dialogs may still overflow until they adopt the same wrapper pattern → Mitigation: capture dialog bodies as follow-up targets in tasks rather than silently assuming they are already covered.

## Migration Plan

- No data migration required.
- Update shared wrappers incrementally, starting with `EntityDetail.Body`.
- Adopt the same pattern in other shared surfaces only when their wrapper sizing is verified.
- Rollback is straightforward: revert the wrapper-level `ScrollArea` adoption if any surface proves incompatible.

## Open Questions

- Whether `SidebarContent` should move to `ScrollArea` in the same implementation batch or a follow-up patch.
- Whether shared dialog bodies need an opt-in scroll mode or a default scroll mode for long forms.

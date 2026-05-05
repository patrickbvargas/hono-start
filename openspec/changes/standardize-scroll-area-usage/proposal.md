## Why

The app already uses a shared `ScrollArea`, but internal scrolling surfaces still drift between shared wrappers and native `overflow-auto` containers. That drift creates inconsistent scrollbar styling and makes detail drawers, sidebar regions, and future long-form overlays harder to keep visually aligned.

## What Changes

- Define a canonical shared pattern for internal application scrolling surfaces that should use `ScrollArea`.
- Standardize shared entity detail bodies so long drawer content scrolls inside the body while header and footer remain fixed.
- Define which surfaces remain out of scope for now, especially vendor-driven popup lists such as command menus, selects, comboboxes, and dropdown menus.
- Identify additional shared layout regions, such as sidebar content and long overlay bodies, that should converge on the same scroll treatment in follow-up implementation.

## Capabilities

### New Capabilities
- `shared-scroll-surfaces`: Defines when product-facing internal content regions SHALL use the shared `ScrollArea` wrapper instead of ad hoc overflow containers.

### Modified Capabilities
- `entity-foundation`: Entity details requirements will clarify that long detail drawer content scrolls within the shared body region while preserving fixed drawer chrome.

## Impact

- Affected code: `src/shared/components/entity-detail.tsx`, `src/shared/components/ui/sidebar.tsx`, shared dialog and drawer wrappers, and feature overlays that depend on those wrappers.
- Affected UX: Scrollbar visuals and internal scrolling behavior for shared drawers, sidebar content, and future long-form overlay surfaces.
- Dependencies: Reuses existing `@/shared/components/ui/scroll-area` without introducing a new vendor dependency.

## Non-goals

- Replacing vendor-managed popup scrolling inside command menus, dropdown menus, selects, or combobox result lists.
- Redesigning page-level route layout or table-scroll behavior that is already covered by existing list and app-layout specs.
- Introducing a second shared scroll primitive or bypassing the shared UI boundary.

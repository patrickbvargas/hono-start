## Context

DataTable owns row activation; feature tables own their lifecycle helpers and EntityActions props. Shared UI currently wraps Base UI menus. Context7 documentation for Base UI v1.9.0 confirms ContextMenu.Trigger supports render composition and pointer positioning; local declarations confirm shared Menu Item/Popup implementation.

## Goals / Non-Goals

**Goals:** Direct row context menus in seven primary collections, identical permitted actions from both menu surfaces, pointer and keyboard accessibility, and valid table markup.

**Non-Goals:** New persistence, permissions, mobile navigation changes or contextual/drilldown table changes. No database migration.

## Decisions

- Add shared UI ContextMenu primitives using installed Base UI; reuse shared menu item styling rather than add a package or handwritten menu positioning/focus logic.
- DataTable accepts an optional renderRowContextMenu(index) callback. Wrap the actual tr with a composed trigger, without a DOM wrapper. Original row indices remain authoritative after sorting/pagination.
- Each feature owns one memoized action renderer used by its action cell and contextual menu. EntityActions selects dropdown or context presentation while deriving permissions and menu items once. This keeps lifecycle policy local and avoids implicit action-column discovery or DOM inspection.
- Preserve row Enter/Space activation. Focused rows support ContextMenu and Shift+F10 by invoking the native context-menu event at the row boundary. Nested controls retain their own pointer and keyboard semantics; menu events never activate row navigation. Escape restores row focus.
- Existing delete/restore callbacks still open existing confirmations; no mutation runs directly from a new boundary.

## Risks / Trade-offs

- [Portal event bubbling] -> Ignore menu-origin events in row activation and test both menu surfaces.
- [Table markup/ref composition] -> Render the trigger as the existing tr; test no wrappers under tbody.
- [Permission drift] -> Use the exact same feature renderer and shared permission resolver for both menus; test restricted and deleted records.
- [Viewport collision] -> Delegate pointer positioning and collision handling to Base UI; inspect in browser when available.

## Migration Plan

Ship shared primitives, opt in seven feature tables and update frontend contract together. Roll back the opt-in callbacks to restore the previous behavior; data is unaffected.

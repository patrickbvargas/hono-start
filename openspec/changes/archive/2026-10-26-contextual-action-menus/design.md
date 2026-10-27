## Context

Shared EntityActions and DataTable row context menus already handle permission filtering, keyboard access and focus. Related-records owns lazy summaries and direct-page navigation. Drilldown is generic and currently exposes only primary row activation.

## Goals / Non-Goals

Goals: equivalent context/overflow choices on three concrete surfaces with accessible explicit controls and unchanged primary activation.
Non-goals: global action registries, API/schema/database changes, KPI/filter menus and new destructive flows.

## Decisions

- Extract a public RelatedRecordActions composition within related-records to reuse its navigation and exact read grants across links and dashboard. Accept optional explicit page callbacks for pending-work context. Reuse EntityActions for both presentations instead of duplicate action lists.
- Extend generic Drilldown with an opt-in row context renderer; add dashboard's visible action column locally. Row-to-record mapping remains based on the persisted record target, including contract targets for installments/down payments.
- Pending-work owns its summary overlay at table/list level, outside transient menus. Both menu surfaces share one action component. Add tab-aware navigation alongside existing finance-only primary row behavior; preserve pendingReturnTo filters.
- Attachment content composes existing shared context/dropdown primitives around the item, with one action renderer for download and authorized deletion. Existing download and deletion handlers remain authoritative. Offer overflow even to read-only users for download.
- Context7 is unavailable; use installed Base UI declarations and existing tested shared menu patterns as library documentation fallback.

## Risks / Trade-offs

- Menu unmount might dismiss a selected summary → keep overlays outside menu renderers.
- Nested controls could trigger row activation → shared table interaction guards and focused regression tests.
- Menus above dialogs could steal focus or hide summaries → retain existing dialog detailOpen behavior and shared popup focus handling.
- Missing download URL → disable download in both menu presentations and shortcut.

## Migration Plan

No database migration. Deploy UI normally; rollback the optional menu integrations without affecting data.

## Open Questions

None.

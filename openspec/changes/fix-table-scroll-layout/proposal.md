## Why

Operational list screens currently let large tables push scrolling up to the page body, which makes the whole screen move and breaks the stable workspace feel expected from the authenticated shell. This matters now because the main product workflow is table-heavy, and users need filters, page chrome, and column headers to stay anchored while they inspect long lists.

## What Changes

- Keep authenticated list pages inside a fixed-height shell where the page body itself does not become the scrolling surface for large tables.
- Make shared list-table containers consume only the available body height instead of expanding past the wrapper.
- Move vertical scrolling into the shared table content area and keep table headers sticky while rows scroll underneath.
- Keep shared pagination rendered with the table content block so it remains part of the same scrolling region.

## Non-goals

- No change to list filtering, sorting, or pagination URL behavior.
- No redesign of feature-specific columns, row actions, or overlays.
- No new table virtualization or performance optimization work.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `app-layout`: refine authenticated list-shell behavior so large list tables scroll inside the table region with sticky headers instead of scrolling the wrapper body.

## Impact

- Affected code: `src/shared/components/wrapper.tsx`, `src/shared/components/data-table.tsx`, `src/shared/components/ui/table.tsx`, and shared list routes that consume those primitives.
- Affected roles: administrators, lawyers, and assistants using large operational lists.
- Multi-tenant implications: none; this changes shared layout behavior only and does not affect tenant isolation or data access rules.

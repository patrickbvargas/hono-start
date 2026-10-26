## Context

Dashboard drilldowns use the shared DataTable inside a modal. Existing entity detail drawers already own protected queries and contextual fields.

## Goals / Non-Goals

**Goals:** Open the correct summary from each row; preserve analysis context and keyboard access.

**Non-Goals:** New persistence, calculations, permissions or record-page behavior.

## Decisions

- Add a Zod-validated record target (kind and positive persisted ID), independent from synthetic row IDs. Receipts target fees; remuneration/expense target themselves; schedules/down payments target contracts. Parsing synthetic IDs was rejected because receipt row IDs encode revenue and installment, not fee identity.
- Add optional typed row actions and nested content to the generic drilldown; keep entity orchestration dashboard-owned through useOverlay and lazy existing detail components.
- While summary is open, lower the parent dialog portal below drawers, release its modal focus trap and ignore parent dismissal. Keep table mounted. Existing drawer, editing and confirmation layers remain authoritative.
- Reuse protected detail queries; never assume dashboard visibility grants access to a contract summary. Show safe local failure UI.

## Risks / Trade-offs

- Modal/drawer focus and stacking conflicts → explicit suspended parent state and real-browser geometry/interaction checks.
- Stale or inaccessible targets → existing authorization and local error boundary with dismiss action.
- Mutation refresh → retain existing query invalidation; no new mutations introduced.

## Migration Plan

Deploy code together; no database migration. Roll back application commit if necessary.

## Open Questions

None.

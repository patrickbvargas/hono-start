## Context

Primary collections use DataTable and DataCardList with a string emptyMessage. Feature filter hooks already own default comparison, form reset and debounce cancellation; routes own create overlays and grants.

## Goals / Non-Goals

**Goals:** Consistent minimal visual treatment, useful recovery, existing permissions and working desktop/mobile parity.

**Non-Goals:** New data queries, global existence claims, contextual tables or derived-record creation.

## Decisions

- Shared UI ListEmptyState receives title, description, filtered state and optional actions. Use existing theme tokens, compact icon treatment and centered spacing.
- DataTable and DataCardList accept an optional emptyState slot while retaining emptyMessage for contextual consumers. Tables retain headers; cards center the same content.
- Routes instantiate the existing feature filter hook once and pass its controller to the filter UI. Empty actions use that same controller, so clearing cancels pending search submissions and resets form values. Independent filter hook instances were rejected because they can leave stale form values and pending searches.
- Routes compose one empty presentation and pass it through feature table/list props. Creation uses the same permission-checked ButtonNew and overlay as the header.
- Filtered state compares filter schema values against defaults, excluding sorting/pagination. Clear returns page 1 and retains sort/page size.
- Empty unfiltered copy describes available records rather than asserting global absence. Derived remunerations and audit explain how data appears; pending work uses positive scoped copy.
- If the page has no rows but the authorized total is positive, offer returning to page 1 instead of claiming an empty collection.

## Risks / Trade-offs

- Existing feature filter callers change → update every route and focused presentation tests together.
- Visibility restrictions can hide records → use availability wording, preserve grants and avoid global count probes.
- Shared slots increase prop forwarding → preserve explicit props and existing component ownership instead of introducing a hidden context.

## Migration Plan

No persistence migration or dependency. Ship UI and contract together; rollback by reverting this change.

## Open Questions

None.

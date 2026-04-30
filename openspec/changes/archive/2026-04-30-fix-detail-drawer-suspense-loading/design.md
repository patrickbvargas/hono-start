## Context

Entity routes prefetch only the primary list query. Detail drawers fetch single-entity data on demand through feature-local hooks that use `useSuspenseQuery`. The current detail components call those hooks directly at the top level of the mounted drawer component, but there is no drawer-local `React.Suspense` boundary. As a result, opening a cold detail query suspends a higher route boundary and temporarily replaces or flickers the background table.

This change touches multiple equivalent feature slices and must preserve the existing house pattern:
- routes stay declarative and keep using shared overlay orchestration
- single-entity detail hooks remain suspense-first
- loading UI is skeleton-based
- shared UI imports remain routed through `@/shared/components/ui`

TanStack Query guidance supports colocating `useSuspenseQuery` beneath a local `React.Suspense` boundary so loading UI stays limited to that subtree.

## Goals / Non-Goals

**Goals:**
- Keep list context rendered while a detail drawer fetches data on first open.
- Preserve the existing `useSuspenseQuery` detail-hook pattern.
- Provide a consistent skeleton fallback inside detail drawers.
- Apply one shared loading pattern across equivalent entity detail drawers.

**Non-Goals:**
- Replacing suspense detail hooks with manual `useQuery` loading branches.
- Prefetching all detail queries from list routes.
- Changing server query behavior, stale times, or overlay state management.

## Decisions

### Use local `React.Suspense` boundaries inside detail drawers
Each feature detail component will render an outer drawer shell immediately and move the suspense query into a nested content component wrapped by `React.Suspense`.

Why:
- isolates fallback UI to the drawer subtree
- keeps `useSuspenseQuery` and defined-data ergonomics
- avoids route-level loading regressions

Alternative considered:
- Switch detail hooks to `useQuery` plus `isLoading`.
  Rejected because it weakens the suspense-first pattern already documented for unconditional single-entity reads and duplicates loading-state branching across every detail component.

### Add shared drawer skeleton primitives in the entity-detail wrapper
The shared detail wrapper will expose reusable skeleton helpers for title, fields, sections, and separators so equivalent detail drawers can render aligned fallbacks without each feature inventing a different placeholder structure.

Why:
- keeps loading visuals consistent
- avoids repeated ad hoc skeleton markup in five feature slices
- stays within documented shared extraction rules because the pattern is now proven across multiple features

Alternative considered:
- Implement separate skeleton markup in each detail component.
  Rejected because it repeats layout code and makes equivalent overlays drift.

### Keep attachments inside suspense content
Attachment sections rely on loaded owner data such as `ownerId` and permission-derived flags. They will remain inside the loaded content subtree rather than rendering a partial shell that guesses at those values.

Why:
- avoids invalid intermediate props
- keeps behavior aligned with the loaded entity contract

## Risks / Trade-offs

- Local fallback title is generic before data resolves -> Mitigation: render a neutral loading title and content skeleton so users see immediate drawer feedback without incorrect entity text.
- Shared skeleton API could overgrow if made too configurable -> Mitigation: keep the exported skeleton surface minimal and only support patterns already needed by current detail drawers.
- Errors from suspense detail queries may still surface to the nearest existing error boundary -> Mitigation: preserve current error behavior in this change and keep scope focused on loading isolation.

## Migration Plan

No data migration or deployment sequencing is required. Ship as a regular frontend change. Rollback is a standard code revert if needed.

## Open Questions

- None for this change.

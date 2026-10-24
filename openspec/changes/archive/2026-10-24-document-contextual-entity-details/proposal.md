## Why

Opening a related record previously required navigating to a filtered entity list and selecting its only row, losing the original detail context. This retrospective records the delivered navigation and mobile adjustments from commit `873635c`; the current implementation is the source of truth for this record.

## What Changes

- Open singular related clients, employees, contracts and fees above the current detail without navigating away.
- Use “Voltar” for related details and “Fechar” for the main detail, with text triggers that do not imply route navigation.
- Support main details through `detailId` on the six entity routes.
- Keep collection links as filtered list navigation, with advanced filters initially collapsed.
- Load related details on demand with normal skeleton and error feedback; the experimental prefetch was removed.
- Correct mobile overlay stacking, form scrolling, sidebar dismissal and navigation labels.

## Capabilities

### New Capabilities

- `contextual-entity-details`: Context-preserving related details, direct main-detail URLs, collection navigation and responsive overlay behavior.

### Modified Capabilities

None. This capability consolidates the delivered cross-feature interaction without rewriting existing entity specifications.

## Impact

The existing entity routes, related-records integration, shared details/forms/dialogs and sidebar are affected. Fee and remuneration read models include the related client ID. All roles with existing record access benefit; authorization, firm isolation and mutation permissions are preserved. No database migration or new dependency is required.

## Non-goals

No new application implementation, prefetch mechanism, business rule, permission grant, database change or deployment. This change documents completed work and does not schedule additional feature work.

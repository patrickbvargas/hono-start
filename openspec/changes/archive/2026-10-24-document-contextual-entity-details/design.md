## Context

This is an as-built record of commit `873635c`, not a plan to replace the implementation. The checked-in application and its updated domain/frontend documentation define the delivered scope. Earlier experiments, including prefetch, are excluded from the final design.

## Goals / Non-Goals

**Goals:** preserve the originating detail, make return behavior explicit, retain normal loading feedback, and support narrow and short viewports.

**Non-goals:** introduce another overlay framework, alter authorization, add eager fetching, or change persistence.

## Decisions

- Main details use the validated optional `detailId` route search parameter for clients, employees, contracts, expenses, fees and remunerations. Detail selection is omitted from list loader dependencies and list query input.
- Singular relationships use `RelatedRecordLink`, a native button with dialog semantics. Its local `useOverlay` opens a lazily loaded related-records integration that composes existing public feature details and mutation components.
- The integration supports client, employee, contract and fee records. It owns no separate data API; existing feature hooks, query cache and authorization continue to apply.
- Shared detail depth determines the default footer: root “Fechar”, nested “Voltar”, including loading and error states. Closing a related detail reveals its parent without a route transition.
- Collection relationships remain navigation links with descriptive accessible names. Their history state requests that advanced filters collapse even when the destination route is reused. Active filters do not automatically expand the panel.
- Related details load on open through React lazy/Suspense and existing queries. There is no added hover, focus or data prefetch. Existing TanStack Query cache behavior remains in effect.
- Mobile details occupy available width. Forms bound their height to the viewport and scroll their body while retaining header/footer access. Dialog portals use layer 60 and confirmation portals layer 70 above detail drawers at layer 50.
- Mobile sidebar links and the home logo close the mobile sidebar. Its accessible title and description are in Portuguese.

## Risks / Trade-offs

- Cold opens may show a skeleton; this is the explicitly accepted behavior after removing prefetch.
- Nested mutations require correct portal stacking; browser viewport checks complement component tests because DOM-only tests do not prove geometry.
- Existing record permissions remain authoritative. Contextual access must not grant broader mutation or tenant access.

## Delivery and Verification

Delivered in `873635c`; no migration is required. Prior verification recorded 19 focused passing tests for the related flow, shared overlays/forms, filters and sidebar, plus formatting/lint, TypeScript and production build checks. Browser review covered 320×568, 390×844, 390×664 and 568×320, including nested editing and discard confirmation without saving business data. The full test suite was not wholly green: attachment-storage checks encountered Windows directory rename `EPERM`, outside this change's scope.

## Open Questions

None for this retrospective. No new implementation is proposed.

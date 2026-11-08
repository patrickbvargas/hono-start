# Frontend — Layout & Route Patterns

> **Scope**: Route model, layout composition, overlay system, interaction patterns, theme rules. Does not cover form rules (see FRONTEND_FORMS.md) or table/list rules (see FRONTEND_TABLES.md).

## Route Model

- Pages live in `src/routes/`.
- Routes compose feature UI and route-level concerns only.
- Route search state is the canonical home for list filters, sorting, and pagination.
- Route files use `createFileRoute` with validated search state and loader prefetching for list screens.
- Route loaders must ensure query data ahead of render rather than letting the page fetch ad hoc.
- Filter-heavy routes prefetch both the primary list query and every unconditional header/filter option query required at first render.
- The canonical list route shape is the `src/routes/_app/pessoas.tsx` flow backed by `src/features/people`.

## Layout Rules

- Top-bar create, edit, delete and restore buttons use the shared Button `sm` size, including the dashboard create menu and ButtonNew.
- Route pages use the wrapper layout system from shared components.
- Entity collections open dedicated record workspaces by default. Contextual relationship inspection uses existing detail drawers.
- Create and edit forms open in modals.
- Destructive actions require explicit confirmation UI.
- Entity list pages must be composed with `Wrapper`, `WrapperHeader`, and `WrapperBody`.
- Entity lists are the main entrypoint for operational work.
- Feature UI modules follow the canonical slice pattern in `ARCHITECTURE.md`; nested component re-export barrels are not part of the frontend pattern.

## Overlay System

- The canonical overlay composition is: route-level `useEntityOverlay` (delegating local mutation scopes to `useOverlay`), create and edit form modals, delete and restore confirmations, and a details drawer rendered from the route body.
- `useOverlay` state is route-local to the hook instance, exposes named `create`, `edit`, `details`, `delete`, and `restore` scopes, opens `create` without entity data, and opens `edit`, `details`, `delete`, and `restore` with selected entity data.
- Multiple overlay scopes from the same `useOverlay` instance may remain open at the same time when the route composition intentionally renders them together, and closing one scope must not implicitly close another.
- Overlay render callbacks are the canonical bridge from route composition to shared modal, confirmation, and drawer wrappers through `OverlayState`.
- Overlay portals maintain explicit stacking: drawers use the existing z-50 layer, dialog portals establish z-60 and alert-dialog portals z-70 so editing and discard confirmations remain above related drawers.
- `EntityForm` uses a flex column bounded by `calc(100dvh - 2rem)`, with a shrinkable, internally scrolling body and fixed header/footer space.

## Entity Overlay Details

- Entity routes extend their feature list search schema with shared `entityDetailSearchSchema`. Optional positive integer `detailId` selects the details drawer through `useEntityOverlay`; create/edit/delete/restore retain `useOverlay` state. Exclude `detailId` from list loader dependencies and list query keys.
- Closing a route-selected detail clears only `detailId` with replace navigation, preserving filters. Closing a contextual related detail closes only its local overlay.
- Related-record triggers use `RelatedRecordLink` with persisted IDs and local overlays, retaining the current route and origin drawer.

## Contextual Drawer Rules

- `EntityDetail` drawers dismiss on backdrop presses, Escape and their explicit close button. They remain non-modal so sibling edit/delete dialogs and attachment forms can receive focus.
- Focus leaving the drawer does not dismiss it; outside presses in portaled menus, forms and confirmation dialogs do not dismiss it either.
- Drawer backdrops remain rendered when nested inside a dialog so backdrop dismissal closes only the innermost layer.

## Navigation and Sidebar

- The mobile sidebar closes when selecting a navigation destination, including the home logo and the current route. Its dialog title and description are in pt-BR.
- Sidebar route labels and user-facing navigation remain in the product locale.
- Shared `NavigationLink` preserves TanStack Router link typing and adds a decorative navigation icon.
- Collection `NavigationLink` destinations carry `resetFilterPanel` in history state. Shared `useFilterPanel` collapses on each marked navigation key.
- Advanced filter panels initialize closed and do not auto-expand in response to active URL filters. Filter chips remain visible while the panel is collapsed.

## State Feedback

- Loading states use skeleton-style placeholders.
- Empty states use helpful user-facing copy in the product locale.
- Primary collection tables and cards use the shared UI `ListEmptyState` through their optional `emptyState` slot; contextual consumers retain `emptyMessage`. Keep table headers and fill the available list height. Use an icon, title, short explanation and one contextual action.
- Collection routes instantiate the feature filter hook once and pass its controller to the filter component. The empty state's Limpar filtros action uses that same controller to cancel debounced search, reset displayed fields and apply default URL filters.
- Buttons show loading state and become disabled during submission.
- Toasts are the canonical user-feedback mechanism for mutation results. Do not use browser-native alerts or confirms for product interactions.
- Routes use `RouteLoading` as the in-place navigation signal during search, pagination, and sorting changes instead of swapping the whole route tree with route-level pending skeletons.

## Canonical List-Management Pattern

A full list route composes:
- route-level loader with validated search state
- filter controls in the route header
- route-consumed list query from the feature barrel
- server-backed table in the route body
- create modal
- edit modal
- details drawer
- delete confirmation flow
- restore confirmation flow

## shadcn/ui Rules

- shadcn/ui components and prop types are imported through shared UI re-exports only (`@/shared/components/ui`).
- Features must not bind themselves directly to shadcn, Radix, Base UI, or other vendor UI primitives.
- Shared UI modules keep shadcn-style named exports for composed parts such as `TableHeader`, `TableBody`, `CardHeader`, `TabsList`, and `AlertDialogContent`.
- UI patterns must remain consistent across entities unless an intentional difference is documented.

## Clerk Identity UI

- ClerkProvider owns authentication. The session Query exposes only a Zod-validated domain actor/capability projection.
- User, organization, session or token-grant changes cancel requests, clear caches and revalidate routes before old content can render.
- Clerk `SignIn`/`SignUp`/`UserProfile` widgets are an explicit vendor UI exception inside authentication-owned components; other UI uses shared exports.
- Collaborator filters in Dashboard, Contracts, Remunerations and Pending Work show the Clerk photo beside option names. Missing photos use initials from the business name. Photos are never stored on Employee.
- Protected option handlers enrich photos through authentication's server-only helper. Display-only server cache and employee option queries refresh after 60 seconds; provider failures retain usable fallback options with a 10-second server retry cooldown.

## Application Theme

- `src/styles/global.css` is the single stylesheet for application theme tokens.
- Edit semantic variables in `:root` and `.dark` to theme shared shadcn UI and Clerk together.
- Do not add independent colors, fonts, or radii to individual Clerk components through `appearance`.
- Application components consume only standard shadcn semantic tokens defined in `global.css`. Do not add custom theme variables.
- Do not use fixed palette colors in application TSX. Component radii derive from the global radius scale.
- KPI comparison badges use green/red as explicitly requested; this is the intentional exception to semantic-only theme colors.
- Exported PDFs retain an independent print palette.

## Financial Value Visibility

- The wrapper header exposes a global eye button to hide/show financial display values, including dashboard cards, charts, lists and details.
- The preference is local to the browser and persists across navigation and reload.
- Hidden monetary text uses `R$ •••` without blur and an accessible `Valor oculto` label. Hidden charts show a placeholder; editing inputs and exported documents retain original values.
- This display preference does not change permissions or requests.

## Interaction Details

- Client contact sections expose `CopyValue` for email and phone; employee overviews expose it for OAB. Phone copies digits only; email and OAB copy stored values. Absent values have no copy action.
- Contract process numbers, CPF/CNPJ in overview sections expose the shared UI `CopyValue` action. Copy buttons remain siblings of related-record links so copying never activates record navigation.
- The shared `useCopyToClipboard` hook reports success only after the browser write resolves, handles denied/unavailable clipboard access, and clears transient feedback after two seconds or record changes.
- The UI remains desktop-first but must remain usable on smaller screens.

## Product Terminology

- Keep the organization context implicit in user-facing copy: do not add *da firma* or *do escritório*. Use concise wording such as *Despesas* and *Visão geral*.

## Dependency Migration Contracts

- TanStack Start server functions validate inputs with `.validator(schema)`.
- Zod 4 search schemas are passed directly to route `validateSearch`; no Zod 3 adapter is used.
- Vite resolves TypeScript paths natively with `resolve.tsconfigPaths`.

## Current financial navigation and dashboard

Operational revenue editing captures type, negotiated amount and notes. Planning belongs to title generation. Financial navigation uses Contas a receber and Contas a pagar; obsolete honorarios/remuneracoes URLs redirect to collections without translating old record IDs.

Dashboard projections read actual titles and bridges. Planned value follows active title due dates; cash follows signed receipt/payment events, with reversals on their effective dates. Generated remuneration is separate from payments. Authorization precedes projections, counts and options. Result metrics require all financial read grants and no attribution filters. Operational deletion does not remove financial obligations.

Settlement inputs preserve invalid amounts for explicit validation. Successful settlements/reversals refresh titles, movements, contracts, expenses, dashboard, pending work and audit, including inactive cached reads.

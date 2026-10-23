# Frontend

This document defines the reusable frontend house pattern of the repository.

It is meant to survive domain changes as long as the project keeps the same UI architecture.

## Route Model

- Pages live in `src/routes/`.
- Routes compose feature UI and route-level concerns only.
- Route search state is the canonical home for list filters, sorting, and pagination.
- Route files use `createFileRoute` with validated search state and loader prefetching for list screens.
- Route loaders must ensure query data ahead of render rather than letting the page fetch ad hoc.
- Filter-heavy routes prefetch both the primary list query and every unconditional header/filter option query required at first render.
- The canonical list route shape is the `src/routes/_app/clientes.tsx` flow backed by `src/features/clients`.

## Layout Rules

- Route pages use the wrapper layout system from shared components.
- Entity details open in drawers.
- Create and edit forms open in modals.
- Destructive actions require explicit confirmation UI.
- Entity list pages must be composed with `Wrapper`, `WrapperHeader`, and `WrapperBody`.
- Entity lists are the main entrypoint for operational work.
- Feature UI modules follow the canonical slice pattern in `ARCHITECTURE.md`; nested component re-export barrels are not part of the frontend pattern.

## Form Rules

- Forms are built through the shared app-form pattern and then wrapped by feature-local hooks.
- Feature form hooks are the canonical orchestration layer for create and edit behavior.
- The feature form hook selects the active schema, submits the parsed payload to the feature mutation boundary, refreshes caches, drives toast feedback, and hydrates edit defaults from the detail query when needed.
- Form hook options and component props use explicit local interfaces as defined in `CONVENTIONS.md`.
- Validation errors and helper copy are shown in the product locale defined by the domain or product contract.
- Create and edit flows must share the same feature form component unless a documented exception exists.
- Private child components inside a form are allowed when React hook boundaries require them, such as dependent option loading from a subscribed field value; they must stay feature-local and must not become a second form pattern.

## Table And List Rules

- Lists are server-driven.
- Filtering, sorting, and pagination are URL-driven.
- Empty, loading, and error states must be explicit.
- Stable sorting must be preserved to avoid pagination drift.
- Feature routes with filters must render the filter in the header and the table in the body.
- Overlay state for create, edit, details, delete, and restore must use the shared overlay pattern rather than ad hoc modal state.
- Entity routes must preserve list context while overlays are open.
- The canonical overlay composition is: route-level `useOverlay`, create and edit form modals, delete and restore confirmations, and a details drawer rendered from the route body.
- `useOverlay` state is route-local to the hook instance, exposes named `create`, `edit`, `details`, `delete`, and `restore` scopes, opens `create` without entity data, and opens `edit`, `details`, `delete`, and `restore` with selected entity data.
- Multiple overlay scopes from the same `useOverlay` instance may remain open at the same time when the route composition intentionally renders them together, and closing one scope must not implicitly close another.
- Overlay render callbacks are the canonical bridge from route composition to shared modal, confirmation, and drawer wrappers through `OverlayState`.
- Loading states use skeleton-style placeholders.
- Empty states use helpful user-facing copy in the product locale.
- Buttons show loading state and become disabled during submission.
- The canonical list-management pattern is:
  - route-level loader with validated search state
  - filter controls in the route header
  - route-consumed list query from the feature barrel
  - server-backed table in the route body
  - create modal
  - edit modal
  - details drawer
  - delete confirmation flow
  - restore confirmation flow
- Equivalent entity tables expose lifecycle authority through `canManageLifecycle` when they show edit, delete, or restore actions.

## shadcn/ui Rules

- shadcn/ui components and prop types are imported through shared UI re-exports only.
- Features must not bind themselves directly to shadcn, Radix, Base UI, or other vendor UI primitives.
- Shared UI modules keep shadcn-style named exports for composed parts such as `TableHeader`, `TableBody`, `CardHeader`, `TabsList`, and `AlertDialogContent`.
- The former migration compatibility layer has been removed; live UI code uses shared UI re-exports.
- UI patterns must remain consistent across entities unless an intentional difference is documented.

## Interaction Contract

- Toasts are the canonical user-feedback mechanism for mutation results.
- Do not use browser-native alerts or confirms for product interactions.
- The UI remains desktop-first but must remain usable on smaller screens.
- Sidebar route labels and user-facing navigation remain in the product locale.
- The route, overlay, loader, and list-management patterns are reusable even when the business domain changes.
- Routes stay declarative: they validate search state, prefetch list data, mount feature UI, and wire overlays, but they do not take over feature mutation or persistence orchestration.
- Feature-owned components consume feature query data through feature-local hooks in `src/features/<feature>/hooks/use-data.ts` instead of calling TanStack Query hooks directly in render files.
- Feature `api/queries.ts` option factories remain the reusable query boundary for loaders, tests, mutations, and imperative cache access.
- List routes use `RouteLoading` as the in-place navigation signal during search, pagination, and sorting changes instead of swapping the whole route tree with route-level pending skeletons.

## Data Hook Rules

- `hooks/use-data.ts` is the canonical feature-local query-consumption boundary for route data, single-entity data, and option data.
- Primary route data hooks use `useSuspenseQuery` so routes consume prefetched data through one consistent suspense-first pattern.
- Equivalent single-entity hooks for details, delete, restore, and edit hydration use `useSuspenseQuery` when the consumer requires the data unconditionally.
- Option hooks live in `hooks/use-data.ts` and return named fields rather than raw React Query result objects.
- Option hooks that require multiple unconditional queries use one `useSuspenseQueries` call.
- If a feature has both unconditional and conditional option concerns, split the hook concerns instead of collapsing the whole feature into an ad hoc query-consumption pattern.
- If a filter/header uses only a subset of a larger option hook, create a narrower hook for that surface rather than prefetching unrelated queries in the route loader.
- Route loaders and first-render suspense hooks must stay aligned: a route that mounts a suspending filter/header on first paint must prefetch the same unconditional queries that the mounted hook consumes.

## Clerk identity UI

ClerkProvider owns authentication. The session Query exposes only a Zod-validated
domain actor/capability projection. User, organization, session or token-grant
changes cancel requests, clear caches and revalidate routes before old content
can render. Clerk SignIn/SignUp/UserProfile widgets are an explicit vendor UI
exception inside authentication-owned components; other UI uses shared exports.
Lifecycle UI uses operation-specific Clerk capabilities and persisted state;
server authorization remains mandatory even for hidden actions.

## Dependency migration contracts

- TanStack Start server functions validate inputs with `.validator(schema)`.
- Zod 4 search schemas are passed directly to route `validateSearch`; no Zod 3 adapter is used.
- TanStack Table 9 tables share `dataTableFeatures` from `src/shared/lib/table.ts`. Column helpers include that feature type; sorting remains server-driven through URL search.
- Table cell context methods must be called on the context object rather than detached from it.
- Vite resolves TypeScript paths natively with `resolve.tsconfigPaths`.
- The shared DataTable accepts heterogeneous accessor value types using TanStack column definitions. Its local `any` value slot follows the library column helper contract; row models remain explicitly typed.

## Business and authentication isolation

See `docs/domain/DOMAIN_MODEL.md` for ownership boundaries. Authentication resolves the optional business actor through server-validated Clerk privateMetadata.employeeId. Employee UI contains business fields only; account administration belongs to Clerk Dashboard.


## Application Theme

- `src/styles/global.css` is the single stylesheet for application theme tokens.
- Edit semantic variables in `:root` and `.dark` to theme shared shadcn UI and Clerk together.
- Clerk uses its built-in shadcn theme, which consumes these semantic colors. Its font and radius are linked through `--clerk-font-family` and `--clerk-border-radius` on `body` in the base layer, outside the replaceable `:root` and `.dark` theme blocks.
- Do not add independent colors, fonts, or radii to individual Clerk components through `appearance`.

## Standalone drilldown feature

`src/features/drilldown` exposes a props-configured `Drilldown` modal through its public barrel. The consumer owns protected query-option factories, context/filter contracts, Zod response schema, declarative TanStack columns, row identity and optional summary rendering. Use the established `useOverlay().overlay.details.render` pattern to supply overlay state. No chart/entity registry or domain query belongs inside this feature. Context or filter changes remount the local request controller. Pass pageSize to the existing shared DataTable for frontend pagination; the drilldown must not create another paginator or own page state. Consumer queries return the complete selected dataset and page changes do not fetch again or change route search state. Interactive sorting is disabled in this delivery. Shared DataTable uses supplied stable row IDs and renders non-sortable headers without requiring router context.

Read-only column factories stay in the owning entity feature and are exported explicitly for actual reuse. Expense listing and dashboard expense drilldown reuse `getExpenseReadColumns` through the expenses public barrel; the standalone feature never imports it. Adapt compatible accessors without fetching extra fields or embedding a full entity-list table.

## Imperative query execution

Use `queryClient.query(options)` for imperative fetching. Feature option factories own cache policy, including `staleTime: Infinity` where configured. Loaders call `queryClient.query(optionsFactory(...))` without overrides. Infinite freshness still permits mutation invalidation to refetch active observers. Do not use static freshness for mutable business data. Do not use deprecated fetchQuery or ensureQueryData methods.

Entity list, detail and dashboard data queries inherit global QueryClient cache settings; do not override staleTime in those factories or loaders. Only lookup and selectable-option queries use staleTime: Infinity, preserving explicit invalidation support. Session verification keeps its security-specific staleTime: 0.

### Theme ownership

Application components consume only standard shadcn semantic tokens already defined in global.css. Do not add custom theme variables: users replace :root, .dark and @theme inline wholesale with community themes. Do not use fixed palette colors in application TSX. Component radii derive from the global radius scale without pixel caps. Customize Tailwind spacing, typography and shadow scales in global.css through @theme. Structural grids, responsive visibility, icon geometry and data-driven chart dimensions remain component responsibilities. Exported PDFs retain an independent print palette.

The shared DataTable optionally accepts pageSize for native TanStack pagination (rowPaginationFeature and createPaginatedRowModel) of supplied rows, with footer navigation only when there are multiple pages and no page-size selector. Without pageSize it renders all supplied rows for server pagination. Row actions retain the original data index; sorting remains URL-driven.



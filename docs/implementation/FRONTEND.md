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

- Top-bar create, edit, delete and restore buttons use the shared Button `sm` size, including the dashboard create menu and ButtonNew.

- Route pages use the wrapper layout system from shared components.
- Entity collections open dedicated record workspaces by default. Contextual relationship inspection uses existing detail drawers.
- Create and edit forms open in modals.
- Destructive actions require explicit confirmation UI.
- Entity list pages must be composed with `Wrapper`, `WrapperHeader`, and `WrapperBody`.
- Entity lists are the main entrypoint for operational work.
- Feature UI modules follow the canonical slice pattern in `ARCHITECTURE.md`; nested component re-export barrels are not part of the frontend pattern.

## Form Rules

- Attachment forms use the plain FormSection variant: the upload drop zone owns the visible border, avoiding nested card wrappers.

- Business form modals use a wider two-column canvas, a bordered title-only header, and plain sections with sentence-case headings only when multiple groups are present. Header and footer stay outside the scrolling body. The footer exposes Cancelar beside the primary action; Cancelar uses the same dirty/submitting dismissal guard as the close button and Escape. Loading states retain the same section headings and layout.

- All business create/edit forms use EntityForm, FormSection and the shared app-form fields. Use gap-4 (1rem) between fields and grid columns, with one column on narrow screens and two from sm when fields belong together. Keep the shared control height (h-8), typography, radius, validation and required indicator; do not add feature-specific variants for equivalent fields.
- In all business forms exposing Ativo (clients, employees, expenses, fees and contracts), place Ativo at the end of the basic-data section in the form body, including loading placeholders. The footer contains actions only. Fee generation stays with the receipt data. Contract status-change permission stays with the contract data and retains administrator-only visibility. Do not create a separate Opções section. Labels use sentence case, `Observações` for notes and a trailing `(%)` for percentage fields. Contextual date labels identify the event. Preserve domain-specific labels and conditional fields.
- Section additions use a right-aligned ghost/sm action with the plus icon. Row removal uses an outline/icon button matching the h-8 input height. The primary footer uses the shared Submit (`Salvar`); attachment upload keeps its explicit `Enviar anexos` action and progress copy. Loading placeholders mirror the actual field order, groups and button dimensions, including checkbox-before-label order. Production form composition must not enable debug output.
- Filters retain the shared ListFilters composition rather than a modal layout; equivalent active-record filters use `Situação`. Clerk-owned authentication remains the documented vendor UI exception.

- EntityForm subscribes to the existing app-form context to guard dismissal while dirty or submitting. Its shared discard confirmation preserves drafts; skeletons outside form context retain normal dismissal.
- Financial list APIs use FinancialQueryPaginatedReturnType and validate totalAmount through financialTotalsSchema. Aggregate queries reuse the list's authorized where and omit pagination. Never sum only the current page to represent a filtered total.

- Numeric inputs use an explicit pt-BR locale independently of the OS/browser language. Money fields use a 0.01 step so blur preserves cents. Calendar selection closes its popover after updating the field. Business calendar dates use formatter.calendarDate to preserve their ISO date portion independently of timezone; creation/update timestamps retain formatter.date.
- Financial list period shortcuts expose Todo período, Este mês and Personalizado. Personalizado opens the shared DateRangePicker using the existing calendar styling and Portuguese dates; period controls do not appear in advanced filters. Selecting both boundaries applies the range atomically and closes the popover; clearing resets both boundaries. Existing open-ended URL filters remain visible. Desktop and mobile share this control.
- Financial list desktop filters follow the compact list filter pattern below; period shortcuts and totals stay in their own row.
- The fee list Tipo de honorário filter uses unique revenue-type lookup options and filters by lookup value across contracts. Fee create/edit forms still select an individual contract revenue. Legacy revenueId list links continue to filter their specific revenue.
- Selectable option query factories mark meta.refreshOnMutation as true. Audited mutations invalidate these selections as well as their entity and audit queries, so records created in one form become available in subsequent forms without reloading. Session queries retain their separate security cache policy.

- Forms are built through the shared app-form pattern and then wrapped by feature-local hooks.
- Feature form hooks are the canonical orchestration layer for create and edit behavior.
- The feature form hook selects the active schema, submits the parsed payload to the feature mutation boundary, refreshes caches, drives toast feedback, and hydrates edit defaults from the detail query when needed.
- Form hook options and component props use explicit local interfaces as defined in `CONVENTIONS.md`.
- Validation errors and helper copy are shown in the product locale defined by the domain or product contract.
- Create and edit flows must share the same feature form component unless a documented exception exists.
- Private child components inside a form are allowed when React hook boundaries require them, such as dependent option loading from a subscribed field value; they must stay feature-local and must not become a second form pattern.

## Table And List Rules

- Listing tables fill the remaining WrapperBody height, including empty and short results. Keep rows at their natural height, scrolling inside the table and pagination at the bottom. Contextual tables retain their local height constraints.

- Application-owned scrolling regions use the shared ScrollArea, including form bodies, mobile filter bodies, sidebar content, settings, loading placeholders and technical payloads. Keep height constraints on the root and viewport for content-sized regions and retain fixed headers/footers outside the viewport. Vendor-owned select, combobox, command and menu scrolling remains integrated with those primitives' keyboard navigation and positioning.

- Lists are server-driven.
- Filtering, sorting, and pagination are URL-driven.
- Empty, loading, and error states must be explicit.
- Error recovery actions use the shared small button styling: navigation to the home page uses a plain router Link with buttonVariants({ size: "sm" }), without NavigationLink decoration; local Tentar novamente actions use Button with type="button", variant="outline" and size="sm". This applies to 404, route errors and contextual data-loading errors.
- Stable sorting must be preserved to avoid pagination drift.
- Feature routes with filters must render the filter in the header and the table in the body.
- Overlay state for create, edit, details, delete, and restore must use the shared overlay pattern rather than ad hoc modal state.
- Entity routes must preserve list context while overlays are open.
- Delete confirmations use the static message `Tem certeza que deseja excluir?` and the selected entity ID. Opening a confirmation must not fetch entity data just to build its message.
- The canonical overlay composition is: route-level `useEntityOverlay` (delegating local mutation scopes to `useOverlay`), create and edit form modals, delete and restore confirmations, and a details drawer rendered from the route body.
- `useOverlay` state is route-local to the hook instance, exposes named `create`, `edit`, `details`, `delete`, and `restore` scopes, opens `create` without entity data, and opens `edit`, `details`, `delete`, and `restore` with selected entity data.
- Multiple overlay scopes from the same `useOverlay` instance may remain open at the same time when the route composition intentionally renders them together, and closing one scope must not implicitly close another.
- Overlay render callbacks are the canonical bridge from route composition to shared modal, confirmation, and drawer wrappers through `OverlayState`.
- Loading states use skeleton-style placeholders.
- Empty states use helpful user-facing copy in the product locale.
- Primary collection tables and cards use the shared UI ListEmptyState through their optional emptyState slot; contextual consumers retain emptyMessage. Keep table headers and fill the available list height. Use an icon, title, short explanation and one contextual action.
- Collection routes instantiate the feature filter hook once and pass its controller to the filter component. The empty state's Limpar filtros action uses that same controller to cancel debounced search, reset displayed fields and apply default URL filters. Routes wire the existing permission-checked ButtonNew and create overlay for empty manually created collections. Derived and read-only collections do not expose creation; informational copy describes the authorized scope without claiming global absence.
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

- Contextual EntityDetail drawers dismiss on backdrop presses, Escape and their explicit close button. They remain non-modal so sibling edit/delete dialogs and attachment forms can receive focus. Focus leaving the drawer does not dismiss it; outside presses in portaled menus, forms and confirmation dialogs do not dismiss it either. Drawer backdrops remain rendered when nested inside a dialog, including drilldown summaries, so backdrop dismissal closes the summary while preserving its parent. Base UI owns nested-layer dismissal so only the innermost summary closes on a backdrop press.

- The wrapper header exposes a global eye button to hide/show financial display values, including dashboard cards, charts, lists and details. The preference is local to the browser and persists across navigation and reload. Hidden monetary text uses `R$ •••` without blur and an accessible `Valor oculto` label. Hidden charts show the same placeholder instead of their contents; editing inputs and exported documents retain their original values. This display preference does not change permissions or requests.

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
- TanStack Table 9 tables share `dataTableFeatures` from `src/shared/lib/table.ts`. Column helpers include that feature type. Entity lists sort through URL search; DataTable with `pageSize` uses native client sorting before pagination.
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

`src/features/drilldown` exposes a props-configured `Drilldown` modal through its public barrel. The consumer owns protected query-option factories, context/filter contracts, Zod response schema, declarative TanStack columns, row identity and optional summary rendering. Use the established `useOverlay().overlay.details.render` pattern to supply overlay state. No chart/entity registry or domain query belongs inside this feature. Context or filter changes remount the local request controller. Pass pageSize to the existing shared DataTable for frontend pagination; the drilldown must not create another paginator or own page state. Consumer queries return the complete selected dataset and page changes do not fetch again or change route search state. Interactive sorting is local through DataTable and respects the consumer column configuration; the modal must not override enableSorting. Dashboard drilldown accessor columns enable sorting and default to date descending (newest first) through the consumer-provided initialSorting prop. Shared DataTable uses supplied stable row IDs and renders non-sortable headers without requiring router context.

Read-only column factories stay in the owning entity feature and are exported explicitly for actual reuse. Expense listing and dashboard expense drilldown reuse `getExpenseReadColumns` through the expenses public barrel; the standalone feature never imports it. Adapt compatible accessors without fetching extra fields or embedding a full entity-list table.

## Imperative query execution

Use `queryClient.query(options)` for imperative fetching. Feature option factories own cache policy, including `staleTime: Infinity` where configured. Loaders call `queryClient.query(optionsFactory(...))` without overrides. Infinite freshness still permits mutation invalidation to refetch active observers. Do not use static freshness for mutable business data. Do not use deprecated fetchQuery or ensureQueryData methods.

Entity list, detail and dashboard data queries inherit global QueryClient cache settings; do not override staleTime in those factories or loaders. Only lookup and selectable-option queries use staleTime: Infinity, preserving explicit invalidation support. Session verification keeps its security-specific staleTime: 0.

### Theme ownership

Application components consume only standard shadcn semantic tokens already defined in global.css. Do not add custom theme variables: users replace :root, .dark and @theme inline wholesale with community themes. Do not use fixed palette colors in application TSX. Component radii derive from the global radius scale without pixel caps. Customize Tailwind spacing, typography and shadow scales in global.css through @theme. Structural grids, responsive visibility, icon geometry and data-driven chart dimensions remain component responsibilities. Exported PDFs retain an independent print palette.

The shared DataTable optionally accepts pageSize for native TanStack pagination (rowPaginationFeature and createPaginatedRowModel) of supplied rows, with footer navigation only when there are multiple pages and no page-size selector. With pageSize, sortable headers use native TanStack sorting (createSortedRowModel and sortFns) on the complete supplied dataset before pagination, without router context, URL changes or requests. Column enableSorting and sortingFn settings are respected. The optional initialSorting prop supplies native TanStack initial sorting state. Clicking a header cycles its native sorting states. Without pageSize it renders all supplied rows for server pagination and sorting stays URL-driven with manualSorting enabled. Row actions retain the original data index in both modes.



## Product terminology

- Keep the organization context implicit in user-facing copy: do not add da firma or do escritório. Use concise wording such as Despesas and Visão geral. Internal firm identifiers remain unchanged.

Table cell actions use the shared TableButton, including dashboard drilldowns and entity triggers. Financial filtered totals stay on one line. Pagination retains page-size selection and navigation on a single page. Detail skeleton grids match their loaded fields. Attachment details expose filename, metadata and actions together. KPI comparison badges use green/red as explicitly requested; this is the intentional exception to semantic-only theme colors.

Shared NavigationLink preserves TanStack Router link typing and adds a decorative navigation icon. Financial feature filters place their optional summary slot at the right of the period shortcuts row, below the primary filter bar; narrow screens may wrap the summary. Advanced panels must not determine the vertical position of filtered totals.

Entity routes extend their feature list search schema with shared entityDetailSearchSchema. Optional positive integer detailId selects the details drawer through useEntityOverlay; create/edit/delete/restore retain useOverlay state. Exclude detailId from list loader dependencies and list query keys. Related-record triggers use RelatedRecordLink with persisted IDs and local overlays, retaining the current route and origin drawer. Collection links still navigate to filtered lists. Closing a route-selected detail clears only detailId with replace navigation, preserving its filters. Closing a contextual related detail closes only its local overlay. Details selected from lists also use this URL state, supporting browser Back and reload.

Advanced filter panels initialize closed and do not auto-expand in response to active URL filters. Filter chips remain visible while the panel is collapsed.

Collection NavigationLink destinations carry resetFilterPanel in history state. Shared useFilterPanel collapses on each marked navigation key, including navigation within the same mounted route, and preserves manual expansion during ordinary filter edits and detail open/close. Contextual detail buttons expose aria-haspopup=dialog and aria-expanded; collection count links have descriptive accessible names.

RelatedRecordLink loads its lazy detail composition and entity data only when opened. Hover and focus do not prefetch modules, entity data or attachment metadata. The module-loading Suspense boundary renders no provisional drawer; the entity detail owns the single drawer and its data-loading skeleton, avoiding a second entrance animation when the module resolves. Existing query cache behavior remains in effect.

Overlay portals maintain explicit stacking: drawers use the existing z-50 layer, dialog portals establish z-60 and alert-dialog portals z-70 so editing and discard confirmations remain above related drawers. EntityForm uses a flex column bounded by calc(100dvh - 2rem), with a shrinkable, internally scrolling body and fixed header/footer space. Validate geometry and hit testing in a real browser at narrow and short viewports; jsdom does not calculate stacking or viewport layout.

The mobile sidebar closes when selecting a navigation destination, including the home logo and the current route. Its dialog title and description are in pt-BR.

AttachmentSection owns its single shared-style heading, loaded count and permitted Anexar action. Supported drawers mount it directly, without another titled section. Files use divided compact rows with type, wrapping filename, size and date; download stays visible and authorized deletion lives in the secondary actions menu with existing confirmation. Skeletons match the compact header and row. Query errors show safe copy and a retry action.
Compact drawer attachment lists have a maximum height of 14rem (three compact rows with room for dividers), then scroll within the section. The section heading and upload action remain outside this scroll area. The contract workspace fills the available tab height and scrolls attachments internally beneath the fixed section heading and upload action. File rows reserve a 4rem minimum height; long filenames may increase row height. Empty and loading states use a single 1.25rem text line without row padding.

FormFile supports optional multiple selection with an array-valued field and maxFiles, appending new selections and offering individual removal. Existing single-file consumers preserve their value and callback contract. Attachment batch orchestration validates the complete selection using its Zod schema, prepares the full payload, submits it in one protected request, and invalidates attachment/audit queries after successful completion.

Contract forms show collaborator and assignment fields directly. Revenue rows open initially when incomplete or invalid and remain manually collapsible; submission attempts reopen invalid rows, and summarize type, total and installment count when collapsed. Type and total precede payment details. The feature form-sections hook preserves stable row keys and focuses the first field after additions. Shared EntityListAccordion supports opt-in automatic-open rows; other consumers retain normal collapsed behavior.


## Connected platform presentation

The contract workspace is the reference for dedicated record pages across entity collections. Its route remains thin, prefetches the existing protected detail query and validates tab/return context with the feature-owned Zod schema. ContractRevenues and canReadContractReceipts are shared inside the contract feature between drawer and workspace. Route search navigation names the dynamic destination explicitly. Mutations use existing overlays and form hooks; no new persistence or permissions model is introduced.

EntityForm subscribes to submission attempts and validation state, shows a shared invalid-submit alert and focuses the first enabled invalid control in its own portal after invalid sections open. FormSubmitButton uses the native form association by formId, allowing one submit through the existing FormRoot even when rendered in a dialog portal. Autocomplete labels target unique control IDs and expose a label/required state on their actual inputs. FinancialPeriodShortcuts is shared across the three financial lists.

Audit filter entityId is an optional positive integer. List and count queries apply its exact stored string identity with existing firm/type scopes. The active-filter chip makes it visible and removable; clearing all filters explicitly removes it.

EntityAuditHistory is a feature-owned embedded audit collection with the complete entity-scoped history, native DataTable frontend pagination via pageSize={25} (controls hidden for at most one page), fixed newest-first ordering, existing protected query factories, exact entity type/ID scope and local detail overlays. It mounts its query only for audit readers and only when its tab is mounted; it must not reuse route-driven AuditLogTable pagination/sorting in a parent workspace.

Product review: severity and type use checkbox multi-selection. Empty selections mean all; values within one filter combine with OR, different filters combine with AND. Each active value has its own removable chip. Summary cards use the same shared Card/Header/Content, typography and padding as dashboard metrics, with its standard 24px header baseline (96px total at a single-line title), red high values, amber medium values and blue low values; zero stays neutral. The body uses the dashboard's inner p-0.5 and gap-4 to preserve card rings and spacing.

Pending-work table rows open contract finance and retain validated list search through contract workspace pendingReturnTo. Contract/client cells are plain text and the table has no separate finance action; it is validated using the pending feature's public search contract and does not accept arbitrary return URLs. Summary card filtering is owned by a feature hook using shared useFilter. Dates and remaining-balance display are shared between the feature table and mobile cards; navigation actions use the shared buttonVariants styling on native router links. Product review keeps only the monetary label Saldo a receber.

## Entity management workspace pattern

Clients, employees, fees, expenses, remunerations and audit logs own components/workspace/index.tsx, hooks/use-workspace.ts and schemas/workspace.ts. Dynamic sibling routes remain thin, validate positive IDs and prefetch existing protected queries. Feature schemas validate supported tabs and returnTo against their list search schema; invalid return state uses list defaults. EntityWorkspace is presentation only and is used by contracts as well as the other record pages; it owns headings, record-level actions, identity, return link, content width and scrollable tabs. Feature overview content is shared locally with drawers, never rendering drawer primitives on a page. Existing attachment owners use a dedicated expanded tab; history mounts only when selected and remains audit-reader scoped. Audit pages are immutable. Table IDs are noninteractive and primary names open pages; mobile cards prefer onOpenPage, with explicit page and drawer menu entries; legacy detailId URLs remain valid and excluded from list query keys. Feature hooks retain query, permission and overlay orchestration; existing lifecycle helpers, forms, confirmations and invalidation remain authoritative. RelatedRecordLink always opens contextual drawers, including contracts.

Record-page content uses feature-owned section selection on existing overview components; the default all section retains complete drawer presentation. Contact and financial sections validate URL tab state through the owning feature Zod schema. EntityWorkspaceHistory presents creation/update fields without lifecycle state, followed by caller-supplied scoped history. Page lifecycle state belongs only in the common identity header; contract Andamento is not repeated in overview. Common actions use Editar, Excluir and Restaurar labels. History, financial tables and ordinary data sections share the same maximum width. Audit overview, changes and technical payload are separate addressable tabs.

RelatedContractAlerts is owned by pending-work and reused in client/employee overviews. It gates mounting on contract and fee subject grants, consumes the existing query through use-data/use-related-contract-alerts, uses fixed local preview search independent of the parent route and never fans out per contract. Collection navigation uses NavigationLink and exact validated IDs; contextual contract inspection uses RelatedRecordLink. Remuneration feeId is an optional positive numeric filter owned by its search schema, with an active removable chip and explicit clear-all removal; the existing data where-builder drives list, aggregates and export consistently.

Record workspace lifecycle actions use the application header action slot. Identity, ID and status share one compact row. The workspace wrapper never scrolls: tabs fill remaining height and their panels own vertical scrolling; expanded attachments retain internal list scrolling.

Client and employee overview alerts use the shared ScrollArea in a flex section that fits its content and shrinks to the remaining tab height when needed. General fields and alert heading/summary stay outside the list scroller. Very short viewports retain an outer overflow fallback.

Drawer headers use plain identity titles and a separate Abrir página link, preserving validated list return context. The link sits beside the title on desktop and above body content on mobile. Entity row menus use the same Abrir página label. Row menus label contextual drawers Ver resumo. Workspace status aligns to the right of the identity row.

Content navigation to another page uses NavigationLink with its decorative arrow. Explicit table navigation buttons use NavigationLink with its decorative arrow, without text underline. Return links labeled Voltar use plain router links without arrows. Entity page menu actions keep text-only labels without navigation arrows. EntityIdTrigger adds a decorative navigation arrow to clickable names and keeps IDs as noninteractive muted text. Contextual summary triggers remain without navigation arrows. Sidebar destination icons and list sorting/pagination retain their own navigation controls.

Entity workspace tabs share the same full available width up to max-w-4xl, including expanded attachment and alert panels, finance, team and audit details. History tabs, including audit tables, use the same maximum width; expanded controls height/scrolling, not width.

Entity listing tables omit the creation timestamp column (`Criado em`).

Table interaction contract: main entity listing rows open the record page and support Enter/Space activation, with a native title tooltip describing the action. IDs, primary labels and related entity cells render plain text; the row has one destination. Interactive controls and the options menu do not trigger row navigation. Contextual tables retain their local summary/drawer triggers. Dashboard table triggers use a subtle background and ring on hover, with no permanent underline. Explicit navigation actions retain labeled outline buttons with navigation arrows. Page and drawer content links retain their existing context-specific presentation.

Embedded EntityAuditHistory rows open their local audit detail drawer by click or Enter/Space, retaining the entity page URL and selected tab. Descriptions are plain text and there is no actions column. The row context menu exposes Abrir página and Ver resumo through shared EntityActions; audit page navigation retains the scoped audit search as return context.

Expanded workspace panels retain native outer vertical overflow as a fallback. Overview compositions keep alert wrappers at content height and cap alert lists at the remaining height; expanded attachment sections retain a minimum usable height. Inner lists scroll first and native scroll chaining reaches the tab at their boundaries.

Dashboard drilldown modal rows open contextual summaries by click or Enter/Space. Receipts target their persisted fee ID, remunerations and expenses target themselves, and planned/outstanding installments and initial down payments target their contract. The parent modal remains mounted with sorting, pagination, scroll and filters retained. Its dismissal and modal focus trap are suspended while the summary is open; its portal moves below the drawer layer. Existing protected detail queries and safe local error boundaries preserve resource and tenant authorization. Generic Drilldown accepts optional typed row actions, action labels and nested overlay content; entity orchestration stays dashboard-owned.


Primary entity collection tables (clients, employees, contracts, fees, expenses, remunerations and audit logs) opt into DataTable renderRowContextMenu. Right click on noninteractive row content opens the same authorized actions as the overflow button at the pointer; Shift+F10 and ContextMenu on a focused row open the menu beside that row. Primary click and Enter/Space retain page navigation. Each feature supplies one action renderer for both surfaces, preserving its lifecycle helpers and optional callbacks; EntityActions owns shared permission filtering. Nested controls preserve their own interaction, Escape restores row focus, and delete/restore retain existing confirmations. Contextual tables opt in explicitly; dashboard drilldown and pending-work rows expose paired page/summary actions. Shared context-menu primitives preserve actual tr markup without a wrapper and use the existing vendor boundary and menu styling.

## Local browser preferences

`useLocalStorage` owns JSON persistence for local preferences and validates stored values with the caller's stable Zod schema. It renders the initial value on the server and during hydration, then reads storage after mount. An optional `defaultValue` distinguishes the missing-preference default from the hydration state (financial values start hidden). Storage failures leave controls usable in memory; mounting never writes a default over saved data. Keep schemas and object/array defaults stable outside render. Feature hooks retain their named domain interface. Entity view mode keeps its explicit same-window and cross-tab synchronization in `useEntityViewMode`; the generic hook does not subscribe to storage events.

Dashboard metric titles stay on one line and truncate with an ellipsis when space is limited; help and comparison controls retain their space. Paired dashboard column charts reserve at least 112px per category plus chart margins and scroll horizontally inside their cards when needed. Monthly expense columns use the same chart-2 token as the other secondary series. These cards retain their original 85-spacing-unit total height; the chart fills the remaining body height, with space reserved below the legend for the shared scrollbar.

List filters for clients, employees, contracts, fees, expenses, remunerations, audit logs and pending work use a single desktop row. Search is always first, with a bounded width. Entity selectors retain searchable Autocomplete controls with bounded widths; filters do not stretch to fill unused space. Categorical filters use compact ListFilters.Popover triggers with CheckboxGroup for multiple selection and RadioGroup for single selection (including fee revenue type). Situação and Registro follow the same compact ListFilters.Popover trigger pattern, with RadioGroup options, and remain at the end of the row. Active filter chips and clearing remain below the row. Mobile retains search plus the filter drawer. Do not introduce Mais filtros panels on these desktop lists.

Inline entity selectors on list screens match the search width (13rem on desktop, 15rem from xl). Categorical, Situação and Registro filters retain compact popover triggers.

Dashboard period controls use the same compact shortcut and shared DateRangePicker pattern as financial lists, on a separate row below the main filters, with 6 meses, 12 meses, Este ano and Personalizado. Custom dates apply together from the calendar; period fields are absent from the mobile filter drawer and there is no desktop Mais filtros date panel.

Dashboard exposes searchable inline Cliente and Contrato selectors alongside Colaborador, with the same bounded widths, removable chips and clear-filter behavior. Options reuse the existing permission-scoped client/contract query factories and route prefetches.

Contract, client and employee overview alerts follow the attachment-list pattern: min-w-0 divide-y lists with borderless rows, min-h-16, py-3 and gap-3 spacing, without individual rounded cards or horizontal padding. The section retains its card wrapper, heading and internal scrolling. Each row begins with a text-sm medium title followed by its severity chip, with supporting details below and contextual information or actions to the right.

Contract workspace team lists use min-w-0 divide-y lists and compact borderless min-h-12 py-2 rows inside the existing section card. Assignment roles, inactive badges, employee links and the edit action retain their behavior.

Contract overview alerts render due dates and elapsed overdue days through the same PendingWorkDueDate component as related-contract previews, with remaining balance protected by SensitiveValue. Upcoming alerts have no overdue-day label; exhausted installment plans show balance without a fabricated due date.

Record workspace tabs use the shared ScrollArea for fallback overflow and the tab strip. Overview alert wrappers fit their content up to the remaining available height and scroll internally only when their list exceeds that space, retaining data and alert headings above them. Tab overflow is reserved for viewports too short to fit the fixed data plus the minimum alert area. Native overflow-y-auto on expanded tab panels is not used.

RelatedRecordLink triggers in pages, summaries and table cells retain primary-click summary opening and expose Abrir página followed by Ver resumo through the shared context menu. Right click, Shift+F10 and ContextMenu open it; Escape restores trigger focus. Actions use existing entity read grants and direct navigation uses the same overview destination and validated collection return context as the summary header. Collection links remain outside this behavior.

RelatedRecordLink accepts primaryAction="summary" or primaryAction="page" for per-link overrides. Its local DEFAULT_PRIMARY_ACTION constant defines the application-wide fallback, currently summary. Changing primary action also changes tooltip and dialog accessibility attributes; the context menu retains both explicit choices.


Dashboard drilldown rows and pending-work tables expose Abrir página and Ver resumo through equivalent shared context menus and visible overflow buttons. Generic Drilldown forwards an optional row-context renderer with the actual local row object after sorting/pagination. RelatedRecordActions composes existing EntityActions with related-record navigation and read grants; it does not own an overlay. Dashboard and pending-work parents retain summary overlays outside transient menus. Pending-work menus navigate to the issue finance/team tab with validated pendingReturnTo; existing primary row clicks retain finance navigation, and mobile cards expose equivalent overflow actions.

Attachment items expose shared context and overflow menus containing Baixar and authorized Excluir, using one local action renderer. The direct download shortcut remains. Missing download URLs disable download in every surface; deletion retains the existing confirmation. Attachment item focus supports Shift+F10/ContextMenu and Escape restores focus. Overflow remains available to read-only users for download.

Single-section business forms (clients, expenses, fees and remuneration editing) use the plain FormSection variant without a section title, including skeletons; the modal title supplies context without a redundant card or heading. Multiple-section forms also use plain sections, separated by spacing and a thin divider within EntityForm. Contract revenue accordions retain their item boundaries and collapse behavior. Page sections retain their card wrappers.

The sidebar displays the Clerk application name with its Branding logo as a home link and active Organization as a native Clerk OrganizationSwitcher subtitle, without an Organization avatar, slug or version. A GET server function calls public Frontend API GET /v1/environment without browser Origin/cookies, avoiding development dev_browser_unauthenticated failures. The host comes only from the configured publishable key. The response is validated with Zod and cached by a feature-owned TanStack Query keyed by frontendApi, refreshed on window focus. Missing application branding uses Hono. Organization data refreshes on focus/visibility return. No identity is copied into Firm.

The authentication-owned OrganizationSwitcher hides Personal Account and the trigger avatar. Switching returns to the dashboard and uses the existing session boundary to cancel/clear queries and revalidate access. The Branding logo remains the home link in collapsed mode. Clerk login Branding logos use the shared radius token through .cl-logoImage. OrganizationSwitcher is part of the authentication vendor UI exception.

## Company-wide clients and employees

See [Multitenancy](../domain/MULTITENANCY.md) for the authoritative entity-scope matrix, global lifecycle, evidence visibility and current-Firm enforcement.

### Visual consistency across detail tabs

- Expanded audit change tabs use the same `FormSection` card as overview and technical tabs; compact details retain their plain sections.
- Contract revenue groups use `FormSection` and a wrapping row for related actions. Remuneration calculation summaries use spacing and a divider inside the section instead of a nested card.
- Desktop collection filters wrap within available width so all controls remain reachable. Search and filter controls share one wrapping row, using `contents` on the desktop action group to keep line starts aligned.
- Financial labels use `Honorários (%)`, `Remuneração (%)`, `Indicação (%)` and `Percentual efetivo (%)`; remuneration receipt dates use `Data de recebimento` in lists, details and exports.

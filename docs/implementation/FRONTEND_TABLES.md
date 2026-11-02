# Frontend — Tables & Lists

> **Scope**: Table and list composition rules, column definitions, scroll, pagination, drilldown feature, TanStack Table usage. Does not cover form rules (see FRONTEND_FORMS.md) or layout/route rules (see FRONTEND_LAYOUT.md).

## Table Rules

- Listing tables define columns in a colocated `columns.tsx` factory; table entrypoints own composition and action orchestration. Financial lists place the amount as the last data column, immediately before actions.
- Listing tables fill the remaining `WrapperBody` height, including empty and short results. Keep rows at their natural height, scrolling inside the table and pagination at the bottom. Contextual tables retain their local height constraints.
- Lists are server-driven. Filtering, sorting, and pagination are URL-driven.
- Empty, loading, and error states must be explicit.
- Stable sorting must be preserved to avoid pagination drift.
- Feature routes with filters must render the filter in the header and the table in the body.
- Equivalent entity tables expose lifecycle authority through `canManageLifecycle` when they show edit, delete, or restore actions.
- Table cell actions use the shared `TableButton`, including dashboard drilldowns and entity triggers.
- Financial filtered totals stay on one line.
- Pagination retains page-size selection and navigation on a single page.

## Scroll Rules

- Application-owned scrolling regions use the shared `ScrollArea`, including form bodies, mobile filter bodies, sidebar content, settings, loading placeholders and technical payloads.
- Keep height constraints on the root and viewport for content-sized regions and retain fixed headers/footers outside the viewport.
- Vendor-owned select, combobox, command and menu scrolling remains integrated with those primitives' keyboard navigation and positioning.

## Error and Overlay Rules for Lists

- Error recovery actions use the shared small button styling: navigation to the home page uses a plain router `Link` with `buttonVariants({ size: "sm" })`, without `NavigationLink` decoration; local *Tentar novamente* actions use `Button` with `type="button"`, `variant="outline"` and `size="sm"`.
- Overlay state for create, edit, details, delete, and restore must use the shared overlay pattern rather than ad hoc modal state.
- Entity routes must preserve list context while overlays are open.
- Delete confirmations use the static message `Tem certeza que deseja excluir?` and the selected entity ID. Opening a confirmation must not fetch entity data just to build its message.

## TanStack Table Integration

- TanStack Table 9 tables share `dataTableFeatures` from `src/shared/lib/table.ts`. Column helpers include that feature type.
- Entity lists sort through URL search; `DataTable` with `pageSize` uses native client sorting before pagination.
- Table cell context methods must be called on the context object rather than detached from it.
- The shared `DataTable` accepts heterogeneous accessor value types using TanStack column definitions.

## DataTable Pagination and Sorting

- The shared `DataTable` optionally accepts `pageSize` for native TanStack pagination (`rowPaginationFeature` and `createPaginatedRowModel`) of supplied rows, with footer navigation only when there are multiple pages and no page-size selector.
- With `pageSize`, sortable headers use native TanStack sorting (`createSortedRowModel` and `sortFns`) on the complete supplied dataset before pagination, without router context, URL changes or requests.
- `Column.enableSorting` and `sortingFn` settings are respected. The optional `initialSorting` prop supplies native TanStack initial sorting state.
- Without `pageSize` it renders all supplied rows for server pagination and sorting stays URL-driven with `manualSorting` enabled.
- Row actions retain the original data index in both modes.

## Drilldown Feature

- `src/features/drilldown` exposes a props-configured `Drilldown` modal through its public barrel. The consumer owns protected query-option factories, context/filter contracts, Zod response schema, declarative TanStack columns, row identity and optional summary rendering.
- Use the established `useOverlay().overlay.details.render` pattern to supply overlay state.
- No chart/entity registry or domain query belongs inside this feature.
- Context or filter changes remount the local request controller.
- Pass `pageSize` to the existing shared `DataTable` for frontend pagination; the drilldown must not create another paginator or own page state.
- Consumer queries return the complete selected dataset; page changes do not fetch again or change route search state.
- Interactive sorting is local through `DataTable` and respects the consumer column configuration; the modal must not override `enableSorting`.
- Dashboard drilldown accessor columns enable sorting and default to date descending through the consumer-provided `initialSorting` prop.
- Shared `DataTable` uses supplied stable row IDs and renders non-sortable headers without requiring router context.

## Read-Only Column Factories

- Read-only column factories stay in the owning entity feature and are exported explicitly for actual reuse.
- Expense listing and dashboard expense drilldown reuse `getExpenseReadColumns` through the expenses public barrel; the standalone feature never imports it.
- Adapt compatible accessors without fetching extra fields or embedding a full entity-list table.

## RelatedRecordLink

- `RelatedRecordLink` loads its lazy detail composition and entity data only when opened. Hover and focus do not prefetch modules, entity data or attachment metadata.
- The module-loading Suspense boundary renders no provisional drawer; the entity detail owns the single drawer and its data-loading skeleton.
- Existing query cache behavior remains in effect.
- Contextual detail buttons expose `aria-haspopup=dialog` and `aria-expanded`; collection count links have descriptive accessible labels.

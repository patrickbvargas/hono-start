# Frontend — Forms

> **Scope**: Form rules, validation, entity form pattern, data hook rules, query execution. Does not cover layout (see FRONTEND_LAYOUT.md) or table/list rules (see FRONTEND_TABLES.md).

## Form Rules

- All business create/edit forms use `EntityForm`, `FormSection` and the shared app-form fields.
- Use `gap-4` (1rem) between fields and grid columns, with one column on narrow screens and two from `sm` when fields belong together.
- Keep the shared control height (`h-8`), typography, radius, validation and required indicator; do not add feature-specific variants for equivalent fields.
- Business form modals use a wider two-column canvas, a bordered title-only header, and plain sections with sentence-case headings only when multiple groups are present. Header and footer stay outside the scrolling body.
- The footer exposes Cancelar beside the primary action; Cancelar uses the same dirty/submitting dismissal guard as the close button and Escape. Loading states retain the same section headings and layout.
- Attachment forms use the plain `FormSection` variant: the upload drop zone owns the visible border, avoiding nested card wrappers.
- In business forms exposing Ativo (clients and employees), place Ativo at the end of the basic-data section in the form body, including loading placeholders. The footer contains actions only.
- Labels use sentence case. `Observações` for notes, trailing `(%)` for percentage fields. Contextual date labels identify the event. Preserve domain-specific labels and conditional fields.
- Section additions use a right-aligned ghost/sm action with the plus icon. Row removal uses an outline/icon button matching the `h-8` input height.
- The primary footer uses the shared Submit (`Salvar`); attachment upload keeps its explicit `Enviar anexos` action and progress copy.
- Loading placeholders mirror the actual field order, groups and button dimensions, including checkbox-before-label order.
- Production form composition must not enable debug output.
- Create and edit flows must share the same feature form component unless a documented exception exists.
- Private child components inside a form are allowed when React hook boundaries require them (e.g., dependent option loading from a subscribed field value); they must stay feature-local and must not become a second form pattern.
- Filters retain the shared `ListFilters` composition rather than a modal layout. Clerk-owned authentication remains the documented vendor UI exception.

## Numeric and Date Rules

- Numeric inputs use an explicit `pt-BR` locale independently of the OS/browser language.
- Money fields use a `0.01` step so blur preserves cents.
- Calendar selection closes its popover after updating the field.
- Business calendar dates use `formatter.calendarDate` to preserve the ISO date portion independently of timezone; creation/update timestamps retain `formatter.date`.

## Financial List Filters

- Financial list period shortcuts expose *Todo período*, *Este mês* and *Personalizado*. *Personalizado* opens the shared `DateRangePicker` using the existing calendar styling and Portuguese dates.
- Selecting both boundaries applies the range atomically and closes the popover; clearing resets both boundaries.
- Financial list desktop filters follow the compact list filter pattern; period shortcuts and totals stay in their own row.
- The fee list *Tipo de honorário* filter uses unique revenue-type lookup options and filters by lookup value across contracts.

## Entity Form Context

- `EntityForm` subscribes to the existing app-form context to guard dismissal while dirty or submitting. Its shared discard confirmation preserves drafts; skeletons outside form context retain normal dismissal.
- Financial list APIs use `FinancialQueryPaginatedReturnType` and validate `totalAmount` through `financialTotalsSchema`. Aggregate queries reuse the list's authorized `where` and omit pagination. Never sum only the current page to represent a filtered total.

## Feature Form Hook Pattern

- Forms are built through the shared app-form pattern and then wrapped by feature-local hooks.
- Feature form hooks are the canonical orchestration layer for create and edit behavior.
- The feature form hook selects the active schema, submits the parsed payload to the feature mutation boundary, refreshes caches, drives toast feedback, and hydrates edit defaults from the detail query when needed.
- Form hook options and component props use explicit local interfaces as defined in `CONVENTIONS.md`.
- Validation errors and helper copy are shown in the product locale defined by the domain or product contract.

## Option Queries

- Selectable option query factories mark `meta.refreshOnMutation` as `true`. Audited mutations invalidate these selections as well as their entity and audit queries, so records created in one form become available in subsequent forms without reloading.
- Session queries retain their separate security cache policy.

## Data Hook Rules

- `hooks/use-data.ts` is the canonical feature-local query-consumption boundary for route data, single-entity data, and option data.
- Primary route data hooks use `useSuspenseQuery` so routes consume prefetched data through one consistent suspense-first pattern.
- Equivalent single-entity hooks for details, delete, restore, and edit hydration use `useSuspenseQuery` when the consumer requires the data unconditionally.
- Option hooks live in `hooks/use-data.ts` and return named fields rather than raw React Query result objects.
- Option hooks that require multiple unconditional queries use one `useSuspenseQueries` call.
- If a feature has both unconditional and conditional option concerns, split the hook concerns instead of collapsing the whole feature into an ad hoc query-consumption pattern.
- If a filter/header uses only a subset of a larger option hook, create a narrower hook for that surface rather than prefetching unrelated queries in the route loader.
- Route loaders and first-render suspense hooks must stay aligned: a route that mounts a suspending filter/header on first paint must prefetch the same unconditional queries that the mounted hook consumes.
- Feature-owned components consume feature query data through feature-local hooks in `src/features/<feature>/hooks/use-data.ts` instead of calling TanStack Query hooks directly in render files.
- Feature `api/queries.ts` option factories remain the reusable query boundary for loaders, tests, mutations, and imperative cache access.

## Imperative Query Execution

- Use `queryClient.query(options)` for imperative fetching. Feature option factories own cache policy, including `staleTime: Infinity` where configured.
- Loaders call `queryClient.query(optionsFactory(...))` without overrides.
- Infinite freshness still permits mutation invalidation to refetch active observers. Do not use static freshness for mutable business data.
- Do not use deprecated `fetchQuery` or `ensureQueryData` methods.
- Entity list, detail and dashboard data queries inherit global `QueryClient` cache settings; do not override `staleTime` in those factories or loaders.
- Only lookup and selectable-option queries use `staleTime: Infinity`.
- Session verification keeps its security-specific `staleTime: 0`.

## Why

Currently, filter controls across list routes are inconsistent:
- Routes like `/contratos` and `/pessoas` display inline dropdowns and multiple popovers across the filter bar with tags below.
- Routes like `/contas-a-receber` and `/contas-a-pagar` show a single "Filtros" popover with an inline clear button and no active filter tags.
- `<EntityView.Toggle />` (table vs list toggle) is inconsistently placed or missing across several list headers.

Standardizing on a unified layout—single filter popover/drawer, active filter tags with inline "Limpar tudo", right-aligned (`ml-auto`) view mode toggle, and consistent period shortcut controls—improves visual harmony, responsiveness, and predictability across all entity list views.

## What Changes

- **Single Filter Popover/Drawer Pattern**: Replace scattered inline filter inputs with a unified `<ListFilters.Popover>` (desktop) and `<ListFilters.Drawer>` (mobile) trigger that displays an active filter count badge when filters are applied.
- **Active Filter Chips & Inline Clear**: Standardize `<ListFilters.Active>` below the filter bar across all list routes (`/contratos`, `/pessoas`, `/contas-a-receber`, `/contas-a-pagar`, `/despesas`, `/auditoria`). Active chips allow one-click tag removal, followed by an inline `<ListFilters.Clear>` button.
- **Right-Aligned View Mode Toggle**: Mount `<EntityView.Toggle />` aligned to the end (`ml-auto` / justify-end) of `<ListFilters.Bar>` on all list routes.
- **Consistent Period Shortcuts**: In financial/date-filtered routes (`/contas-a-receber`, `/contas-a-pagar`, etc.), maintain `<FinancialPeriodShortcuts>` on a dedicated sub-bar alongside summary KPIs, reflecting active date selections in tags.

## Non-goals

- Altering entity query schemas, search params validation, or server-side filtering logic.
- Changing permissions or data visibility rules.
- Redesigning pagination or table row renderers.

## User Roles & Multitenancy

- Applies uniformly across all roles (Admin, Member) across all firm tenants. Does not impact multi-tenant isolation or session boundaries.

## Capabilities

### New Capabilities
- `unified-list-filters`: Defines the standardized layout and interaction pattern for list filters, active chips, clear action, view mode toggle placement, and financial period shortcuts across entity listings.

### Modified Capabilities
<!-- None -->

## Impact

- Shared components: `src/shared/components/list-filters.tsx`, `src/shared/components/entity-view.tsx`.
- Feature filter components:
  - `src/features/contracts/components/filter/index.tsx`
  - `src/features/receivables/components/filter/index.tsx`
  - `src/features/payables/components/filter/index.tsx`
  - `src/features/people/components/filter/index.tsx`
  - `src/features/expenses/components/filter/index.tsx`
  - `src/features/audit-logs/components/filter/index.tsx`
- Corresponding test suites for filter components.

## Context

Filter bars currently suffer from visual divergence:
- `/contratos` and `/pessoas` use horizontal inline dropdowns/popovers across `<ListFilters.Bar>` with chips below.
- `/contas-a-receber` and `/contas-a-pagar` use a single popover button with a "Limpar filtros" button on the bar and no active chips below.
- `<EntityView.Toggle />` is either placed directly after popovers, absent, or misaligned.

We are standardizing on a clean 2-tier (or 3-tier for financial) layout:
1. Tier 1: Search + Single Popover `Filtros (n)` + `ml-auto` `<EntityView.Toggle />`.
2. Tier 2: `<ListFilters.Active>` containing individual `<ListFilters.Chip>` and `<ListFilters.Clear>`.
3. Tier 3 (Financial only): `<FinancialPeriodShortcuts>` and summary KPIs.

## Goals / Non-Goals

**Goals:**
- Provide a unified, predictable filter experience across all list views.
- Ensure `<EntityView.Toggle />` is always at the right end (`ml-auto`) of the filter bar.
- Provide `<ListFilters.Active>` tags with instant single-click removal and "Limpar tudo" across all views.
- Update `<ListFilters.Popover>` / `<ListFilters.Drawer>` to support active filter count indicators.
- Refactor `/contratos`, `/contas-a-receber`, `/contas-a-pagar`, `/despesas`, `/pessoas`, and `/auditoria` to follow this structure.

**Non-Goals:**
- Modifying back-end schemas, query options, or URL parameter contracts.
- Changing table column definitions or entity data models.

## Decisions

### Decision 1: Single Popover/Drawer over Inline Fields
- *Decision:* Consolidate secondary filters inside `<ListFilters.Popover>` on desktop and `<ListFilters.Drawer>` on mobile.
- *Rationale:* Inline fields take too much horizontal space and break on viewports < 1440px or entities with 5+ filters. Popovers keep the bar consistent regardless of filter count. Active chips provide immediate visibility of applied filters.
- *Alternatives considered:* Mixed/hybrid (1 primary inline + rest in popover) was rejected due to lack of uniform "primary" definitions across distinct business domains.

### Decision 2: View Mode Toggle aligned right (`ml-auto`)
- *Decision:* Place `<EntityView.Toggle />` at the end of `<ListFilters.Bar>` using `ml-auto`.
- *Rationale:* Separates content manipulation (search, filter) on the left from presentation modes (table, list) on the right. Standard pattern in modern enterprise applications.

### Decision 3: Shared Active Chips & Clear Helper
- *Decision:* Standardize rendering of chips across all feature filters using `<ListFilters.Active>`, `<ListFilters.Chip>`, and `<ListFilters.Clear>`.
- *Rationale:* Ensures keyboard accessibility, clear visual status, and avoids duplicate button controls.

## Risks / Trade-offs

- [Extra click to open popover] → Mitigated by chips allowing direct one-click deletion and search input remaining immediately accessible on the bar.
- [Mobile drawer responsiveness] → `<ListFilters.Drawer>` already adapts gracefully to screen heights with scrollable content.

## ADDED Requirements

### Requirement: Unified list filter bar composition
Every entity list filter bar SHALL render within `<ListFilters.Bar>` containing the search input on the left, a single Popover trigger (or Drawer trigger on mobile) for all secondary filter fields, and `<EntityView.Toggle />` aligned to the end (`ml-auto` / justify-end).

#### Scenario: Desktop filter bar layout
- **WHEN** a user views an entity list on desktop
- **THEN** `<ListFilters.Bar>` renders the text search input, a single `<ListFilters.Popover>` trigger labeled "Filtros", and `<EntityView.Toggle />` on the far right

#### Scenario: Mobile filter bar layout
- **WHEN** a user views an entity list on a mobile viewport
- **THEN** `<ListFilters.Bar>` renders the text search input, a single `<ListFilters.Drawer>` trigger, and omits the desktop-only view toggle

### Requirement: Single filter popover with active filter count badge
The filter trigger button SHALL display the count of currently active non-search filters when greater than zero.

#### Scenario: Active filters present
- **WHEN** one or more secondary filters are active
- **THEN** the filter button displays the active count badge or indicator

#### Scenario: No active secondary filters
- **WHEN** all secondary filters match their default empty state
- **THEN** the filter button displays only the standard "Filtros" label without a count badge

### Requirement: Active filter chips and inline clear action
Whenever any filter (search, secondary criteria, or period) is applied, the filter component SHALL render a `<ListFilters.Active>` container below the bar containing chip badges for each active filter with individual removal triggers, ending with an inline `<ListFilters.Clear>` ("Limpar tudo") button.

#### Scenario: Remove individual filter chip
- **WHEN** a user clicks the remove (`X`) button on a specific filter chip
- **THEN** that specific filter criteria is reset to its default value and the results are updated immediately while preserving all other active filters

#### Scenario: Clear all active filters
- **WHEN** a user clicks "Limpar tudo" in the active tags row
- **THEN** all search, secondary, and date filters are reset to their default values and the active chips row disappears

### Requirement: Financial period shortcuts and summary row
Entity lists with financial or date dimensions SHALL render `<FinancialPeriodShortcuts>` on a separate row below the active chips, accompanied by summary KPI totals.

#### Scenario: Selecting a period shortcut
- **WHEN** a user selects "Este mês" or specifies a custom date range
- **THEN** the date filter is applied, the active date range chip is reflected in `<ListFilters.Active>`, and summary totals recalculate for that period

#### Scenario: Resetting period via shortcut
- **WHEN** a user clicks "Todo período"
- **THEN** `dateFrom` and `dateTo` are cleared and the period chip is removed from the active chips row

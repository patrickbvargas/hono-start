# drilldown-grouped-overview Specification

## Purpose

Provide contextual financial group summaries alongside drilldown records while preserving the selected view and authorized scope.

## Requirements

### Requirement: Contextual grouped overview
Dashboard drilldowns SHALL expose Resumo first and Dados second. Resumo SHALL show the existing total and simultaneous contextual grouping blocks built from the complete authorized selection. Each block SHALL sum row amount and sort totals by absolute magnitude descending while preserving signs with deterministic ties. Clients and employees SHALL group by stable identity, not name. Financial visibility SHALL remain protected.

#### Scenario: Paginated receipts
- **WHEN** receipts span multiple table pages
- **THEN** client, type blocks include all selected rows and Dados retains the current table actions and sorting

#### Scenario: Different financial contexts
- **WHEN** remuneration, expense or result drilldowns open
- **THEN** their blocks respectively show employee/function, category or movement
- **AND** outstanding installment summaries sum outstanding amounts and result preserves signed deductions

#### Scenario: Negative values and homonyms
- **WHEN** groups have negative totals or different client IDs with identical names
- **THEN** -1628 precedes -253 and identical names remain separate groups

#### Scenario: Empty or denied dataset
- **WHEN** no rows exist or the query fails
- **THEN** an explicit empty or error state appears without stale grouped records

### Requirement: Remember drilldown tab
The system SHALL persist the last selected tab in localStorage across drilldowns. Without a valid preference it SHALL open Resumo. Storage failures SHALL NOT prevent switching. Standalone consumers without an overview SHALL retain their existing table-only behavior.

#### Scenario: Reopen after choosing Dados
- **WHEN** a user chooses Dados and opens another dashboard drilldown
- **THEN** Dados is selected and switching back retains table pagination and sorting

#### Scenario: Invalid or unavailable storage
- **WHEN** preference is absent, invalid or unreadable
- **THEN** Resumo is selected and both tabs remain usable

### Requirement: Stable modal layout and contextual loading
The drilldown SHALL keep a fixed height of 80dvh with internal scrolling and a default table page size of 25. Dados SHALL use the shared listing table border and rounded corners. Resumo SHALL NOT group by month. Loading SHALL retain tab controls and the total placeholder, show one borderless block for Dados, and show one grouping skeleton block for expense/result/outflow contexts or two for receipt/remuneration contexts.

#### Scenario: Switch views during loading
- **WHEN** a user switches between Resumo and Dados while records load
- **THEN** the modal height remains stable and the skeleton follows the selected tab and context

#### Scenario: Inspect the table
- **WHEN** the selected dataset exceeds 25 records
- **THEN** Dados paginates in groups of 25 with internal scrolling and the standard listing table appearance

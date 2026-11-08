## ADDED Requirements

### Requirement: Financial Overview Drilldown Interactions
The system SHALL provide interactive drilldown modal views when users click on metric cards, monthly chart series, aging/forecast bars, or monthly cash flow table cells.

#### Scenario: User clicks on a financial metric card
- **WHEN** an authenticated administrator clicks on any of the metric cards (`Saldo Realizado`, `Saldo Projetado`, `Total a Receber`, `Total a Pagar`)
- **THEN** the system opens the drilldown modal displaying the matching financial items
- **AND** the sum of item amounts in the drilldown modal strictly matches the clicked card metric value

#### Scenario: User clicks on monthly cash flow chart series
- **WHEN** the user activates a bar representing realized or projected entries or outputs for a specific month
- **THEN** the drilldown modal opens filtered by that specific month and series
- **AND** the sum of items strictly matches the value represented in that chart bar

#### Scenario: User clicks on breakdown cards (aging, forecast, or expense categories)
- **WHEN** the user activates a bar in the aging, forecast, or expense categories breakdown cards
- **THEN** the drilldown modal opens filtered by the selected bucket or category
- **AND** the sum of items strictly matches the value displayed on the activated breakdown bar

#### Scenario: User clicks on cash flow table cells
- **WHEN** the user clicks on an interactive numeric cell in the Monthly Cash Flow Statement table
- **THEN** the drilldown modal opens filtered by that month and column category (e.g. administrative receipts, judicial receipts, remuneration payments, expense payments, or net balance)
- **AND** the sum of items strictly matches the cell's numeric value

### Requirement: Drilldown Data Presentation and Navigation
The drilldown modal SHALL provide two primary tabs (Registros and Visão Geral), formatted financial values with privacy masking support, and contextual actions to inspect related entity records.

#### Scenario: User inspects the Registros tab
- **WHEN** the drilldown modal is displayed
- **THEN** the Registros tab presents a sorted data table with date, movement kind, description/reference, category/type, sensitive formatted amounts, and row actions
- **AND** clicking a row or selecting view from the context menu opens the detailed overlay for the underlying receivable, payable, or expense

#### Scenario: User inspects the Visão Geral tab
- **WHEN** the user switches to the Visão Geral tab in the drilldown modal
- **THEN** aggregated sub-totals grouped by relevant financial dimensions (such as financial analytic category, revenue type, or client/counterparty) are rendered with bar summaries

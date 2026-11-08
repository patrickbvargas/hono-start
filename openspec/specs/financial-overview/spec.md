# financial-overview Specification

## Purpose
Financial Overview defines the corporate treasury and financial liquidity view, providing realized vs projected cash inflows and outflows.

## Requirements

### Requirement: Dedicated Financial Overview Route
The system SHALL provide an authenticated route `/visao-financeira` under the Financial module displaying firm cash flow and liquidity.

#### Scenario: Administrator opens financial overview route
- **WHEN** an authenticated administrator with `org:financial_overview:read_all` (or fallback `org:cash_flow:read_all`, `org:payables:read_all`) opens `/visao-financeira`
- **THEN** the system renders the financial overview dashboard with realized and projected cash events

#### Scenario: Unauthorized member attempts access
- **WHEN** an authenticated user without financial overview permission opens `/visao-financeira`
- **THEN** the system denies access with an authorization error

### Requirement: Past Realized vs Future Projected Differentiation
The system SHALL distinguish past realized cash flow (receipts and payments) from future projected open titles with reduced visual opacity.

#### Scenario: Rendering cash flow chart with past and projected bars
- **WHEN** the cash flow chart renders data containing past realized months and future projection months
- **THEN** past realized entries and outputs are rendered with standard opacity (100%)
- **AND** future projected entries and outputs are rendered with reduced opacity (between 35% and 50%)

### Requirement: Cash Flow Metric Summary Cards
The system SHALL display summary metric cards for Realized Balance, Projected Future Balance, Total Receivables, and Total Payables.

#### Scenario: User views financial overview metric cards
- **WHEN** the financial overview page loads
- **THEN** cards displaying current realized balance and future projected obligations are visible with their comparative change trends

### Requirement: Monthly Cash Flow Table
The system SHALL provide a monthly cash breakdown table displaying receipts, payments, and resulting balances per month.

#### Scenario: User inspects monthly cash flow table
- **WHEN** an administrator views the monthly cash flow table
- **THEN** the table displays entry breakdown, remuneration payments, expense payments, total outputs, and monthly net balance

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


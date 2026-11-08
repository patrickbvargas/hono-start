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

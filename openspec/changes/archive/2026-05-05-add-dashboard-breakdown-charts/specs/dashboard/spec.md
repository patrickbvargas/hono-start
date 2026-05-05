## MODIFIED Requirements

### Requirement: Dashboard Summaries
The dashboard SHALL show revenue totals, remuneration totals, monthly comparison information, recent activity, and revenue grouping by legal area and revenue type, with supported summaries reflecting the active dashboard period and employee filters.

#### Scenario: Dashboard loads summaries
- **WHEN** dashboard data is available
- **THEN** the system displays high-level totals, current month values, previous month comparisons, recent events, a legal-area revenue chart, and a revenue-type revenue chart

#### Scenario: Dashboard loads filtered summaries
- **WHEN** dashboard filters are active
- **THEN** the system applies the filters consistently to the dashboard datasets whose dates or employee relationships are relevant to the selected filter

#### Scenario: Breakdown charts preserve values
- **WHEN** the dashboard renders legal-area or revenue-type breakdowns
- **THEN** each visualization reflects the same formatted totals and participation percentages returned by the active dashboard summary payload

#### Scenario: No business records match filters
- **WHEN** the dashboard has no matching business records for the active filters
- **THEN** the system displays zero-value summaries and empty-state copy in pt-BR

#### Scenario: No breakdown values exist
- **WHEN** the dashboard summary contains no received revenue for legal-area and revenue-type breakdowns
- **THEN** the system shows pt-BR empty-state copy in both breakdown cards instead of rendering misleading chart segments or bars

#### Scenario: No business records exist
- **WHEN** the dashboard has no matching business records
- **THEN** the system displays zero-value summaries and empty-state copy in pt-BR

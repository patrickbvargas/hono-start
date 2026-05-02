## MODIFIED Requirements

### Requirement: Dashboard Filters
The system SHALL provide URL-driven dashboard filters for period, employee scope, contract legal area, and revenue type while preserving Matrix OS permissions.

#### Scenario: Administrator filters dashboard by period
- **WHEN** an administrator opens the dashboard with `dateFrom` and/or `dateTo`
- **THEN** the system filters date-sensitive dashboard summaries, recent financial activity, and monthly financial evolution to the selected payment-date period within the administrator's firm

#### Scenario: Administrator filters dashboard by employee
- **WHEN** an administrator selects an active employee from the dashboard employee filter
- **THEN** the system narrows employee-sensitive dashboard summaries and monthly financial evolution to data associated with that employee inside the administrator's firm

#### Scenario: Authenticated user filters dashboard by legal area
- **WHEN** an authenticated user selects a valid contract legal area in the dashboard filters
- **THEN** the system limits dashboard revenue-sensitive summaries and monthly financial evolution to matching contracts within the user's allowed firm and role scope

#### Scenario: Authenticated user filters dashboard by revenue type
- **WHEN** an authenticated user selects a valid revenue type in the dashboard filters
- **THEN** the system limits dashboard revenue-sensitive summaries and monthly financial evolution to matching revenues within the user's allowed firm and role scope

#### Scenario: Regular user opens dashboard filters
- **WHEN** a regular user opens the dashboard
- **THEN** the system does not allow the user to expand dashboard data beyond their assigned-contract and own-remuneration visibility

#### Scenario: Regular user submits employee search parameter
- **WHEN** a regular user reaches the dashboard with an `employeeId` search parameter for another employee
- **THEN** the system still returns only dashboard data scoped to the authenticated user's allowed visibility

#### Scenario: Shared filtered dashboard URL is restored
- **WHEN** an authenticated user opens a dashboard URL containing valid filter search parameters for period, employee, legal area, or revenue type
- **THEN** the system restores those filters from the URL and loads dashboard data for the validated filter state

#### Scenario: Invalid dashboard lookup filters are submitted
- **WHEN** a dashboard request includes unknown or cross-firm filter values for employee, legal area, or revenue type
- **THEN** the system does not expose cross-firm or invalid data outside the authenticated session scope

### Requirement: Dashboard Summaries
The dashboard SHALL show revenue totals, remuneration totals, monthly comparison information, recent activity, revenue grouping by legal area and revenue type, and a monthly financial evolution chart, with supported summaries reflecting the active dashboard filters.

#### Scenario: Dashboard loads summaries
- **WHEN** dashboard data is available
- **THEN** the system displays high-level totals, current month values, previous month comparisons, recent events, legal-area revenue grouping, revenue-type grouping, and monthly financial evolution for receitas and remuneracoes

#### Scenario: Dashboard loads filtered summaries
- **WHEN** dashboard filters are active
- **THEN** the system applies the filters consistently to dashboard datasets whose dates, contract areas, revenue types, or employee relationships are relevant to the selected filter

#### Scenario: Dashboard chart spans monthly buckets
- **WHEN** dashboard data is loaded for a period spanning multiple months
- **THEN** the system groups the financial evolution chart by ano e mes
- **AND** the chart exposes separate monthly values for receitas and remuneracoes

#### Scenario: Filtered period contains months without movement
- **WHEN** the selected dashboard period includes one or more months without matching receitas or remuneracoes
- **THEN** the system keeps those months in the financial evolution series with zero values

#### Scenario: No business records match filters
- **WHEN** the dashboard has no matching business records for the active filters
- **THEN** the system displays zero-value summaries, zeroed chart buckets, and empty-state copy in pt-BR

#### Scenario: No business records exist
- **WHEN** the dashboard has no matching business records
- **THEN** the system displays zero-value summaries, zeroed chart buckets, and empty-state copy in pt-BR

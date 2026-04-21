# dashboard Specification

## Purpose
Dashboard defines the authenticated landing experience and summary data shown to firm users after sign-in.

## Requirements
### Requirement: Authenticated Dashboard Landing
The system SHALL render the dashboard on the authenticated home route instead of demo-only content.

#### Scenario: User opens home route
- **WHEN** an authenticated user opens `/`
- **THEN** the system displays dashboard content and does not display the demo form or fake demo pagination

### Requirement: Dashboard Filters
The system SHALL provide URL-driven dashboard filters for period and employee scope while preserving Matrix OS permissions.

#### Scenario: Administrator filters dashboard by period
- **WHEN** an administrator opens the dashboard with `dateFrom` and/or `dateTo`
- **THEN** the system filters date-sensitive dashboard summaries and recent financial activity to the selected payment-date period within the administrator's firm

#### Scenario: Administrator filters dashboard by employee
- **WHEN** an administrator selects an active employee from the dashboard employee filter
- **THEN** the system narrows employee-sensitive dashboard summaries to data associated with that employee inside the administrator's firm

#### Scenario: Regular user opens dashboard filters
- **WHEN** a regular user opens the dashboard
- **THEN** the system does not allow the user to expand dashboard data beyond their assigned-contract and own-remuneration visibility

#### Scenario: Regular user submits employee search parameter
- **WHEN** a regular user reaches the dashboard with an `employeeId` search parameter for another employee
- **THEN** the system still returns only dashboard data scoped to the authenticated user's allowed visibility

#### Scenario: Filtered dashboard URL is shared
- **WHEN** an authenticated user opens a dashboard URL containing valid filter search parameters
- **THEN** the system restores those filters from the URL and loads dashboard data for the validated filter state

### Requirement: Role-Scoped Dashboard Data
Dashboard data MUST respect firm isolation, the session role visibility model, and validated dashboard filters.

#### Scenario: Administrator views dashboard
- **WHEN** an administrator opens the dashboard without an employee filter
- **THEN** the system shows firm-wide operational and financial summaries for the administrator's firm

#### Scenario: Administrator views filtered employee dashboard
- **WHEN** an administrator opens the dashboard with an employee filter for an employee in the same firm
- **THEN** the system shows summaries narrowed to that employee while keeping all data inside the administrator's firm

#### Scenario: Regular user views dashboard
- **WHEN** a regular user opens the dashboard
- **THEN** the system shows only summaries from contracts, fees, revenues, and remunerations visible to that user

#### Scenario: Cross-firm employee filter is submitted
- **WHEN** a dashboard request includes an employee filter for an employee outside the authenticated user's firm
- **THEN** the system does not expose cross-firm data

### Requirement: Dashboard Summaries
The dashboard SHALL show revenue totals, remuneration totals, monthly comparison information, recent activity, and revenue grouping by legal area and revenue type, with supported summaries reflecting the active dashboard period and employee filters.

#### Scenario: Dashboard loads summaries
- **WHEN** dashboard data is available
- **THEN** the system displays high-level totals, current month values, previous month comparisons, recent events, legal-area revenue grouping, and revenue-type grouping

#### Scenario: Dashboard loads filtered summaries
- **WHEN** dashboard filters are active
- **THEN** the system applies the filters consistently to the dashboard datasets whose dates or employee relationships are relevant to the selected filter

#### Scenario: No business records match filters
- **WHEN** the dashboard has no matching business records for the active filters
- **THEN** the system displays zero-value summaries and empty-state copy in pt-BR

#### Scenario: No business records exist
- **WHEN** the dashboard has no matching business records
- **THEN** the system displays zero-value summaries and empty-state copy in pt-BR

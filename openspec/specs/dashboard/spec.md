# dashboard Specification

## Purpose
Dashboard defines the authenticated landing experience and summary data shown to firm users after sign-in.

## Requirements
### Requirement: Authenticated Dashboard Landing
The system SHALL render the dashboard on the authenticated home route instead of demo-only content.

#### Scenario: User opens home route
- **WHEN** an authenticated user opens `/`
- **THEN** the system displays dashboard content and does not display the demo form or fake demo pagination

### Requirement: Role-Scoped Dashboard Data
Dashboard data MUST respect firm isolation and the session role visibility model.

#### Scenario: Administrator views dashboard
- **WHEN** an administrator opens the dashboard
- **THEN** the system shows firm-wide operational and financial summaries for the administrator's firm

#### Scenario: Regular user views dashboard
- **WHEN** a regular user opens the dashboard
- **THEN** the system shows only summaries from contracts, fees, revenues, and remunerations visible to that user

### Requirement: Dashboard Summaries
The dashboard SHALL show revenue totals, remuneration totals, monthly comparison information, recent activity, and revenue grouping by legal area and revenue type.

#### Scenario: Dashboard loads summaries
- **WHEN** dashboard data is available
- **THEN** the system displays high-level totals, current month values, previous month comparisons, recent events, legal-area revenue grouping, and revenue-type grouping

#### Scenario: No business records exist
- **WHEN** the dashboard has no matching business records
- **THEN** the system displays zero-value summaries and empty-state copy in pt-BR

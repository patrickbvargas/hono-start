## MODIFIED Requirements

### Requirement: Dashboard Summaries
The dashboard SHALL show revenue totals, remuneration totals, monthly comparison information, revenue grouping by legal area and revenue type, and a monthly remuneration table by collaborator, with supported summaries reflecting the active dashboard period and employee filters.

#### Scenario: Dashboard loads summaries
- **WHEN** dashboard data is available
- **THEN** the system displays high-level totals, current month values, previous month comparisons, legal-area revenue grouping, revenue-type grouping, and a monthly remuneration table by collaborator
- **AND** the dashboard does not display the recent activity list

#### Scenario: Dashboard loads filtered remuneration table
- **WHEN** dashboard filters are active
- **THEN** the system applies the filters consistently to the monthly remuneration table wherever dates or employee relationships are relevant to the selected filter

#### Scenario: Dashboard remuneration table spans monthly buckets
- **WHEN** dashboard data is loaded for a period spanning multiple months
- **THEN** the system groups remuneration values by collaborator and by ano e mes
- **AND** the table exposes one row per collaborator and one column per month in the selected range

#### Scenario: Filtered period contains months without collaborator movement
- **WHEN** the selected dashboard period includes one or more months without matching remunerations for a collaborator already present in the result
- **THEN** the system keeps those month columns in the table
- **AND** the collaborator row shows zero values for those months

#### Scenario: Dashboard remuneration table includes period total
- **WHEN** the monthly remuneration table is displayed
- **THEN** the system shows a total-in-period value for each collaborator based on the visible monthly buckets

#### Scenario: Dashboard analytical surfaces use shared card wrapper
- **WHEN** the dashboard renders metric cards, charts, or the monthly remuneration table
- **THEN** each analytical surface uses the shared shadcn/ui `Card` component as its outer visual wrapper

#### Scenario: Regular user opens dashboard
- **WHEN** a regular user opens the dashboard
- **THEN** the monthly remuneration table shows only the authenticated user's own scoped remuneration data

#### Scenario: No remuneration records match filters
- **WHEN** the dashboard has no matching remuneration records for the active filters
- **THEN** the system displays zero-value summaries as applicable
- **AND** the monthly remuneration table shows an empty-state message in pt-BR

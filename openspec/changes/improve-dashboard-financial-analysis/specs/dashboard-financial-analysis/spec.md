## ADDED Requirements
### Requirement: Consistent financial analysis
Dashboard SHALL use scheduled installments for expected receipts, include down payments in both comparison bases, show outstanding amounts after partial payments, and expose expense composition, aging, future receipts and client concentration within authorized scope. Firm results SHALL be hidden for dimension filters without allocation. Remunerations SHALL be labeled generated.
#### Scenario: Partial installment
- **WHEN** a scheduled installment of 100 has a recorded payment of 40
- **THEN** outstanding debt is 60 as of a later reference date
#### Scenario: Filtered firm result
- **WHEN** an area, type or collaborator filter is selected
- **THEN** firm expenses and operating result are not presented as allocated results
#### Scenario: Zero comparison base
- **WHEN** prior value is zero
- **THEN** percentage comparison is unavailable instead of fabricated growth

### Requirement: Subject permissions constrain dashboard data
Dashboard access SHALL NOT grant implicit subject access. Unauthorized subject reads MUST not execute or return financial data. Cards, charts and tables MUST match explicit subject read permissions. Combined cash flow MUST require all constituent firm-wide grants and cash-flow permission.
#### Scenario: Expense-only user
- **WHEN** an actor has dashboard access and expenses read but no fee or remuneration read grant
- **THEN** only expense metrics and breakdowns are returned and shown, with no fee or remuneration database reads
#### Scenario: Dashboard-wide actor with own-only remuneration
- **WHEN** the actor selects another employee but holds only own remuneration read
- **THEN** remuneration remains restricted to the authenticated employee

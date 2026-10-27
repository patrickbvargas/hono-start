## MODIFIED Requirements

### Requirement: Role-Scoped Dashboard Data
Dashboard data MUST respect firm isolation, the session role visibility model, and validated dashboard filters.

#### Scenario: Administrator views dashboard
- **WHEN** an administrator opens the dashboard without an employee filter
- **THEN** the system shows firm-wide operational and financial summaries for the administrator's firm
- **AND** the system may include firm-wide cash-flow aggregates derived from honorários, remunerações, and despesas

#### Scenario: Administrator views filtered employee dashboard
- **WHEN** an administrator opens the dashboard with an employee filter for a global employee, with financial results limited to the active Firm
- **THEN** the system shows summaries narrowed to that employee while keeping all data inside the administrator's firm
- **AND** employee-sensitive cash-flow datasets remain narrowed only where the underlying data model supports that relationship

#### Scenario: Regular user views dashboard
- **WHEN** a regular user opens the dashboard
- **THEN** the system shows only summaries from contracts, fees, revenues, and remunerations visible to that user
- **AND** the system does not expose the firm-wide cash-flow surfaces that depend on expense visibility

#### Scenario: Cross-firm employee filter is submitted
- **WHEN** a dashboard request includes an employee filter for an employee outside the authenticated user's firm
- **THEN** the system does not expose cross-firm data

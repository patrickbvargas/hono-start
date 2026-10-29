## ADDED Requirements

### Requirement: Concise financial titles
Receivable and Payable SHALL contain common financial data and enforce one counterparty and one validated origin.

#### Scenario: Direct obligation
- **WHEN** finance creates a direct title with reason, Person and analytic
- **THEN** title is traceable without an artificial operational document

#### Scenario: Foreign Firm
- **WHEN** an origin or counterparty-dependent operation references another Firm title
- **THEN** write is rejected before persistence

### Requirement: Global financial catalogs
Analytics and methods SHALL be company-wide with stable values and inactive selection behavior.

#### Scenario: Existing payroll analytics
- **WHEN** remuneration classification is resolved
- **THEN** PAYROLL_LAWYERS and PAYROLL_STAFF are reused rather than recreated per Firm

### Requirement: Adjustments preserve principal
Authorized title adjustments SHALL require reasons and audit; amount SHALL not fall below principal abated including discounts.

#### Scenario: Increase settled title
- **WHEN** authorized user increases a settled title face value
- **THEN** balance reopens while settlement evidence remains unchanged

#### Scenario: Analytic correction
- **WHEN** authorized user changes analytic after a settlement
- **THEN** reports reclassify without reversal and audit preserves old value

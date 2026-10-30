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

### Requirement: Directional counterparty roles
Receivables SHALL require customer Persons and Payables SHALL require supplier Persons, including employee remuneration. Seeded generic Persons SHALL be eligible only through their respective role and SHALL not impersonate an employee calculation source. Required role removal SHALL be denied while existing obligations depend on it.

#### Scenario: Invalid role
- **WHEN** a receivable is generated or reassigned to a non-customer, or a payable to a non-supplier
- **THEN** server/database reject the write without partial effects

#### Scenario: Consolidated direct obligation
- **WHEN** authorized finance creates a direct title using the appropriate seeded generic customer/supplier
- **THEN** it succeeds with analytic and traceable history without requiring a fake CPF/CNPJ, employee profile or operational document

### Requirement: Counterparty profile foreign keys
Contract customer and Receivable debtor SHALL reference ClientProfile; Expense supplier and Payable beneficiary SHALL reference SupplierProfile. Profiles SHALL reference Person with unique personId and FK restriction. Seed and existing relations SHALL be explicitly remapped; profile IDs SHALL never be silently interpreted as Person IDs.

#### Scenario: Real employee remuneration beneficiary
- **WHEN** a remuneration Payable is created
- **THEN** beneficiary SupplierProfile.personId equals source assignment EmployeeProfile.personId, independently of their profile ID values

#### Scenario: Generic title counterparty
- **WHEN** a direct title uses a seeded documentless generic Person
- **THEN** it references that Person's corresponding ClientProfile or SupplierProfile, without requiring an EmployeeProfile

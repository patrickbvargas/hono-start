## ADDED Requirements

### Requirement: Shared identity
A person SHALL support cumulative customer, supplier and employee roles independently of account permissions.

#### Scenario: Multiple roles
- **WHEN** one Person is both customer and supplier
- **THEN** both workflows reference the same Person without duplicate document or grants

### Requirement: Active collaborator account binding
Every protected session SHALL require a verified Person and active EmployeeProfile regardless of role.

#### Scenario: Inactive profile
- **WHEN** an Admin or Member has an inactive or deleted profile
- **THEN** protected operations deny safely

#### Scenario: Shared person across Firms
- **WHEN** the user switches authorized Organization
- **THEN** Person identity remains stable while operational cache and Firm scope change

### Requirement: Evidence ownership preservation
Contract, Expense and shared Person evidence SHALL preserve owner authorization and audit actor separation.

#### Scenario: Merged identity
- **WHEN** client and collaborator views refer to the same Person
- **THEN** authorized evidence uses global owner policy without exposing other-Firm financial data

### Requirement: Separate contextual registration screens
The frontend SHALL expose separate Clientes, Fornecedores and Colaboradores screens/sidebar items backed by the same Person identity. Collaborator-specific professional fields and percentages SHALL belong to authorized EmployeeProfile management, without duplicating people.

#### Scenario: Multiple roles
- **WHEN** an authorized administrator manages a Person who is both customer and collaborator
- **THEN** both contextual screens reference the same identity/document and only the collaborator management projection exposes professional percentages

#### Scenario: Customer projection
- **WHEN** a Member reads a customer from an assigned contract who is also a collaborator
- **THEN** the response excludes EmployeeProfile, compensation percentages, other role flags and access binding settings

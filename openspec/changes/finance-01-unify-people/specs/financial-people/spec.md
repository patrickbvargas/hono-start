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

### Requirement: Unified contextual person registration
The frontend SHALL expose one Pessoas route/sidebar entry with contextual role/profile fields backed by the same Person identity. Collaborator-specific professional fields and percentages SHALL belong to authorized EmployeeProfile management, without duplicating people.

#### Scenario: Multiple roles
- **WHEN** an authorized administrator manages a Person who is both customer and collaborator
- **THEN** all role-filtered views reference the same identity/document and only the collaborator management projection exposes professional percentages

#### Scenario: Customer projection
- **WHEN** a Member reads a customer from an assigned contract who is also a collaborator
- **THEN** the response excludes EmployeeProfile, compensation percentages, other role flags and access binding settings

### Requirement: Extensible roles and generic seed Persons
Person SHALL support cumulative role checkboxes in one Pessoas route with Papéis filters. Employee SHALL imply supplier, validated at UI/server/database boundaries. Role checkboxes SHALL derive from active profiles and modify them atomically, not independent persisted flags. EmployeeProfile SHALL be optional 1:1 for Person and required for employees/accounts; ClientProfile and SupplierProfile SHALL exist now as independent optional 1:1 role extensions whose FKs enforce counterparty eligibility. Generic Persons SHALL not be employees, profiles or accounts.

#### Scenario: Employee checkbox
- **WHEN** an authorized user marks a real Person as employee
- **THEN** supplier is also selected and cannot be removed while employee remains selected

#### Scenario: Seeded consolidated identities
- **WHEN** seed is executed repeatedly
- **THEN** exactly one Pagamentos diversos supplier and one Recebimentos diversos customer are identified by stable seed keys, generic and without document/profile, without duplicate identities or money

#### Scenario: Ordinary versus generic document
- **WHEN** a non-generic Person omits document or duplicates a normalized existing document
- **THEN** validation rejects; seeded generic Persons may have null document and null fiscal type, never fake numbers

### Requirement: Role profiles as single source of truth
ClientProfile, SupplierProfile and EmployeeProfile SHALL be optional one-to-one extensions of Person using unique personId. Role selection SHALL atomically create/activate the corresponding profile; active employee SHALL require active supplier for the same Person. Stored independent role flags SHALL NOT create a second source of truth. Future bank/address/family extensions SHALL remain out of scope.

#### Scenario: Supplier and employee
- **WHEN** an authorized user marks employee on an ordinary Person
- **THEN** EmployeeProfile and SupplierProfile become valid atomically for that Person and the checkboxes reflect profile state

#### Scenario: Referenced profile removal
- **WHEN** a profile is referenced by an operational document or title
- **THEN** deletion cannot orphan those records; required role deactivation is blocked while open obligations or active employee dependency require it

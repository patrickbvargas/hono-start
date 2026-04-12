## MODIFIED Requirements

### Requirement: Employee lookup option queries return only active rows
The system SHALL return only selectable active lookup rows from option queries used to populate employee type and user role selectors. This selectable-options rule SHALL act as the canonical behavior for lookup-backed entity form options, and lookup option results SHALL remain sorted by `label` ascending.

#### Scenario: Employee type options exclude inactive rows
- **WHEN** the employee type option query is executed
- **THEN** only `EmployeeType` rows with `isActive = true` are returned
- **AND** the results are ordered by `label` ascending

#### Scenario: User role options exclude inactive rows
- **WHEN** the employee role option query is executed
- **THEN** only `UserRole` rows with `isActive = true` are returned
- **AND** the results are ordered by `label` ascending

#### Scenario: Existing records may still reference inactive lookup rows
- **WHEN** an employee already references an `EmployeeType` or `UserRole` that later becomes inactive
- **THEN** the persisted foreign key remains valid
- **AND** the inactive lookup row is still excluded from generic option-query results

#### Scenario: Canonical selectable-options rule is reused by future lookup-backed forms
- **WHEN** a future entity form loads options from a lookup table
- **THEN** the lookup option query follows the same active-only selectable rule established by the employee type and user role selectors

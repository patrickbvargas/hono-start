## MODIFIED Requirements

### Requirement: Employee lookup option queries return all rows
The system SHALL return all employee lookup rows from option queries used to populate employee type and user role selectors. This lookup-options rule SHALL act as the canonical behavior for lookup-backed entity form options, and lookup option results SHALL remain sorted by `label` ascending.

#### Scenario: Employee type options include active and inactive rows
- **WHEN** the employee type option query is executed
- **THEN** all `EmployeeType` rows are returned regardless of `isActive`
- **AND** the results are ordered by `label` ascending

#### Scenario: User role options include active and inactive rows
- **WHEN** the employee role option query is executed
- **THEN** all `UserRole` rows are returned regardless of `isActive`
- **AND** the results are ordered by `label` ascending

#### Scenario: Lookup option payload uses stable value identity
- **WHEN** a lookup-backed form field receives employee type or user role options
- **THEN** each option exposes the lookup row `value` as the field-selection key
- **AND** the option label remains the localized display text

#### Scenario: Existing records may still reference inactive lookup rows
- **WHEN** an employee already references an `EmployeeType` or `UserRole` that later becomes inactive
- **THEN** the persisted foreign key remains valid
- **AND** the inactive lookup row is still returned by the generic option query as a disabled option

#### Scenario: Canonical selectable-options rule is reused by future lookup-backed forms
- **WHEN** a future entity form loads options from a lookup table
- **THEN** the lookup option query returns active and inactive rows
- **AND** inactive rows are rendered as disabled options
- **AND** the field component binds the selected option by lookup `value`

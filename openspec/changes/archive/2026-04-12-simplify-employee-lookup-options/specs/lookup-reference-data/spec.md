## MODIFIED Requirements

### Requirement: Employee lookup option queries return all rows
The system SHALL return all employee lookup rows from option queries used to populate employee type and user role selectors, and the results SHALL remain sorted by `label` ascending. Inactive lookup rows SHALL remain visible in the dataset so persisted historical references can render without feature-specific merge logic.

#### Scenario: Employee type options include active and inactive rows
- **WHEN** the employee type option query is executed
- **THEN** all `EmployeeType` rows are returned regardless of `isActive`
- **AND** the results are ordered by `label` ascending

#### Scenario: User role options include active and inactive rows
- **WHEN** the employee role option query is executed
- **THEN** all `UserRole` rows are returned regardless of `isActive`
- **AND** the results are ordered by `label` ascending

#### Scenario: Inactive lookup rows remain non-selectable in forms
- **WHEN** an employee form renders a lookup row with `isActive = false`
- **THEN** the option is shown in the option list
- **AND** the option is disabled for selection

#### Scenario: Existing records render inactive lookup references without merged options
- **WHEN** an employee already references an `EmployeeType` or `UserRole` that later becomes inactive
- **THEN** the edit form still receives that lookup row from the backend option query
- **AND** the form does not need to synthesize an extra fallback option locally

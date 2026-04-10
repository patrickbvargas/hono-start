## ADDED Requirements

### Requirement: Employee lookup tables store active state
The system SHALL store an `isActive` boolean on global lookup tables used by the employee feature, specifically `EmployeeType` and `UserRole`. The field SHALL default to `true` so existing and newly seeded lookup rows remain active unless explicitly deactivated later.

#### Scenario: Existing lookup rows gain active state during migration
- **WHEN** the database migration adds `isActive` to `employee_types` and `user_roles`
- **THEN** all existing rows are persisted with `isActive = true`
- **AND** future inserts default to `isActive = true`

#### Scenario: Seeded lookup rows remain active
- **WHEN** the seed script upserts the default employee types and user roles
- **THEN** each seeded row is stored with `isActive = true`

### Requirement: Employee lookup option queries return only active rows
The system SHALL return only active lookup rows from option queries used to populate employee type and user role selectors. Lookup option results SHALL remain sorted by `label` ascending.

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

# Spec: lookup-reference-data

## Purpose

Define the global employee lookup reference tables and the option-query behaviour used to populate employee type and user role selectors.

---

## Requirements

### Requirement: Employee lookup tables store active state
The system SHALL store an `isActive` boolean on global lookup tables used by the employee feature, specifically `EmployeeType` and `UserRole`. The field SHALL default to `true` so existing and newly seeded lookup rows remain active unless explicitly deactivated later.

#### Scenario: Existing lookup rows gain active state during migration
- **WHEN** the database migration adds `isActive` to `employee_types` and `user_roles`
- **THEN** all existing rows are persisted with `isActive = true`
- **AND** future inserts default to `isActive = true`

#### Scenario: Seeded lookup rows remain active
- **WHEN** the seed script upserts the default employee types and user roles
- **THEN** each seeded row is stored with `isActive = true`

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

#### Scenario: Existing records may still reference inactive lookup rows
- **WHEN** an employee already references an `EmployeeType` or `UserRole` that later becomes inactive
- **THEN** the persisted foreign key remains valid
- **AND** the inactive lookup row is still returned by the generic option query as a disabled option

#### Scenario: Canonical selectable-options rule is reused by future lookup-backed forms
- **WHEN** a future entity form loads options from a lookup table
- **THEN** the lookup option query returns active and inactive rows
- **AND** inactive rows are rendered as disabled options

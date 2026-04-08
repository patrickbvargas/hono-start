## Requirements

### Requirement: Display employee filter controls
The system SHALL render an `EmployeeFilter` component that exposes controls for searching by name/OAB and filtering by type and role.

#### Scenario: Filter component renders search input
- **WHEN** an authenticated user views the employees page
- **THEN** a text input labeled "Nome ou OAB" is visible
- **AND** the input reflects the current `name` filter value from the URL

#### Scenario: Filter component renders type multi-select
- **WHEN** an authenticated user views the employees page
- **THEN** a multi-select control labeled "Cargo" is visible
- **AND** the available options correspond to all employee types fetched from the server
- **AND** selected values reflect the current `type` filter from the URL

#### Scenario: Filter component renders role multi-select
- **WHEN** an authenticated user views the employees page
- **THEN** a multi-select control labeled "Perfil" is visible
- **AND** the available options correspond to all user roles fetched from the server
- **AND** selected values reflect the current `role` filter from the URL

#### Scenario: onChange emits updated filter values
- **WHEN** the user types in the name/OAB input
- **THEN** the `onChange` callback is called with the updated `name` value and existing type/role values

#### Scenario: onChange updates type selection
- **WHEN** the user selects or deselects a type option
- **THEN** the `onChange` callback is called with the updated `type` array and existing name/role values

#### Scenario: onChange updates role selection
- **WHEN** the user selects or deselects a role option
- **THEN** the `onChange` callback is called with the updated `role` array and existing name/type values

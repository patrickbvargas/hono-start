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

---

### Requirement: Display employee active status filter control
The system SHALL render an active status filter control in the `EmployeeFilter` component that allows filtering the employee list by `isActive` status.

#### Scenario: Filter component renders active status control
- **WHEN** an authenticated user views the employees page
- **THEN** an active status filter control labeled "Status" is visible
- **AND** the available options are "Ativo" and "Inativo"
- **AND** the selected value reflects the current `active` filter from the URL

#### Scenario: Selecting "Ativo" updates the active filter
- **WHEN** the user selects "Ativo" from the status filter
- **THEN** the `onChange` callback is called with `active` set to `"true"`
- **AND** the employee list reloads showing only employees with `isActive = true`

#### Scenario: Selecting "Inativo" updates the active filter
- **WHEN** the user selects "Inativo" from the status filter
- **THEN** the `onChange` callback is called with `active` set to `"false"`
- **AND** the employee list reloads showing only employees with `isActive = false`

#### Scenario: Clearing the status filter shows all employees regardless of isActive
- **WHEN** the user clears the status filter selection
- **THEN** the `onChange` callback is called with `active` set to `""`
- **AND** the employee list reloads showing all non-deleted employees regardless of isActive

#### Scenario: Active status filter state is persisted in URL
- **WHEN** the user applies the status filter
- **THEN** the `active` URL search param is updated to reflect the current selection
- **AND** refreshing the page or sharing the URL preserves the same filter state

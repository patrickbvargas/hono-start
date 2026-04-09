## ADDED Requirements

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

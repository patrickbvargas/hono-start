## Requirements

### Requirement: Display employee filter controls
The system SHALL render an `EmployeeFilter` component that keeps the fullname/OAB search visible in the employees page header and groups the remaining employee filters inside an advanced filters popover.

#### Scenario: Filter component renders search input
- **WHEN** an administrator views the employees page
- **THEN** a search input labeled "Nome ou OAB" is visible without opening any overlay
- **AND** the input reflects the current `name` filter value from the URL

#### Scenario: Filter component renders advanced filters trigger
- **WHEN** an administrator views the employees page
- **THEN** a trigger for advanced filters is visible next to the search input
- **AND** opening that trigger reveals the employee filter controls that are not part of the primary search field

#### Scenario: Filter component renders type multi-select
- **WHEN** an administrator views the employees page
- **THEN** a multi-select control labeled "Cargo" is visible inside the popover
- **AND** the available options correspond to all employee types fetched from the server
- **AND** selected values reflect the current `type` filter from the URL

#### Scenario: Filter component renders role multi-select
- **WHEN** an administrator views the employees page
- **THEN** a multi-select control labeled "Perfil" is visible inside the popover
- **AND** the available options correspond to all user roles fetched from the server
- **AND** selected values reflect the current `role` filter from the URL

#### Scenario: Search input updates employee name filter
- **WHEN** the user types in the "Nome ou OAB" search input
- **THEN** the `name` filter in the URL is updated with the current search value
- **AND** the employee list reloads using that search term against fullname and OAB number

#### Scenario: Popover filter state stays aligned with URL state
- **WHEN** the employee filter state changes through URL navigation or filter updates
- **THEN** reopening the advanced filters popover shows the current `type` and `role` selections from the URL

---

### Requirement: Display employee active status filter control
The system SHALL render the employee active status filter inside the advanced filters popover so users can filter the list by `isActive` without keeping the status control inline in the page header.

#### Scenario: Filter component renders active status control
- **WHEN** an administrator views the employees page
- **THEN** an active status filter control labeled "Status" is visible inside the popover
- **AND** the available options are "Ativo" and "Inativo"
- **AND** the selected value reflects the current `active` filter from the URL

#### Scenario: Selecting "Ativo" updates the active filter
- **WHEN** the user selects "Ativo" from the status filter
- **THEN** the `active` URL search param is updated to `"true"`
- **AND** the employee list reloads showing only employees with `isActive = true`

#### Scenario: Selecting "Inativo" updates the active filter
- **WHEN** the user selects "Inativo" from the status filter
- **THEN** the `active` URL search param is updated to `"false"`
- **AND** the employee list reloads showing only employees with `isActive = false`

#### Scenario: Clearing the status filter shows all employees regardless of isActive
- **WHEN** the user clears the status filter selection
- **THEN** the `active` URL search param is updated to `""`
- **AND** the employee list reloads showing all non-deleted employees regardless of isActive

#### Scenario: Active status filter state is persisted in URL
- **WHEN** the user applies the status filter
- **THEN** the `active` URL search param is updated to reflect the current selection
- **AND** refreshing the page or sharing the URL preserves the same filter state

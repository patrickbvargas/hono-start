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
- **THEN** a multi-select control labeled "Função" is visible inside the popover
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
- **THEN** an active status filter control labeled "Ativo" is visible inside the popover
- **AND** the available options are "Todos", "Ativo", and "Inativo"
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
- **THEN** the `active` URL search param is updated to `"all"`
- **AND** the employee list reloads showing all non-deleted employees regardless of isActive

#### Scenario: Active status filter state is persisted in URL
- **WHEN** the user applies the status filter
- **THEN** the `active` URL search param is updated to reflect the current selection
- **AND** refreshing the page or sharing the URL preserves the same filter state

---

### Requirement: Display employee deletion visibility filter control
The system SHALL render a dedicated deleted-state filter in the employee advanced filters so users can control soft-delete visibility independently from the `isActive` status filter.

#### Scenario: Filter component renders deleted-state control
- **WHEN** an administrator views the employees page
- **THEN** a deleted-state filter control is visible inside the advanced filters
- **AND** the control offers explicit visibility choices for non-deleted records, deleted records, or all records

#### Scenario: Deleted-state control updates URL state independently
- **WHEN** the user changes the deleted-state filter
- **THEN** the URL search params are updated to reflect the new deleted-state visibility
- **AND** the current `active` filter value remains unchanged

#### Scenario: Deleted-state control composes with active status filter
- **WHEN** the user applies both a deleted-state filter and an active status filter
- **THEN** the employee list reloads using both constraints together
- **AND** the result reflects the intersection of soft-delete visibility and `isActive` status

### Requirement: Employee advanced filters indicate active non-default state
The system SHALL visually indicate on the advanced filters trigger when one or more employee filters rendered inside the popover differ from the validated default route search state.

#### Scenario: Employee popover trigger shows active indicator
- **WHEN** an administrator applies type, role, active-state, or deletion-visibility filters through the employee advanced filters popover
- **THEN** the advanced filters trigger shows an active indicator

#### Scenario: Inline search does not activate popover indicator
- **WHEN** an administrator changes only the inline employee search field
- **THEN** the advanced filters trigger remains in its default visual state

#### Scenario: Clearing employee popover filters removes active indicator
- **WHEN** all employee filters controlled by the popover return to their validated default values
- **THEN** the advanced filters trigger removes the active indicator

### Requirement: Reset employee list filters
The system SHALL provide a clear-filters action on the employee filter surface that restores all employee filter fields to the validated default route search state without changing the current sorting fields.

#### Scenario: Clear action becomes available for non-default employee filters
- **WHEN** an administrator changes the inline employee search field or any advanced employee filter away from its validated default value
- **THEN** the employee filter surface exposes an enabled `Limpar filtros` action

#### Scenario: Clear action resets employee filters and first page
- **WHEN** an administrator activates `Limpar filtros` on the employees list
- **THEN** the employee query, type, role, active-state, and deletion-visibility filters return to their validated default values
- **AND** the list reloads from page `1`
- **AND** the current employee sorting fields remain unchanged

#### Scenario: Clear action is inactive at default state
- **WHEN** all employee filters already match their validated default route values
- **THEN** the `Limpar filtros` action does not trigger a list-state change

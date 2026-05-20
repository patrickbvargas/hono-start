## Requirements

### Requirement: Display employee filter controls
The system SHALL render an `EmployeeFilter` component with the shared list-filters pattern, keeping the fullname/OAB search visible in the employees page header while presenting advanced filters through shared responsive surfaces.

#### Scenario: Filter component renders search input
- **WHEN** an administrator views the employees page
- **THEN** a search input labeled "Nome ou OAB" is visible without opening any overlay
- **AND** the input reflects the current `name` filter value from the URL

#### Scenario: Desktop filter surface uses shared advanced filter popovers
- **WHEN** an administrator views the employees page on a desktop-width viewport
- **THEN** a shared advanced-filter surface is visible next to the search input
- **AND** opening that surface exposes employee type, user role, active-state, and deletion-visibility filters

#### Scenario: Mobile filter surface uses shared drawer
- **WHEN** an administrator views the employees page on a mobile-width viewport
- **THEN** the filter surface exposes a shared drawer trigger next to the search input
- **AND** opening that drawer exposes employee type, user role, active-state, and deletion-visibility filters

#### Scenario: Non-default filters appear as removable chips
- **WHEN** an administrator applies a non-default employee query, type, role, active-state, or deletion-visibility filter
- **THEN** the filter surface summarizes each non-default filter as a removable chip
- **AND** removing a chip reapplies the remaining filter state without mutating sorting fields

#### Scenario: Search input updates employee name filter
- **WHEN** the user types in the "Nome ou OAB" search input
- **THEN** the `name` filter in the URL is updated with the current search value
- **AND** the employee list reloads using that search term against fullname and OAB number

#### Scenario: Filter state stays aligned with URL state
- **WHEN** the employee filter state changes through URL navigation or filter updates
- **THEN** reopening the advanced filters surface shows the current `type`, `role`, `active`, and `status` selections from the URL

---

### Requirement: Display employee active status filter control
The system SHALL render the employee active status filter inside the shared advanced filter surfaces so users can filter the list by `isActive` without keeping the status control inline in the page header.

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
The system SHALL visually indicate active non-default employee filters through the shared active-filters area rather than only through a trigger-specific indicator.

#### Scenario: Active filters area appears for non-default employee filters
- **WHEN** an administrator applies type, role, active-state, or deletion-visibility filters
- **THEN** the filter surface shows an active-filters area with removable chips for those selections

#### Scenario: Inline search also appears in active filters area
- **WHEN** an administrator changes the inline employee search field to a non-default value
- **THEN** the search value appears as a removable chip in the active-filters area

#### Scenario: Clearing active chips removes visual non-default state
- **WHEN** all employee filters return to their validated default values
- **THEN** the active-filters area is hidden

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

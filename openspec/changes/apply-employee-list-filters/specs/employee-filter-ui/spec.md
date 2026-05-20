## MODIFIED Requirements

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

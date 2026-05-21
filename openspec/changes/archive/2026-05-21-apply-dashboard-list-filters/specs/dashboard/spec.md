## MODIFIED Requirements

### Requirement: Dashboard Filters
The system SHALL provide URL-driven dashboard filters for period, employee scope, contract legal area, and revenue type while preserving Matrix OS permissions. For administrators, the employee filter SHALL stay visible inline in the dashboard header next to the period shortcut area, while period shortcuts SHALL remain visible inline exactly as they are today and secondary dashboard filters SHALL move to the shared list-filters advanced surface.

#### Scenario: Dashboard header shows period shortcut buttons
- **WHEN** an authenticated user opens the dashboard header
- **THEN** the system shows period shortcut buttons next to the inline collaborator filter area
- **AND** the available shortcuts are `6 meses`, `12 meses`, and `2026`

#### Scenario: Period shortcuts remain inline after filter-surface migration
- **WHEN** the dashboard advanced filters adopt the shared list-filters pattern
- **THEN** the period shortcut buttons remain inline in the dashboard header
- **AND** the shortcuts do not move into popovers or drawers
- **AND** their current click behavior and active-state semantics remain unchanged

#### Scenario: Manual period edit remains available in the advanced filter surface
- **WHEN** an authenticated user opens the dashboard advanced filters surface
- **THEN** the manual `Período de` and `Período até` inputs remain available for free date selection
- **AND** legal-area and revenue-type filters remain available in that same advanced surface

#### Scenario: Administrator employee filter remains inline
- **WHEN** an administrator opens the dashboard header
- **THEN** the collaborator filter remains visible inline outside the advanced filters surface
- **AND** changing only the collaborator filter does not move the control into popovers or drawers

### Requirement: Dashboard advanced filters indicate active non-default state
The system SHALL use the shared list-filters active-filters pattern for dashboard advanced filters while preserving the documented distinction between inline controls and advanced filters.

#### Scenario: Advanced dashboard filters appear as removable chips
- **WHEN** an authenticated user applies a manual period, legal-area, or revenue-type filter through the dashboard advanced filters surface
- **THEN** each non-default advanced filter is summarized as a removable chip below the filter bar

#### Scenario: Inline controls do not become active chips by default
- **WHEN** the authenticated user changes only inline dashboard controls outside the advanced filters surface, such as employee scope or period shortcut buttons
- **THEN** the dashboard does not summarize those inline controls as advanced-filter chips unless a popover- or drawer-controlled filter is also non-default

#### Scenario: Clearing advanced dashboard chips does not alter period shortcuts
- **WHEN** a user removes advanced dashboard filter chips or clears the advanced filter surface
- **THEN** only manual advanced-filter values return to their validated default state
- **AND** the inline shortcut controls remain available in their current position and behavior model

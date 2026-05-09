## ADDED Requirements

### Requirement: Dashboard advanced filters indicate active non-default state
The system SHALL visually indicate on the advanced filters trigger when one or more dashboard filters rendered inside the advanced filters popover differ from the validated default route search state.

#### Scenario: Dashboard popover trigger shows active indicator
- **WHEN** an authenticated user applies a manual period, legal-area, or revenue-type filter through the dashboard advanced filters popover
- **THEN** the advanced filters trigger shows an active indicator

#### Scenario: Inline controls do not activate popover indicator
- **WHEN** the authenticated user changes only inline dashboard controls outside the popover, such as employee scope or period shortcut buttons
- **THEN** the advanced filters trigger remains in its default visual state unless a popover-controlled filter is also non-default

#### Scenario: Returning dashboard popover filters to defaults removes indicator
- **WHEN** all dashboard filters controlled by the popover return to their validated default values
- **THEN** the advanced filters trigger removes the active indicator

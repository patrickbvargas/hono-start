## MODIFIED Requirements

### Requirement: Dashboard Filters
The system SHALL provide URL-driven dashboard filters for period, employee scope, contract legal area, and revenue type while preserving Matrix OS permissions. For administrators, the employee filter SHALL stay visible inline in the dashboard header next to the advanced filters trigger, while secondary dashboard filters remain grouped in the popover.

#### Scenario: Dashboard header shows period shortcut buttons
- **WHEN** an authenticated user opens the dashboard header
- **THEN** the system shows period shortcut buttons next to the inline collaborator filter area
- **AND** the available shortcuts are `6 meses`, `12 meses`, and `2026`

#### Scenario: Current-year shortcut is the default state
- **WHEN** an authenticated user opens the dashboard without overriding `dateFrom` or `dateTo`
- **THEN** the system loads the current-year period by default
- **AND** the `2026` shortcut appears active in the current environment year

#### Scenario: User applies last 6 months shortcut
- **WHEN** an authenticated user clicks the `6 meses` shortcut
- **THEN** the system updates the URL-driven dashboard period to the canonical last-6-month range
- **AND** the dashboard reloads data for that selected period

#### Scenario: User applies last 12 months shortcut
- **WHEN** an authenticated user clicks the `12 meses` shortcut
- **THEN** the system updates the URL-driven dashboard period to the canonical last-12-month range
- **AND** the dashboard reloads data for that selected period

#### Scenario: User returns to current year shortcut
- **WHEN** an authenticated user clicks the `2026` shortcut
- **THEN** the system updates `dateFrom` and `dateTo` to the current-year range
- **AND** the dashboard reloads data for that selected period

#### Scenario: Manual popover period remains available
- **WHEN** an authenticated user opens the advanced filters popover
- **THEN** the manual `Período de` and `Período até` inputs remain available for free date selection

#### Scenario: Manual period edit clears unmatched shortcut state
- **WHEN** an authenticated user changes the dashboard period manually to a range that does not exactly match any shortcut
- **THEN** the system keeps the selected manual dates in the URL
- **AND** the dashboard does not show any shortcut as active

#### Scenario: Shared filtered dashboard URL is restored
- **WHEN** an authenticated user opens a dashboard URL containing valid filter search parameters for period, employee, legal area, or revenue type
- **THEN** the system restores those filters from the URL and loads dashboard data for the validated filter state
- **AND** the matching period shortcut is highlighted only when the restored `dateFrom` and `dateTo` exactly match a supported shortcut range

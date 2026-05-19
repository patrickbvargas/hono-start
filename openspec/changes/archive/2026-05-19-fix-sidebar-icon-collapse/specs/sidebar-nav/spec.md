## MODIFIED Requirements

### Requirement: Collapsed mode shows icons only
When sidebar navigation enters collapsed desktop mode, route labels SHALL be hidden and only route icons SHALL be visible for primary navigation items. Icons SHALL remain visible, aligned, and interactive at all times, while non-essential group text may be hidden.

#### Scenario: Labels hidden in collapsed mode
- **WHEN** the sidebar is in collapsed desktop mode
- **THEN** route title text is not visible
- **AND** each primary navigation item still shows its icon

#### Scenario: Icons remain interactive in collapsed mode
- **WHEN** the sidebar is in collapsed desktop mode
- **THEN** a user can click or focus a route icon to navigate to its route

#### Scenario: Labels visible in expanded mode
- **WHEN** the sidebar is in expanded mode
- **THEN** both icon and title text are displayed for each route item

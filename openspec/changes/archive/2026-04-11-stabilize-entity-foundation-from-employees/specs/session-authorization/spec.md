## ADDED Requirements

### Requirement: Management routes use shared authorization gating before rendering protected UI
The system SHALL evaluate administrator-only management route access through shared authorization helpers before rendering protected management screens.

#### Scenario: Route blocks regular user before rendering employee management UI
- **WHEN** a regular user navigates directly to the employee-management route
- **THEN** the route evaluates the shared authorization helper before rendering the management screen
- **AND** the regular user does not receive the employee-management UI

#### Scenario: Route allows administrator to render employee management UI
- **WHEN** an administrator navigates to the employee-management route
- **THEN** the route evaluates the shared authorization helper
- **AND** the employee-management screen is rendered when access is allowed

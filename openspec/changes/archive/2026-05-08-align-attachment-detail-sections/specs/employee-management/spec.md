## ADDED Requirements

### Requirement: View employee details
The system SHALL allow administrators to inspect employee details without leaving the list workflow.

#### Scenario: Open employee details drawer
- **WHEN** an administrator selects the details action for a visible employee row
- **THEN** the system opens a drawer showing the employee's core fields, account context, financial context, register metadata, and attachment section
- **AND** the list state remains preserved behind the drawer

#### Scenario: Employee details include attachment workflow context
- **WHEN** an administrator opens an employee details drawer
- **THEN** the drawer SHALL include the attachment section for that employee
- **AND** the attachment section SHALL preserve the same detail-drawer section rhythm and skeleton treatment used by the rest of the drawer

#### Scenario: Employee detail access remains administrator-only
- **WHEN** a regular user attempts to access employee detail data or UI directly
- **THEN** the route and server authorization boundaries SHALL reject the operation before employee detail content is returned

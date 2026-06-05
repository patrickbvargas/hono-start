## MODIFIED Requirements

### Requirement: Shared session helpers map authenticated identity to domain actor
The system SHALL map the authenticated Supabase Auth identity to the existing domain session actor shape using the linked employee, firm, role, and employee-type records so downstream authorization and scope decisions remain consistent. Protected session resolution MUST deny access when the linked employee record is missing, inactive, soft-deleted, or no longer marked with enabled access.

#### Scenario: Authenticated identity resolves to domain actor
- **WHEN** a protected route or server function resolves the current authenticated session
- **THEN** the shared session helper returns the linked employee id, firm id, role, and employee type needed by current feature authorization rules

#### Scenario: Missing employee link denies protected access
- **WHEN** an authenticated identity does not resolve to a valid employee record in the same tenant context
- **THEN** protected access is denied safely
- **AND** downstream feature logic does not receive a partial actor

#### Scenario: Disabled employee access denies protected access
- **WHEN** an authenticated Supabase user resolves to an employee whose `isAccessEnabled = false`
- **THEN** protected access is denied safely
- **AND** downstream feature logic does not receive a partial actor

#### Scenario: Inactive or deleted linked employee denies protected access
- **WHEN** an authenticated Supabase user resolves to an employee that is inactive or soft-deleted
- **THEN** protected access is denied safely
- **AND** downstream feature logic does not receive a partial actor

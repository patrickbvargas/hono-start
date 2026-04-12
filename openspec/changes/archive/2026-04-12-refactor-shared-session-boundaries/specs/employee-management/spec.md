## ADDED Requirements

### Requirement: Employee-management uses shared authorization boundaries
The employee-management capability SHALL use the shared session authorization helpers as the authoritative source for admin-only access and firm isolation.

#### Scenario: Route hides admin-only actions for regular users
- **WHEN** a regular user navigates to the employees route
- **THEN** the route evaluates the shared authorization helper for employee-management access
- **AND** admin-only actions such as creating, editing, deleting, and restoring employees are not shown

#### Scenario: Server rejects unauthorized employee mutation
- **WHEN** a regular user attempts to trigger an employee create, update, delete, or restore mutation directly
- **THEN** the server evaluates the shared authorization helper
- **AND** the mutation is rejected even if the client bypasses route-level UI checks

#### Scenario: Server derives employee firm scope from shared session helper
- **WHEN** an employee list query or mutation is executed
- **THEN** the server derives the authoritative `firmId` from the shared server session helper
- **AND** the employee-management capability does not rely on hardcoded tenant placeholders

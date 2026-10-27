## MODIFIED Requirements

### Requirement: List employees
The system SHALL display a paginated, sortable, filterable list of company-wide employees, with current-Firm contract counts, following the shared entity-management list contract.

#### Scenario: Default desktop employees view
- **WHEN** an administrator navigates to the employees route on a desktop-width viewport
- **THEN** the system displays a table whose first column shows the internal employee id
- **AND** the table also shows columns: full name, OAB number, type (Função), remuneration percentage, contract count, role (Perfil), and status
- **AND** the list is paginated with a default page size of 25

#### Scenario: Default mobile employees view
- **WHEN** an administrator navigates to the employees route on a mobile-width viewport
- **THEN** the system displays a paginated list of employee cards instead of the table
- **AND** each card shows the employee id, full name, OAB number, type (Função), remuneration percentage, contract count, role (Perfil), and status
- **AND** the list uses the same URL-driven pagination state as the desktop table

#### Scenario: Card opens employee details
- **WHEN** an administrator activates an employee card in the list surface
- **THEN** the system opens the same employee details drawer used by the table actions
- **AND** the current filters, sorting, and pagination state remain preserved behind the drawer

#### Scenario: Filter by name or OAB number
- **WHEN** a user types a value in the name/OAB search field
- **THEN** the table shows only employees whose full name OR OAB number contains the typed value (case-insensitive)

#### Scenario: Filter by employee type
- **WHEN** a user applies a type filter using one or more employee type lookup values
- **THEN** the table shows only employees whose type matches the selected lookup value set

#### Scenario: Filter by role
- **WHEN** a user applies a role filter using one or more user role lookup values
- **THEN** the table shows only employees whose role matches the selected lookup value set

#### Scenario: Filter by deletion visibility
- **WHEN** a user changes the employee list to show deleted records or all records
- **THEN** the table updates soft-delete visibility without changing the current `isActive` filter

#### Scenario: Sort by column
- **WHEN** a user clicks a sortable column header
- **THEN** the list reloads sorted by that column in ascending order
- **AND** clicking again toggles to descending order

#### Scenario: Sort by internal id
- **WHEN** a user clicks the sortable `#` header in the employees list
- **THEN** the list reloads sorted by employee id in ascending order
- **AND** clicking again toggles to descending order

#### Scenario: Pagination
- **WHEN** a user navigates to page 2
- **THEN** the table shows the next set of employees without reloading the page

#### Scenario: Filter and sort state persisted in URL
- **WHEN** a user applies filters, changes sort, or changes page
- **THEN** the URL search params are updated to reflect the current state
- **AND** lookup-backed filter params use stable lookup values rather than database ids
- **AND** refreshing the page or sharing the URL preserves the same view

#### Scenario: Firm isolation
- **WHEN** the list is loaded
- **THEN** eligible global employees are returned, with contract counts restricted to the current Firm

### Requirement: Administrators can grant initial collaborator access from employee details
The system SHALL allow an actor with the account-management Custom Permission to initiate Clerk-backed invitation/account setup from an active, non-deleted global employee's identity through Clerk administration for the current Organization. Access SHALL require a linked identity and membership with explicitly selected permitted grants. It SHALL NOT issue or reveal an application-generated temporary password.

#### Scenario: Grant initial access
- **WHEN** an authorized actor grants access to an eligible employee
- **THEN** the system initiates Clerk-supported setup/invitation and records a repeatable identity mapping workflow
- **AND** product access remains denied until membership and Employee mapping are valid

#### Scenario: Ineligible target
- **WHEN** the employee is inactive or deleted
- **THEN** access provisioning is rejected before granting membership

### Requirement: Administrators can revoke collaborator access from employee details
The system SHALL allow authorized account managers to remove access to the current firm's organization while preserving the Clerk identity and business history. Revocation SHALL deny subsequent protected requests through current membership checks without requiring webhook delivery. A firm-scoped action SHALL NOT globally ban a user with other organization memberships.

#### Scenario: Revoke firm access
- **WHEN** an authorized actor revokes a global employee's linked account membership in the current Organization
- **THEN** the employee loses current-firm membership access while unrelated memberships and audit history remain intact

#### Scenario: Revoked collaborator no longer appears as access-enabled
- **WHEN** the authorized actor reloads the employee details drawer after revoking access
- **THEN** the access section shows that the collaborator has revoked access
- **AND** the UI exposes `Restaurar acesso` instead of `Revogar acesso`

#### Scenario: Regular user cannot grant or revoke collaborator access
- **WHEN** an actor without the required Clerk permission attempts to trigger grant-access or revoke-access behavior directly
- **THEN** the route and server authorization boundaries reject the operation

### Requirement: Multi-tenancy enforcement on employee queries
Employee master queries and mutations SHALL be company-wide under current Organization membership and employee action grants. Employee type, percentages and lifecycle SHALL be shared. Contract counts and financial summaries SHALL include only current-Firm operations. Shared Employee IDs SHALL NOT grant access to other-Firm operations.

#### Scenario: firmId from session
- **WHEN** any employee query or mutation is executed
- **THEN** the `firmId` is read exclusively from the authenticated session
- **AND** any client-supplied `firmId` is ignored

#### Scenario: Shared employee across authorized branches
- **WHEN** a permitted user reads or modifies a global employee from another authorized branch
- **THEN** the same Employee ID and shared business settings are used
- **AND** other branches' operations remain unavailable in current-Firm summaries

### Requirement: Employee-management uses shared authorization boundaries
The system SHALL use shared Clerk-backed session and permission helpers for employee reads/writes, access provisioning, credential assistance, and lifecycle actions, with current Organization grant checks, global master identity, Firm-scoped operations and no local UserRole-based authority.

#### Scenario: Forged account-management authority
- **WHEN** a client submits role or firm values claiming account-management access
- **THEN** server-derived Clerk grants and firm scope govern the decision and unauthorized access is rejected

#### Scenario: Server derives employee firm scope from shared session helper
- **WHEN** an employee list query or mutation is executed
- **THEN** the server derives the authoritative `firmId` from the shared server session helper
- **AND** the employee-management capability does not rely on hardcoded tenant placeholders

### Requirement: Edit employee (Admin only)
The system SHALL require `org:employees:update` to edit a global Employee under current Organization permissions and preserve existing domain validations, list/detail UX, lifecycle state and audit behavior. Authorization role changes SHALL require `org:accounts:manage` and update Clerk membership through an authorized provider operation rather than a local UserRole foreign key.

#### Scenario: Editing business fields
- **WHEN** an authorized actor edits an employee's business data
- **THEN** local persistence preserves OAB/type/percentage constraints without using local role data as access authority

#### Scenario: Admin opens edit form
- **WHEN** an actor with the required Clerk permission clicks the edit action on an employee row
- **THEN** a modal overlay opens pre-populated with the employee's current data
- **AND** the "Ativo" checkbox reflects the employee's current `isActive` value

#### Scenario: Successful edit
- **WHEN** an actor with the required Clerk permission submits a valid edit form
- **THEN** the system updates the employee record including the `isActive` value
- **AND** the employee type field are loaded from backend option queries that include inactive rows as disabled options
- **AND** the submitted employee type values are stable lookup values resolved by the server before persistence
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the employee row in the list reflects the updated data

#### Scenario: Edit form preserves current inactive lookup values
- **WHEN** an employee already references an inactive employee type
- **THEN** the edit form still shows the persisted lookup value
- **AND** that option is disabled in the selector

#### Scenario: Validation on edit
- **WHEN** an actor with the required Clerk permission submits an edit form with invalid data
- **THEN** the same validation rules as create apply
- **AND** the system enforces the lawyer/admin-assistant OAB rules, OAB format validation, and referral percentage constraint

#### Scenario: Regular user cannot edit
- **WHEN** an actor without the required Clerk permission is authenticated
- **THEN** no edit action is visible on employee rows

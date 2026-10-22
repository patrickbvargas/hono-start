## MODIFIED Requirements

### Requirement: Create employee (Admin only)
The system SHALL allow employee creation only with `org:employees:create` granted by Clerk. Employee creation SHALL preserve existing field validation, active status, firm isolation, audit behavior, modal/hook ownership and shared form boundaries. A local user-role lookup SHALL NOT assign access; provider membership roles SHALL be handled by the separate authorized access flow.

#### Scenario: Authorized employee creation
- **WHEN** an actor with the required Clerk permission submits valid employee data
- **THEN** the system creates the employee in the authenticated firm and refreshes the list with safe pt-BR feedback
- **AND** it does not create permission grants from a submitted local role value

### Requirement: Edit employee (Admin only)
The system SHALL require `org:employees:update` to edit a same-firm Employee and preserve existing domain validations, list/detail UX, lifecycle state and audit behavior. Authorization role changes SHALL require `org:accounts:manage` and update Clerk membership through an authorized provider operation rather than a local UserRole foreign key.

#### Scenario: Editing business fields
- **WHEN** an authorized actor edits an employee's business data
- **THEN** local persistence preserves OAB/type/percentage constraints without using local role data as access authority

### Requirement: Administrators can grant initial collaborator access from employee details
The system SHALL allow an actor with the account-management Custom Permission to initiate Clerk-backed invitation/account setup from an active, non-deleted same-firm employee's details. Access SHALL require a linked identity and membership with explicitly selected permitted grants. It SHALL NOT issue or reveal an application-generated temporary password.

#### Scenario: Grant initial access
- **WHEN** an authorized actor grants access to an eligible employee
- **THEN** the system initiates Clerk-supported setup/invitation and records a repeatable identity mapping workflow
- **AND** product access remains denied until membership and Employee mapping are valid

#### Scenario: Ineligible target
- **WHEN** the employee is inactive, deleted or belongs to another firm
- **THEN** access provisioning is rejected before granting membership

### Requirement: Administrators can revoke collaborator access from employee details
The system SHALL allow authorized account managers to remove access to the current firm's organization while preserving the Clerk identity and business history. Revocation SHALL deny subsequent protected requests through current membership checks without requiring webhook delivery. A firm-scoped action SHALL NOT globally ban a user with other organization memberships.

#### Scenario: Revoke firm access
- **WHEN** an authorized actor revokes a same-firm employee's access
- **THEN** the employee loses current-firm membership access while unrelated memberships and audit history remain intact

### Requirement: Administrators can restore collaborator access without resetting the password
The system SHALL restore same-firm organization membership for an eligible employee through Clerk without resetting credentials, using an explicitly selected authorized role rather than an implicit administrative grant.

#### Scenario: Restore revoked membership
- **WHEN** an authorized actor restores an active, non-deleted employee's access
- **THEN** Clerk membership is re-established with the selected allowed grants and the existing identity/credentials remain usable

### Requirement: Employee-management route is administrator-only
The system SHALL require `org:employees:read` for employee routes/list/detail reads, `org:employees:create` for creation, `org:employees:update` for business-field editing, and independent `org:employees:delete`/`org:employees:restore` for lifecycle operations. Account administration SHALL additionally require `org:accounts:manage` rather than deriving authority from employee CRUD. Administrator SHALL denote an initial role preset rather than an immutable runtime role condition.

#### Scenario: New role has employee-management permission
- **WHEN** a custom Clerk role receives `org:employees:read`
- **THEN** its members can access the route without changing local role comparisons

### Requirement: Employee-management uses shared authorization boundaries
The system SHALL use shared Clerk-backed session and permission helpers for employee reads/writes, access provisioning, credential assistance, and lifecycle actions, with explicit same-firm target checks and no local UserRole-based authority.

#### Scenario: Forged account-management authority
- **WHEN** a client submits role or firm values claiming account-management access
- **THEN** server-derived Clerk grants and firm scope govern the decision and unauthorized access is rejected

### Requirement: Administrators can reset a collaborator password from the employee details screen
The system SHALL replace temporary-password issuance with Clerk-supported account recovery assistance for authorized same-firm account managers. Credentials and reset verification SHALL remain provider-owned and SHALL NOT be returned in employee mutation payloads.

#### Scenario: Account recovery assistance
- **WHEN** an authorized manager requests credential recovery assistance for an eligible linked employee
- **THEN** the system initiates the documented supported Clerk recovery/setup route or presents its documented recovery instructions
- **AND** no temporary password or application-owned forced-change flag is generated

## ADDED Requirements

### Requirement: Provider roles are configurable without local grant tables
The system SHALL obtain assignable organization roles from Clerk through validated feature boundaries and prevent privilege escalation by untrusted inputs. Only authorized account managers SHALL modify memberships/roles, and grant scope SHALL be restricted to the mapped firm and explicitly permitted assignable roles.

#### Scenario: Dashboard changes role grants
- **WHEN** an operator changes a role's permissions in Clerk Dashboard
- **THEN** current server authorization uses those grants without synchronizing a second role-permission matrix into the domain DB

#### Scenario: Unpermitted role assignment
- **WHEN** an actor attempts to assign a role outside their allowed delegation scope
- **THEN** the server denies the change without modifying Clerk membership

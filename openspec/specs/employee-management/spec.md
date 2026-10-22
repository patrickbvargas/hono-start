## Purpose

Define the employee-management capability for firm-scoped employee listing, lifecycle actions, visibility rules, and authorization constraints.
## Requirements

References below to administrators or regular users describe initial role presets, not runtime role-name gates. Clerk Custom Permissions determine access: `org:employees:read`, `org:employees:create`, `org:employees:update`, `org:employees:delete`, and `org:employees:restore` independently gate their respective operations, while account administration requires `org:accounts:manage`. A user with the required grant is authorized regardless of role label; a user without it is denied. Local role/profile display or filtering data SHALL NOT grant capabilities.

### Requirement: List employees
The system SHALL display a paginated, sortable, filterable list of employees belonging to the authenticated administrator's firm, following the shared entity-management list contract.

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
- **THEN** only employees belonging to the authenticated user's firm are returned

### Requirement: isActive field on employee record
The system SHALL store an `isActive` boolean on every employee record, defaulting to `true`. Active status is independent of soft-delete: an employee can be inactive without being deleted, and a soft-deleted employee retains their `isActive` value upon restoration.

#### Scenario: New employee defaults to active
- **WHEN** an administrator creates a new employee without explicitly unchecking the "Ativo" field
- **THEN** the employee record is saved with `isActive = true`

#### Scenario: Administrator creates inactive employee
- **WHEN** an administrator submits the create form with the "Ativo" checkbox unchecked
- **THEN** the employee record is saved with `isActive = false`
- **AND** the employee does not appear in contract team assignment dropdowns

#### Scenario: Administrator toggles active status on edit
- **WHEN** an administrator opens the edit form for an active employee and unchecks "Ativo"
- **THEN** the employee record is updated with `isActive = false`
- **AND** the employee no longer appears in contract team assignment dropdowns

#### Scenario: Administrator restores active status on edit
- **WHEN** an administrator opens the edit form for an inactive employee and checks "Ativo"
- **THEN** the employee record is updated with `isActive = true`
- **AND** the employee becomes available in contract team assignment dropdowns again

#### Scenario: Inactive employee hidden from assignment dropdowns
- **WHEN** any form that lists employees as options is loaded (e.g., contract team assignment)
- **THEN** employees with `isActive = false` are NOT included in the option list
- **AND** employees with `deletedAt != null` are NOT included in the option list

### Requirement: Filter list by isActive status
The system SHALL allow users to filter the employee list by `isActive` status independently of the existing soft-delete status filter.

#### Scenario: Default view shows all non-deleted employees regardless of isActive
- **WHEN** the employee list is loaded with no `active` filter applied
- **THEN** all non-deleted employees (both `isActive = true` and `isActive = false`) are returned
- **AND** the `active` URL param is absent or empty

#### Scenario: Filter by active only
- **WHEN** a user applies the active filter set to "Ativo"
- **THEN** the list shows only employees where `isActive = true` (and not soft-deleted, per default)

#### Scenario: Filter by inactive only
- **WHEN** a user applies the active filter set to "Inativo"
- **THEN** the list shows only employees where `isActive = false` (and not soft-deleted, per default)

#### Scenario: isActive filter composes with existing filters
- **WHEN** a user applies both a type filter and an `isActive` filter simultaneously
- **THEN** the list shows only employees matching both conditions

### Requirement: Create employee (Admin only)
The system SHALL allow employee creation only with `org:employees:create` granted by Clerk. Employee creation SHALL preserve existing field validation, active status, firm isolation, audit behavior, modal/hook ownership and shared form boundaries. A local user-role lookup SHALL NOT assign access; provider membership roles SHALL be handled by the separate authorized access flow.

#### Scenario: Authorized employee creation
- **WHEN** an actor with the required Clerk permission submits valid employee data
- **THEN** the system creates the employee in the authenticated firm and refreshes the list with safe pt-BR feedback
- **AND** it does not create permission grants from a submitted local role value

#### Scenario: Admin opens create form
- **WHEN** an actor with the required Clerk permission clicks the "Novo Funcionário" button
- **THEN** a modal overlay opens with the employee creation form
- **AND** the form includes an "Ativo" checkbox defaulting to checked

#### Scenario: Successful creation
- **WHEN** an actor with the required Clerk permission submits a valid create form
- **THEN** the system creates the employee record scoped to the firm
- **AND** the record stores the `isActive` value from the form
- **AND** the employee type field are loaded from backend option queries that include inactive rows as disabled options
- **AND** the submitted employee type values are stable lookup values resolved by the server before persistence
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the employee list refreshes to include the new record

#### Scenario: Duplicate email
- **WHEN** an actor with the required Clerk permission submits a form with an email already registered in the system
- **THEN** the system rejects the submission
- **AND** an inline error message is shown in Portuguese indicating the email is already in use

#### Scenario: OAB required for lawyers
- **WHEN** the employee type is set to the `LAWYER` lookup value and the OAB field is empty
- **THEN** the form validation SHALL fail with a Portuguese error message

#### Scenario: OAB hidden for admin assistants in the form
- **WHEN** the employee type is set to the `ADMIN_ASSISTANT` lookup value
- **THEN** the OAB field SHALL be hidden or disabled
- **AND** changing the selected type away from `LAWYER` clears the current OAB value in the form

#### Scenario: OAB format validation
- **WHEN** an OAB number is provided
- **THEN** it must match the pattern of 2 uppercase letters followed by 6 digits (e.g., RS123456)
- **AND** if the format is invalid the form shows a Portuguese error message

#### Scenario: Referral percentage constraint
- **WHEN** a referral percentage greater than the remuneration percentage is submitted
- **THEN** the system rejects the submission
- **AND** an inline error in Portuguese is shown

#### Scenario: Regular user cannot create
- **WHEN** an actor without the required Clerk permission is authenticated
- **THEN** the "Novo Funcionário" button is not visible
- **AND** any direct attempt to trigger the create action is rejected

### Requirement: Edit employee (Admin only)
The system SHALL require `org:employees:update` to edit a same-firm Employee and preserve existing domain validations, list/detail UX, lifecycle state and audit behavior. Authorization role changes SHALL require `org:accounts:manage` and update Clerk membership through an authorized provider operation rather than a local UserRole foreign key.

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

#### Scenario: Revoked collaborator no longer appears as access-enabled
- **WHEN** the authorized actor reloads the employee details drawer after revoking access
- **THEN** the access section shows that the collaborator has revoked access
- **AND** the UI exposes `Restaurar acesso` instead of `Revogar acesso`

#### Scenario: Regular user cannot grant or revoke collaborator access
- **WHEN** an actor without the required Clerk permission attempts to trigger grant-access or revoke-access behavior directly
- **THEN** the route and server authorization boundaries reject the operation

### Requirement: Administrators can restore collaborator access without resetting the password
The system SHALL restore same-firm organization membership for an eligible employee through Clerk without resetting credentials, using an explicitly selected authorized role rather than an implicit administrative grant.

#### Scenario: Restore revoked membership
- **WHEN** an authorized actor restores an active, non-deleted employee's access
- **THEN** Clerk membership is re-established with the selected allowed grants and the existing identity/credentials remain usable

### Requirement: Soft-delete employee (Admin only)
Administrators SHALL be able to soft-delete an employee. The employee record is marked inactive but NOT permanently removed.

#### Scenario: Admin initiates delete
- **WHEN** an administrator clicks the delete action on an employee row
- **THEN** a confirmation modal opens asking to confirm the deletion
- **AND** the modal displays the employee's name

#### Scenario: Confirmed deletion
- **WHEN** the administrator confirms the deletion
- **THEN** the system sets `deletedAt` on the employee record
- **AND** the confirmation modal closes
- **AND** a success toast is shown
- **AND** the employee no longer appears in the active list

#### Scenario: Cancelled deletion
- **WHEN** the administrator cancels the confirmation
- **THEN** no change is made and the modal closes

#### Scenario: Deletion blocked by active contract assignments
- **WHEN** an administrator attempts to delete an employee who has active contract assignments with active remunerations
- **THEN** the system rejects the deletion
- **AND** an error toast is shown in Portuguese explaining the reason

#### Scenario: Regular user cannot delete
- **WHEN** a regular user is authenticated
- **THEN** no delete action is visible on employee rows

### Requirement: Restore soft-deleted employee (Admin only)
Administrators SHALL be able to restore a previously soft-deleted employee.

#### Scenario: Admin initiates restore
- **WHEN** an administrator filters the list to show inactive employees and clicks the restore action on an employee row
- **THEN** a confirmation modal opens asking to confirm the restoration

#### Scenario: Confirmed restoration
- **WHEN** the administrator confirms the restoration
- **THEN** the system clears `deletedAt` on the employee record
- **AND** a success toast is shown
- **AND** the employee becomes active again

#### Scenario: Regular user cannot restore
- **WHEN** a regular user is authenticated
- **THEN** no restore action is visible on employee rows

### Requirement: Employee-management route is administrator-only
The system SHALL require `org:employees:read` for employee routes/list/detail reads, `org:employees:create` for creation, `org:employees:update` for business-field editing, and independent `org:employees:delete`/`org:employees:restore` for lifecycle operations. Account administration SHALL additionally require `org:accounts:manage` rather than deriving authority from employee CRUD. Administrator SHALL denote an initial role preset rather than an immutable runtime role condition.

#### Scenario: New role has employee-management permission
- **WHEN** a custom Clerk role receives `org:employees:read`
- **THEN** its members can access the route without changing local role comparisons

#### Scenario: Regular user can still select employees in contract flows
- **WHEN** an actor without the required Clerk permission creates or updates a contract
- **THEN** the system MAY show employee options required for contract team assignment
- **AND** that contract flow does not expose the employee-management screen or employee account details

### Requirement: Multi-tenancy enforcement on employee queries
All employee queries and mutations SHALL be strictly scoped to the authenticated user's firm.

#### Scenario: firmId from session
- **WHEN** any employee query or mutation is executed
- **THEN** the `firmId` is read exclusively from the authenticated session
- **AND** any client-supplied `firmId` is ignored

#### Scenario: Cross-firm access denied
- **WHEN** a user attempts to read or modify an employee belonging to a different firm
- **THEN** the system returns no data (effectively not found) or rejects the mutation

### Requirement: Employee-management uses shared authorization boundaries
The system SHALL use shared Clerk-backed session and permission helpers for employee reads/writes, access provisioning, credential assistance, and lifecycle actions, with explicit same-firm target checks and no local UserRole-based authority.

#### Scenario: Forged account-management authority
- **WHEN** a client submits role or firm values claiming account-management access
- **THEN** server-derived Clerk grants and firm scope govern the decision and unauthorized access is rejected

#### Scenario: Server derives employee firm scope from shared session helper
- **WHEN** an employee list query or mutation is executed
- **THEN** the server derives the authoritative `firmId` from the shared server session helper
- **AND** the employee-management capability does not rely on hardcoded tenant placeholders

### Requirement: Administrators can reset a collaborator password from the employee details screen
The system SHALL replace temporary-password issuance with Clerk-supported account recovery assistance for authorized same-firm account managers. Credentials and reset verification SHALL remain provider-owned and SHALL NOT be returned in employee mutation payloads.

#### Scenario: Account recovery assistance
- **WHEN** an authorized manager requests credential recovery assistance for an eligible linked employee
- **THEN** the system initiates the documented supported Clerk recovery/setup route or presents its documented recovery instructions
- **AND** no temporary password or application-owned forced-change flag is generated

### Requirement: Employee writes preserve the shared form-validation boundary
The system SHALL apply the shared form-validation boundary to employee create and update writes so schema validation, normalization, pure business validation, persistence-aware checks, and lookup-backed server checks remain consistently separated.

#### Scenario: Pure employee business validation is discoverable from canonical rule modules
- **WHEN** a contributor needs to change a pure employee validation rule
- **THEN** the authoritative implementation SHALL be discoverable in `src/features/employees/rules/`
- **AND** exported rule entrypoints SHALL use an `assert...` prefix

#### Scenario: Employee schema uses the canonical rule modules
- **WHEN** the employee create or update schema validates submitted fields
- **THEN** any schema-level refinement for pure business rules SHALL reuse `src/features/employees/rules/`
- **AND** a successful schema parse SHALL mean the submitted payload is valid for the feature's pure employee rules
- **AND** the schema SHALL NOT become the authoritative home of the underlying rule logic

#### Scenario: Persistence-aware checks stay outside pure rule modules
- **WHEN** employee create, update, delete, or restore flows require lookup resolution, current stored-state checks, or active-contract checks
- **THEN** those checks SHALL be enforced through the feature's Prisma-backed write boundary rather than the pure `rules/` modules
- **AND** the pure `rules/` modules SHALL remain database-free

#### Scenario: Employee validation tests are colocated with the feature
- **WHEN** the employee validation boundary is implemented or updated
- **THEN** focused tests SHALL live in feature-local test folders
- **AND** those tests SHALL cover the schema parse boundary plus the canonical employee rule modules

### Requirement: Provider roles are configurable without local grant tables
The system SHALL obtain assignable organization roles from Clerk through validated feature boundaries and prevent privilege escalation by untrusted inputs. Only authorized account managers SHALL modify memberships/roles, and grant scope SHALL be restricted to the mapped firm and explicitly permitted assignable roles.

#### Scenario: Dashboard changes role grants
- **WHEN** an operator changes a role's permissions in Clerk Dashboard
- **THEN** current server authorization uses those grants without synchronizing a second role-permission matrix into the domain DB

#### Scenario: Unpermitted role assignment
- **WHEN** an actor attempts to assign a role outside their allowed delegation scope
- **THEN** the server denies the change without modifying Clerk membership

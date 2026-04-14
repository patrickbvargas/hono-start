## Purpose

Define the employee-management capability for firm-scoped employee listing, lifecycle actions, visibility rules, and authorization constraints.
## Requirements
### Requirement: List employees
The system SHALL display a paginated, sortable, filterable list of employees belonging to the authenticated administrator's firm, following the shared entity-management list contract.

#### Scenario: Default list view
- **WHEN** an administrator navigates to the employees route
- **THEN** the system displays a table with columns: full name, OAB number, type (Função), remuneration percentage, contract count, role (Perfil), and status
- **AND** the list is paginated with a default page size of 25

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

---

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

---

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

---

### Requirement: Create employee (Admin only)
Administrators SHALL be able to create a new employee account with all required fields, including an `isActive` boolean field. Regular users SHALL NOT have access to this action.

#### Scenario: Admin opens create form
- **WHEN** an administrator clicks the "Novo Funcionário" button
- **THEN** a modal overlay opens with the employee creation form
- **AND** the form includes an "Ativo" checkbox defaulting to checked

#### Scenario: Successful creation
- **WHEN** an administrator submits a valid create form
- **THEN** the system creates the employee record scoped to the firm
- **AND** the record stores the `isActive` value from the form
- **AND** the employee type and user role fields are loaded from backend option queries that include inactive rows as disabled options
- **AND** the submitted employee type and user role values are stable lookup values resolved by the server before persistence
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the employee list refreshes to include the new record

#### Scenario: Duplicate email
- **WHEN** an administrator submits a form with an email already registered in the system
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
- **WHEN** a regular user is authenticated
- **THEN** the "Novo Funcionário" button is not visible
- **AND** any direct attempt to trigger the create action is rejected

---

### Requirement: Edit employee (Admin only)
Administrators SHALL be able to edit an existing employee's profile fields, including the `isActive` flag. Regular users SHALL NOT have access to this action.

#### Scenario: Admin opens edit form
- **WHEN** an administrator clicks the edit action on an employee row
- **THEN** a modal overlay opens pre-populated with the employee's current data
- **AND** the "Ativo" checkbox reflects the employee's current `isActive` value

#### Scenario: Successful edit
- **WHEN** an administrator submits a valid edit form
- **THEN** the system updates the employee record including the `isActive` value
- **AND** the employee type and user role fields are loaded from backend option queries that include inactive rows as disabled options
- **AND** the submitted employee type and user role values are stable lookup values resolved by the server before persistence
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the employee row in the list reflects the updated data

#### Scenario: Edit form preserves current inactive lookup values
- **WHEN** an employee already references an inactive type or role
- **THEN** the edit form still shows the persisted lookup value
- **AND** that option is disabled in the selector

#### Scenario: Validation on edit
- **WHEN** an administrator submits an edit form with invalid data
- **THEN** the same validation rules as create apply
- **AND** the system enforces the lawyer/admin-assistant OAB rules, OAB format validation, and referral percentage constraint

#### Scenario: Regular user cannot edit
- **WHEN** a regular user is authenticated
- **THEN** no edit action is visible on employee rows

---

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

---

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

---

### Requirement: Employee-management route is administrator-only
Regular users SHALL NOT be able to access the employee-management screen or employee detail views. Employee visibility for contract team assignment is handled by the contract-management capability and does not grant access to the employee-management feature.

#### Scenario: Regular user is denied employee-management route access
- **WHEN** a regular user navigates to the employees route
- **THEN** the route denies access to the employee-management feature
- **AND** the regular user does not see the employee list, employee filters, or employee detail UI

#### Scenario: Regular user can still select employees in contract flows
- **WHEN** a regular user creates or updates a contract
- **THEN** the system MAY show employee options required for contract team assignment
- **AND** that contract flow does not expose the employee-management screen or employee account details

---

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
The employee-management capability SHALL use the shared session authorization helpers as the authoritative source for admin-only access and firm isolation.

#### Scenario: Route denies employee-management screen for regular users
- **WHEN** a regular user navigates to the employees route
- **THEN** the route evaluates the shared authorization helper for employee-management access
- **AND** access to the employee-management screen is denied

#### Scenario: Server rejects unauthorized employee mutation
- **WHEN** a regular user attempts to trigger an employee create, update, delete, or restore mutation directly
- **THEN** the server evaluates the shared authorization helper
- **AND** the mutation is rejected even if the client bypasses route-level UI checks

#### Scenario: Server derives employee firm scope from shared session helper
- **WHEN** an employee list query or mutation is executed
- **THEN** the server derives the authoritative `firmId` from the shared server session helper
- **AND** the employee-management capability does not rely on hardcoded tenant placeholders

### Requirement: Employee writes preserve the shared form-validation boundary
The system SHALL apply the shared form-validation boundary to employee create and update writes so schema validation, normalization, pure business validation, and lookup-backed server checks remain consistently separated.

#### Scenario: Employee schema uses only pure validation helpers
- **WHEN** the employee create or update schema validates submitted fields
- **THEN** any schema-level refinement uses only pure helpers that do not require Prisma or persisted employee state

#### Scenario: Employee type and role selections are resolved at the server boundary
- **WHEN** an employee create or update mutation receives submitted employee type and user role lookup values
- **THEN** the server resolves those lookup values before persistence
- **AND** lookup activity checks that depend on persisted state execute at the server boundary rather than inside the form schema

#### Scenario: Employee write behavior remains user-friendly after boundary separation
- **WHEN** the server rejects an unknown, inactive, or otherwise disallowed lookup-backed employee write
- **THEN** the mutation returns a user-friendly Portuguese error
- **AND** the separation of responsibilities does not change the documented employee-management behavior

## ADDED Requirements

### Requirement: List employees
The system SHALL display a paginated, sortable, filterable list of employees belonging to the authenticated user's firm.

#### Scenario: Default list view
- **WHEN** an authenticated user navigates to the employees route
- **THEN** the system displays a table with columns: full name, OAB number, type (Função), remuneration percentage, contract count, role (Perfil), and status
- **AND** the list is paginated with a default page size of 25

#### Scenario: Filter by employee type
- **WHEN** a user applies a type filter (e.g., Advogado)
- **THEN** the table shows only employees whose type matches the selected value(s)

#### Scenario: Filter by role
- **WHEN** a user applies a role filter (e.g., Administrador)
- **THEN** the table shows only employees whose role matches the selected value(s)

#### Scenario: Filter by status
- **WHEN** a user applies a status filter (Active or Inactive)
- **THEN** the table shows only employees in that status
- **AND** inactive (soft-deleted) employees are hidden by default unless the filter is set to inactive or all

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
- **AND** refreshing the page or sharing the URL preserves the same view

#### Scenario: Firm isolation
- **WHEN** the list is loaded
- **THEN** only employees belonging to the authenticated user's firm are returned

---

### Requirement: Create employee (Admin only)
Administrators SHALL be able to create a new employee account with all required fields. Regular users SHALL NOT have access to this action.

#### Scenario: Admin opens create form
- **WHEN** an administrator clicks the "Novo Funcionário" button
- **THEN** a modal overlay opens with the employee creation form

#### Scenario: Successful creation
- **WHEN** an administrator submits a valid create form
- **THEN** the system creates the employee record scoped to the firm
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the employee list refreshes to include the new record

#### Scenario: Duplicate email
- **WHEN** an administrator submits a form with an email already registered in the system
- **THEN** the system rejects the submission
- **AND** an inline error message is shown in Portuguese indicating the email is already in use

#### Scenario: OAB required for lawyers
- **WHEN** the employee type is set to Advogado and the OAB field is empty
- **THEN** the form validation SHALL fail with a Portuguese error message

#### Scenario: OAB forbidden for admin assistants
- **WHEN** the employee type is set to Assistente Administrativo
- **THEN** the OAB field SHALL be hidden or disabled

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
Administrators SHALL be able to edit an existing employee's profile fields. Regular users SHALL NOT have access to this action.

#### Scenario: Admin opens edit form
- **WHEN** an administrator clicks the edit action on an employee row
- **THEN** a modal overlay opens pre-populated with the employee's current data

#### Scenario: Successful edit
- **WHEN** an administrator submits a valid edit form
- **THEN** the system updates the employee record
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the employee row in the list reflects the updated data

#### Scenario: Validation on edit
- **WHEN** an administrator submits an edit form with invalid data
- **THEN** the same validation rules as create apply (OAB format, referral percentage constraint, etc.)

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

### Requirement: Read-only employee view (regular users)
Regular users SHALL be able to view a simplified, read-only list of all employees in their firm showing only basic info: full name, type (Função), and OAB number. They SHALL NOT see sensitive fields such as remuneration percentage, referral percentage, email, or role.

#### Scenario: Regular user views list
- **WHEN** a regular user navigates to the employees route
- **THEN** the system displays a read-only table with columns: full name, type (Função), OAB number
- **AND** no create, edit, delete, or restore actions are visible

#### Scenario: Regular user cannot access full employee data
- **WHEN** a regular user is authenticated
- **THEN** the server SHALL NOT return remuneration percentage, referral percentage, email, or role fields to the client for employee list queries

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

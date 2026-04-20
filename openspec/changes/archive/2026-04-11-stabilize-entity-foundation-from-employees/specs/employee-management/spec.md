## MODIFIED Requirements

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
- **WHEN** a user applies a type filter (e.g., Advogado)
- **THEN** the table shows only employees whose type matches the selected value(s)

#### Scenario: Filter by role
- **WHEN** a user applies a role filter (e.g., Administrador)
- **THEN** the table shows only employees whose role matches the selected value(s)

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
- **AND** refreshing the page or sharing the URL preserves the same view

#### Scenario: Firm isolation
- **WHEN** the list is loaded
- **THEN** only employees belonging to the authenticated user's firm are returned

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
- **AND** the selected employee type and user role come from active lookup options only
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
- **AND** any submitted OAB value SHALL be rejected or cleared before persistence

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

### Requirement: Edit employee (Admin only)
Administrators SHALL be able to edit an existing employee's profile fields, including the `isActive` flag. Regular users SHALL NOT have access to this action.

#### Scenario: Admin opens edit form
- **WHEN** an administrator clicks the edit action on an employee row
- **THEN** a modal overlay opens pre-populated with the employee's current data
- **AND** the "Ativo" checkbox reflects the employee's current `isActive` value

#### Scenario: Successful edit
- **WHEN** an administrator submits a valid edit form
- **THEN** the system updates the employee record including the `isActive` value
- **AND** any newly selected employee type and user role come from active lookup options only
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the employee row in the list reflects the updated data

#### Scenario: Validation on edit
- **WHEN** an administrator submits an edit form with invalid data
- **THEN** the same validation rules as create apply
- **AND** the system enforces the lawyer/admin-assistant OAB rules, OAB format validation, and referral percentage constraint

#### Scenario: Regular user cannot edit
- **WHEN** a regular user is authenticated
- **THEN** no edit action is visible on employee rows

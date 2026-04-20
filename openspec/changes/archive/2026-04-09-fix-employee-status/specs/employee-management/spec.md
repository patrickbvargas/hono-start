## ADDED Requirements

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

## MODIFIED Requirements

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
Administrators SHALL be able to edit an existing employee's profile fields, including the `isActive` flag. Regular users SHALL NOT have access to this action.

#### Scenario: Admin opens edit form
- **WHEN** an administrator clicks the edit action on an employee row
- **THEN** a modal overlay opens pre-populated with the employee's current data
- **AND** the "Ativo" checkbox reflects the employee's current `isActive` value

#### Scenario: Successful edit
- **WHEN** an administrator submits a valid edit form
- **THEN** the system updates the employee record including the `isActive` value
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the employee row in the list reflects the updated data

#### Scenario: Validation on edit
- **WHEN** an administrator submits an edit form with invalid data
- **THEN** the same validation rules as create apply (OAB format, referral percentage constraint, etc.)

#### Scenario: Regular user cannot edit
- **WHEN** a regular user is authenticated
- **THEN** no edit action is visible on employee rows

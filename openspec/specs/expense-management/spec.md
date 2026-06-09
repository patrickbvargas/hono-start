# Spec: expense-management

## Purpose

Define firm-scoped expense registration, listing, detail viewing, lifecycle actions, category lookups, and attachment-aware workflows for the `Despesas` feature.

---

## Requirements

### Requirement: List expenses
The system SHALL display a paginated, sortable, filterable list of firm-scoped expenses through the authenticated `/despesas` route, following the shared entity-management list contract and the established overlay workflow.

#### Scenario: Administrator sees expense route
- **WHEN** an administrator navigates to the expenses route
- **THEN** the system displays expense records belonging to the administrator's firm
- **AND** the list preserves the shared URL-driven pagination, filtering, and sorting behavior

#### Scenario: Default desktop expenses view
- **WHEN** an administrator navigates to the expenses route on a desktop-width viewport
- **THEN** the system displays a table whose first column shows the internal expense id
- **AND** the table also shows columns for category, expense date, amount, active state, and created date
- **AND** the default desktop table does not show the full observation text as a primary list column

#### Scenario: Default mobile expenses view
- **WHEN** an administrator navigates to the expenses route on a mobile-width viewport
- **THEN** the system displays a paginated list of expense cards instead of the table
- **AND** each card shows the expense summary fields surfaced by the route list

#### Scenario: Filter by active state
- **WHEN** an administrator applies an active or inactive expense filter
- **THEN** the visible expense list applies the `isActive` constraint independently from the deleted-state filter

#### Scenario: Filter by deletion visibility
- **WHEN** an administrator changes the expenses list to show deleted records or all records
- **THEN** the visible expense list updates soft-delete visibility without changing the current `isActive` filter

#### Scenario: Filter by category
- **WHEN** an administrator applies an expense category filter
- **THEN** the list shows only expenses linked to the selected category value in the authenticated firm

#### Scenario: Filter by expense date range
- **WHEN** an administrator applies `dateFrom` and `dateTo` filters
- **THEN** the list shows only expenses whose expense date falls inside the selected range

#### Scenario: Query by notes
- **WHEN** an administrator enters free text in the expense search field
- **THEN** the list matches expenses whose notes contain the query text

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** an administrator changes sorting, filtering, or page
- **THEN** the URL search params are updated to reflect the current list state
- **AND** refreshing the page preserves the same expense view

#### Scenario: Default sort uses latest expense date first
- **WHEN** an administrator opens the expenses route without custom sorting
- **THEN** the list sorts by expense date in descending order
- **AND** the query appends a stable internal id tiebreaker

### Requirement: View expense details
The system SHALL allow administrators to inspect expense details without leaving the list workflow.

#### Scenario: Open expense details drawer
- **WHEN** an administrator selects the details action for a visible expense row or card
- **THEN** the system opens a drawer showing category, expense date, amount, notes, lifecycle metadata, and attachments
- **AND** the list state remains preserved behind the drawer

#### Scenario: Expense details include attachment workflow context
- **WHEN** an expense details drawer is opened
- **THEN** the drawer SHALL include an `Anexos` section backed by the shared attachment workflow

#### Scenario: Expense details show observation in dedicated section
- **WHEN** an expense details drawer is opened
- **THEN** the drawer shows `Observação` in its own section
- **AND** an empty observation is rendered with the same empty-value treatment used by other entity details

### Requirement: Create expense
The system SHALL allow administrators to create an expense in their own firm using category, expense date, amount, optional notes, and active-state inputs.

#### Scenario: Open create expense form
- **WHEN** an administrator clicks the create-expense action
- **THEN** a modal overlay opens with category, date, amount, observation, and `Ativo` inputs

#### Scenario: Successful expense creation
- **WHEN** an administrator submits a valid expense create form
- **THEN** the system creates the expense in the authenticated administrator's firm
- **AND** the submitted category value is resolved authoritatively by the server
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the expenses list refreshes

#### Scenario: Amount must be positive
- **WHEN** an administrator submits an expense amount less than or equal to zero
- **THEN** the system rejects the submission with a Portuguese validation message

### Requirement: Edit expense
The system SHALL allow administrators to update expense fields within the shared create/edit modal workflow.

#### Scenario: Open edit expense form
- **WHEN** an administrator clicks the edit action for an expense
- **THEN** a modal overlay opens pre-populated with the current expense data

#### Scenario: Successful expense edit
- **WHEN** an administrator submits a valid expense edit form
- **THEN** the system updates the expense record in the authenticated administrator's firm
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the list row and details drawer reflect the updated data

#### Scenario: Edit form preserves inactive current category
- **WHEN** an administrator opens the expense edit form for a record whose current category is inactive
- **THEN** the form still shows the persisted category
- **AND** the inactive current category is visible but disabled

### Requirement: Soft-delete and restore expense
The system SHALL allow administrators to soft-delete and restore expenses through the shared lifecycle workflow.

#### Scenario: Administrator deletes expense
- **WHEN** an administrator confirms deletion for an expense
- **THEN** the system sets `deletedAt` on the expense record
- **AND** the expense no longer appears in the default list view
- **AND** a success toast is shown

#### Scenario: Administrator restores expense
- **WHEN** an administrator confirms restoration for a soft-deleted expense
- **THEN** the system clears `deletedAt`
- **AND** the expense becomes visible again according to the current filters

### Requirement: Expense categories use stable lookup values
The system SHALL expose expense categories through seeded stable lookup values rather than route-local hard-coded identifiers.

#### Scenario: Expense form loads category options
- **WHEN** the expense create or edit form loads
- **THEN** the category field returns seeded expense-category options ordered for display
- **AND** the field binds the selected option by stable lookup `value`
- **AND** the available categories follow the canonical expense-category catalog defined by `lookup-reference-data`

#### Scenario: Inactive category remains visible but disabled
- **WHEN** an existing expense references a category that is no longer active
- **THEN** the edit form still shows the persisted category
- **AND** the inactive category is rendered as disabled rather than omitted

### Requirement: Expense route and mutations derive scope from session
The system SHALL derive tenant scope and authority for expense reads and writes from the authenticated session rather than from client-submitted claims.

#### Scenario: Unauthenticated actor cannot access expense management
- **WHEN** an unauthenticated actor navigates to the expenses route or triggers an expense server function
- **THEN** access is denied before expense data is returned or changed

#### Scenario: Regular user cannot access expense management
- **WHEN** a regular authenticated user navigates to the expenses route or triggers an expense server function
- **THEN** the server rejects access before expense data is returned or changed

#### Scenario: Server derives firm scope from session
- **WHEN** any expense list query, detail query, option query, create, update, delete, or restore mutation is executed
- **THEN** the server derives the authoritative `firmId` from the authenticated session
- **AND** any client-supplied tenant scope is ignored

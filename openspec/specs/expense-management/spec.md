# Spec: expense-management

## Purpose

Define firm-scoped operational expense registration, listing, detail viewing, lifecycle actions, supplier association, workspace tabs, and attachment-aware workflows for the `Despesas` feature prior to financial settlement.

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
- **AND** the table also shows columns for supplier name, registration date (`createdAt`), notes, negotiated amount (`negotiatedAmount`), and row actions
- **AND** supplier document (CPF/CNPJ) is omitted from the table column

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

#### Scenario: Filter by supplier
- **WHEN** an administrator applies a supplier filter
- **THEN** the list shows only expenses linked to the selected `supplierId` in the authenticated firm

#### Scenario: Filter by created date range
- **WHEN** an administrator applies `dateFrom` and `dateTo` filters
- **THEN** the list shows only expenses whose `createdAt` date falls inside the selected range

#### Scenario: Query by notes and supplier
- **WHEN** an administrator enters free text in the expense search field
- **THEN** the list matches expenses whose notes or supplier name contain the query text

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** an administrator changes sorting, filtering, or page
- **THEN** the URL search params are updated to reflect the current list state
- **AND** refreshing the page preserves the same expense view

#### Scenario: Default sort uses latest registration date first
- **WHEN** an administrator opens the expenses route without custom sorting
- **THEN** the list sorts by `createdAt` in descending order
- **AND** the query appends a stable internal id tiebreaker

---

### Requirement: View expense details and workspace
The system SHALL allow administrators to inspect expense details via an overlay drawer and a dedicated full-page workspace route (`/despesas/$expenseId`).

#### Scenario: Open expense details drawer
- **WHEN** an administrator selects the details action for a visible expense row or card
- **THEN** the system opens a drawer showing supplier, negotiated amount, status, notes, attachments, and audit history
- **AND** the drawer footer includes a "Fechar" button to dismiss the drawer
- **AND** supplier CPF/CNPJ is not displayed in the drawer header or overview

#### Scenario: Expense workspace tabs
- **WHEN** an administrator navigates to the expense workspace page
- **THEN** the page displays tabs for `Visão geral`, `Financeiro`, `Anexos`, and `Histórico`
- **AND** the `Financeiro` tab displays an informative empty state banner indicating that financial settlement belongs to the next release phase

---

### Requirement: Create expense
The system SHALL allow administrators to create an expense in their own firm using supplier, negotiated amount, optional notes, and active-state inputs.

#### Scenario: Open create expense form
- **WHEN** an administrator clicks the create-expense action
- **THEN** a modal overlay opens with supplier selector, negotiated amount currency input, notes, and `Ativo` inputs
- **AND** the supplier selector displays supplier names without CPF/CNPJ

#### Scenario: Successful expense creation
- **WHEN** an administrator submits a valid expense create form
- **THEN** the system creates the expense in the authenticated administrator's firm with `negotiatedAmount > 0`
- **AND** an audit log record is created in the same transaction
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the expenses list refreshes

#### Scenario: Amount must be positive
- **WHEN** an administrator submits a negotiated amount less than or equal to zero
- **THEN** the system rejects the submission with a Portuguese validation message

---

### Requirement: Edit expense
The system SHALL allow administrators to update expense fields within the shared create/edit modal workflow.

#### Scenario: Open edit expense form
- **WHEN** an administrator clicks the edit action for an expense
- **THEN** a modal overlay opens pre-populated with the current expense data

#### Scenario: Successful expense edit
- **WHEN** an administrator submits a valid expense edit form
- **THEN** the system updates the expense record in the authenticated administrator's firm
- **AND** an audit log record is created in the same transaction
- **AND** the modal closes
- **AND** a success toast is shown
- **AND** the list row and details drawer reflect the updated data

---

### Requirement: Soft-delete and restore expense
The system SHALL allow administrators to soft-delete and restore expenses through the shared lifecycle workflow.

#### Scenario: Administrator deletes expense
- **WHEN** an administrator confirms deletion for an expense
- **THEN** the system sets `deletedAt` on the expense record
- **AND** an audit log entry is recorded
- **AND** the expense no longer appears in the default list view
- **AND** a success toast is shown

#### Scenario: Administrator restores expense
- **WHEN** an administrator confirms restoration for a soft-deleted expense
- **THEN** the system clears `deletedAt`
- **AND** an audit log entry is recorded
- **AND** the expense becomes visible again according to the current filters

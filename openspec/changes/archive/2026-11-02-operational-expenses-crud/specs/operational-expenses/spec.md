## ADDED Requirements

### Requirement: Operational Expense Data Model & Multitenancy
Every operational expense (`Expense`) MUST belong to a specific firm (`firmId`), be associated with an active supplier (`supplierId` referencing `SupplierProfile`), contain a positive negotiated amount (`negotiatedAmount > 0`), optional notes (`notes <= 5000 chars`), an active flag (`isActive`), and support soft deletion (`deletedAt`). It does NOT store `expenseDate` (which is managed downstream in financial titles) or category lookups.

#### Scenario: Registering a valid expense
- **WHEN** user provides valid `supplierId`, `negotiatedAmount > 0`, optional `notes`, and `isActive`
- **THEN** system saves the expense with `firmId` of the current tenant, initializes `createdAt` and `updatedAt`, and generates an audit log entry.

#### Scenario: Rejecting zero or negative amount
- **WHEN** user submits an expense with `negotiatedAmount <= 0`
- **THEN** system rejects validation with an error message indicating the amount must be greater than zero.

#### Scenario: Inactive or non-existent supplier
- **WHEN** user submits an expense with a `supplierId` that does not exist or is inactive in the database
- **THEN** system blocks creation and returns a domain validation error.

---

### Requirement: Operational Expense Lifecycle & Soft Deletion
Expenses must support updating negotiated amount, supplier, notes, and active status. They must support soft deletion (`deletedAt != null`) and restoration (`deletedAt = null`).

#### Scenario: Soft deleting an expense
- **WHEN** user triggers deletion of an active expense
- **THEN** system sets `deletedAt` to current timestamp, retains attachments and history, and logs the deletion audit event.

#### Scenario: Restoring a deleted expense
- **WHEN** user restores a soft-deleted expense
- **THEN** system clears `deletedAt` and logs the restoration audit event.

---

### Requirement: Operational Expense Listing & Search
The expense list table MUST display supplier details (name and document), negotiated amount, creation date, and status badges. It must support filtering by supplier, active status, soft-delete status, creation date range, amount range, and textual search across supplier name and notes.

#### Scenario: Filtering by supplier and date range
- **WHEN** user filters by a specific supplier and a date range
- **THEN** system queries expenses matching `firmId`, `supplierId`, and `createdAt` between `dateFrom` and `dateTo`.

---

### Requirement: Expense Workspace & Transversals
The expense detail workspace MUST provide an Overview tab with supplier and amount metadata, an Anexos tab for files, an Auditoria tab for audit history, and a Financeiro tab showing linked payables (or an informative placeholder banner if no financial bridge records exist yet).

#### Scenario: Viewing financial tab without payables
- **WHEN** user opens the Financeiro tab for an expense with zero `expensePayables`
- **THEN** system renders an empty state indicating that financial titles are not yet generated.


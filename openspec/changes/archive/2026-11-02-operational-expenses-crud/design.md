## Context

The `Expense` domain model is defined in `prisma/schema.prisma` and `docs/domain/DOMAIN_MODEL.md` as an operational obligation scoped to a firm (`firmId`) and a supplier (`SupplierProfile`). Currently, `src/features/expenses` contains outdated code that expects `ExpenseCategory`, `expenseDate`, and `amount`, causing compilation failures across the feature.

## Goals / Non-Goals

**Goals:**
- Provide complete operational CRUD for `Expense` (Create, Read/List, Update, Delete/Restore).
- Integrate active `SupplierProfile` selector with `Person` details (`fullName`, `document`).
- Use `negotiatedAmount` (Decimal 14,2) with currency formatting and positive validation.
- Date filtering in list table based on `createdAt`.
- Multi-tab Workspace: Overview, Financeiro (read-only empty state banner), Anexos, Auditoria.
- Ensure strict multi-tenant filtering by `firmId` and persist audit logs for all mutations.
- Fix all TypeScript errors and Vitest tests in `src/features/expenses`.

**Non-Goals:**
- Financial settlement / bridge generation (`ExpensePayable` and `Payable` generation is deferred to the future financial engine module).
- Modifying Prisma schema (Option A chosen: no new date column added to `Expense`).

## Decisions

1. **Option A for Expense Dates**:
   - `Expense` does not store a custom `expenseDate`. The date displayed and filtered in operational views is `createdAt`. Future payment due dates will reside on `Payable` titles.
2. **Supplier Lookup**:
   - Query `SupplierProfile` joined with `Person` where `supplier.isActive = true` and `person.deletedAt is null`. Return options as `{ value: supplier.id, label: person.fullName, description: person.document }`.
3. **Financial Tab Presentation**:
   - In `ExpenseWorkspace`, keep the `Financeiro` tab active. Query linked payables through `expensePayables`. When empty, render an informative alert explaining that financial generation belongs to the next release phase.
4. **Data Layer Contract**:
   - Model schemas (`ExpenseDetail`, `ExpenseSummary`) will expose numeric `negotiatedAmount` (converted from Prisma Decimal) and formatted supplier data.
   - Mutations will enforce tenant isolation (`firmId`), validate supplier existence and active state, and record `AuditLog` events.

## Risks / Trade-offs

- *Search Performance*: Filtering by supplier full name requires querying relations; indexed appropriately via `supplierId` and `Person` indices.
- *Financial Bridge Transition*: When the financial engine is later implemented, the Financial tab will seamlessly render the generated `ExpensePayable` titles without altering the operational CRUD contracts.


## Why

The current `src/features/expenses` implementation is based on a legacy schema (`ExpenseCategory`, `expenseDate`, `amount`) that no longer exists in Prisma schema. In the canonical domain model, `Expense` represents a firm-scoped operational cost obligation tied to a supplier (`SupplierProfile`), with `negotiatedAmount`, `notes`, `isActive`, and soft deletion (`deletedAt`). The codebase currently fails typechecking because of this schema divergence.

We need to implement the complete operational CRUD for expenses matching the canonical Prisma schema and domain contracts, keeping the financial bridge (`ExpensePayable` / `Payable`) scoped for future implementation while maintaining a read-only/placeholder state for the financial tab.

## What Changes

- Rebuild `src/features/expenses/schemas`:
  - `model.ts`: align `ExpenseDetail` and `ExpenseSummary` with `supplierId`, `supplier` (`fullName`, `document`), `negotiatedAmount`, `notes`, `isActive`, `deletedAt`, `createdAt`, `updatedAt`.
  - `form.ts`: replace category with `supplierId` and amount with `negotiatedAmount`.
  - `filter.ts` & `search.ts`: filter by `supplierId`, `status`, `active`, search query (supplier name / notes), date range based on `createdAt`.
- Update `src/features/expenses/data`:
  - `queries.ts`: implement `getExpenses`, `getExpenseById`, `getSuppliersOptions` (from active `SupplierProfile` joined with `Person`), and financial totals calculation using `negotiatedAmount`.
  - `mutations.ts`: rewrite `createExpense`, `updateExpense`, `deleteExpense`, `restoreExpense` to use `supplierId`, `negotiatedAmount`, and record audit logs.
- Update `src/features/expenses/components`:
  - `table/columns.tsx`: show supplier name, document, negotiated amount, creation date, status badge, action menu.
  - `form/index.tsx`: supplier dropdown (from active `SupplierProfile`), negotiated amount currency input, notes textarea, active switch.
  - `filter/index.tsx`: supplier filter select, active/deleted status filters, search input, date range filters.
  - `details/overview.tsx`: display supplier info, negotiated amount, timestamps, status.
  - `workspace/index.tsx`: preserve Overview, Financeiro (read-only empty state / linked payables preview), Anexos, and Auditoria tabs.
- Fix and expand tests in `src/features/expenses/__tests__` to ensure full coverage and 100% pass rate.

## Capabilities

### New Capabilities
- `operational-expenses`: Operational management of firm expenses, linking obligations to suppliers with negotiated amounts, notes, soft-deletion lifecycle, attachments, and audit trails.

### Modified Capabilities

## Impact

- `src/features/expenses/*`: Completely updated to match canonical Prisma schema and remove legacy `ExpenseCategory` dependencies.
- `src/routes/_app/despesas.tsx` & `src/routes/_app/despesas_.$expenseId.tsx`: Route integration updated to match new schemas and loader requirements.
- Resolves all TypeScript compilation errors originating from `src/features/expenses`.


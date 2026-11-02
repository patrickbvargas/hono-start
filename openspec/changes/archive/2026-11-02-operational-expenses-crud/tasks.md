## 1. Schemas & Rules

- [x] 1.1 Update `src/features/expenses/schemas/model.ts` with canonical `ExpenseDetail` and `ExpenseSummary` models (supplierId, supplier info, negotiatedAmount).
- [x] 1.2 Update `src/features/expenses/schemas/form.ts` with `expenseCreateInputSchema` and `expenseUpdateInputSchema` replacing category with supplierId and amount with negotiatedAmount.
- [x] 1.3 Update `src/features/expenses/schemas/filter.ts` and `src/features/expenses/schemas/search.ts` to support supplier filtering, date range (createdAt), and text search.
- [x] 1.4 Update `src/features/expenses/rules/lookups.ts`, `rules/write.ts`, and `constants/errors.ts` for supplier validation and positive amount checks.

## 2. Data Layer & API

- [x] 2.1 Update `src/features/expenses/data/queries.ts` with `getExpenses`, `getExpenseById`, `getSuppliersOptions`, and `getExpensesFinancialTotals`.
- [x] 2.2 Update `src/features/expenses/data/mutations.ts` with `createExpense`, `updateExpense`, `deleteExpense`, and `restoreExpense` including audit logging.
- [x] 2.3 Update `src/features/expenses/api/queries.ts` and `api/mutations.ts` query options and hooks.

## 3. UI Components & Routes

- [x] 3.1 Update `src/features/expenses/components/table/columns.tsx` and `table/index.tsx` to display supplier name/document, negotiated amount, creation date, and status.
- [x] 3.2 Update `src/features/expenses/components/form/index.tsx` to provide supplier select and negotiated amount input.
- [x] 3.3 Update `src/features/expenses/components/filter/index.tsx` to include supplier options and date range.
- [x] 3.4 Update `src/features/expenses/components/details/overview.tsx` and `workspace/index.tsx` with Overview info and Financeiro empty state banner.
- [x] 3.5 Update routes `src/routes/_app/despesas.tsx` and `src/routes/_app/despesas_.$expenseId.tsx` to use supplier options and updated query options.

## 4. Verification & Testing

- [x] 4.1 Update all unit tests in `src/features/expenses/__tests__` to match new schemas, queries, and mutations.
- [x] 4.2 Run `pnpm test src/features/expenses` and ensure all tests pass.
- [x] 4.3 Verify typecheck and code style without errors.

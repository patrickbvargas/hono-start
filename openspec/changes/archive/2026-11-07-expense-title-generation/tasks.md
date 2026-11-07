## 1. Shared generation flow

- [x] 1.1 Reuse the generation form, schema and hook for revenue and expense sources; authorize direction-specific options.

## 2. Expense financial workspace

- [x] 2.1 Add a protected financial query and validated model with exact balances, reversals and cancelled titles. No DB migration required.
- [x] 2.2 Replace the placeholder with summary, generation overlay and expandable installments; refresh after generation.
- [x] 2.3 Align the canonical expense user flow documentation.

## 3. Verification

- [x] 3.1 Cover expense submission, financial query authorization, balances and workspace states with focused Vitest tests; run revenue regression tests.
- [x] 3.2 Run pnpm check and npx tsc --noEmit; resolve introduced errors and review the diff.

## 4. Financial card follow-ups

- [x] 4.1 Restore shared financial status chips on revenue and expense card headers, with permission and business-date checks; correct contract principal balances and entry status.
- [x] 4.2 Add concise balance tooltips for receivable and payable card labels and cover keyboard focus.
- [x] 4.3 Add and execute a safe repeatable expense-generation demo seed; preserve existing financial history.

## Validation evidence

- Final focused verification: 23 suites and 166 tests passed, covering expenses, financial-titles, contract queries/status/cards and shared entity details, including both balance tooltips.
- `openspec validate expense-title-generation --strict`: passed.
- `pnpm check`: passed; unrelated line-ending-only formatting was restored afterward.
- `npx tsc --noEmit`: blocked by 125 pre-existing errors in unrelated modules. An isolated HEAD snapshot using the same generated Prisma client produces the exact same 125 diagnostic lines; no new diagnostics remain.
- No database migration, live payment writes or deployment performed. Authenticated browser verification remains a manual follow-up.
- `pnpm db:seed:expense` executed twice: fixture expenses 4 (Matriz) and 5 (POA), each R$ 1.000,00 without titles; rerun preserved the same available records.
- Specs synchronized to `openspec/specs/expense-payable-generation/spec.md` before archive on 2026-11-07. The unrelated incomplete `decouple-financial-bridge-schema` change remains active.

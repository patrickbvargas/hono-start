## Context

The system has decoupled `Receivable` and `Payable` titles from operational foreign keys, introducing explicit bridge tables `ContractRevenueReceivable` and `ExpensePayable`.

To transition from the operational context into the financial core, the backend must support:
1. Operational Settlement Generation: Turning an agreed contract `Revenue` into one or more `Receivable` titles, linked via `ContractRevenueReceivable`.
2. Operational Expense Settlement: Turning an approved `Expense` into one or more `Payable` titles, linked via `ExpensePayable`.
3. Direct Manual Titles: Creating standalone `Receivable` (debtor: `ClientProfile`) or `Payable` (beneficiary: `SupplierProfile`) records without bridge connections.

All must respect the closure balance equation: $\sum \text{titles} = \text{negotiatedAmount}$ and ensure multi-tenant isolation by `Firm`.

## Goals / Non-Goals

**Goals:**
- Provide typed data layer and mutations to generate pure titles (`Receivable` / `Payable`) from `Revenue` and `Expense`.
- Provide typed data layer and mutations for direct manual titles.
- Enforce strict closure balance invariant in transactional boundaries.
- Record structured audit logs in the same atomic transaction.
- Comprehensive unit and integration tests.

**Non-Goals:**
- Implementing financial UI routes, lists, or drilldown views (deferred to subsequent changes).
- Implementing settlements/receipts/payments ($C = P - D + J + M$) or remuneration calculation engine (deferred to subsequent changes).

## Decisions

### 1. Package Location
Place title generation in the dedicated feature module `src/features/financial-titles`, following the documented slice responsibilities:
- Schemas: `src/features/financial-titles/schemas/form.ts`
- Rules: `src/features/financial-titles/rules/balance.ts`, `counterparty.ts`
- Data mutations: `src/features/financial-titles/data/mutations.ts`
- API server functions: `src/features/financial-titles/api/mutations.ts`

The public `index.ts` exposes the four mutation option factories and `RevenueGenerationForm`. Schemas, rules, data mutations, query internals and server handlers stay internal. Feature-owned `api/queries.ts`, `data/queries.ts` and `hooks/use-data.ts` provide protected catalog options; `hooks/use-form.ts` owns preview updates, submission and cache refresh.

### Contract generation interface

Contract workspace and contextual details open the same generation modal through the existing overlay pattern. Legacy Fee creation and its "Registrar recebimento" action are removed from these contract surfaces. Settlement remains a separate financial workflow.

The compact schedule collects optional down payment/date, installment count, first due date, analytic category and expected method. Changes rebuild an editable table automatically; direct row edits remain until schedule parameters change. Integer cents preserve exact division and monthly dates clamp to each month's last day. Invalid/incomplete parameters clear stale preview rows. A live amber/green chip reports divergent/exact closure with text and icons.

The additive `db:seed:contract` command requires the demo seed marker and creates identifiable R$ 1,000 contracts with team and unbridged revenue in demo Firms 1 and 2. Reruns preserve existing contracts, titles and history; it never resets the database. The main demo seed includes the same fixtures.

Single-selection autocomplete clears to an empty string, preserving its scalar contract. Financial title validation uses safe pt-BR messages for missing/invalid field values.

Authenticated API wrappers pass the middleware's trusted session into data mutations, following the existing Person write pattern. Data mutations reparse input, derive `firmId` and audit actor Person ID from that session, and enforce resource authorization against persisted state inside the write transaction. API wrappers log infrastructure failures and return only safe pt-BR error messages.

Inputs use positive numeric amounts with at most two decimal places and the `Decimal(14,2)` storage limit. Arithmetic converts their decimal string representations into `Prisma.Decimal`. Dates use validated `YYYY-MM-DD` strings, persisted at UTC midnight. Lookup selections use stable `analytic` and `expectedPaymentMethod` values, resolved to active catalog IDs in the data layer. Counterparty checks require both the global profile and its non-deleted Person to be active.

### 2. Closure Balance Lock
Before writing to the database:
$$\sum_{i=1}^N \text{title.amount}_i == \text{operational.negotiatedAmount}$$
Values are compared using `Prisma.Decimal` to avoid floating-point inaccuracies. If the delta is non-zero, reject with `CLOSURE_BALANCE_MISMATCH`.

### 3. Title Kind Handling
Use Prisma native enum `TitleKind`:
- `DOWN_PAYMENT`: Initial payment (entrada)
- `INSTALLMENT`: Regular term installment (parcela)
- `EXTRA`: Ad-hoc or supplementary installment (extra/custas)

### 4. Bridge Linking
- `ContractRevenueReceivable`: Requires `firmId`, `contractId`, `revenueId`, `receivableId`.
- `ExpensePayable`: Requires `firmId`, `expenseId`, `payableId`.
- Every bridge entry is created in the exact same `prisma.$transaction` as the titles.

### 5. Multi-Tenant Scope & Permissions
- Scope is strictly derived from session `firmId`.
- Permissions:
  - Contract revenue generation: (`org:contracts:update_all` or `org:contracts:update_assigned`) + `org:receivables:generate`.
  - Expense payable generation: (`org:expenses:create` or `org:expenses:update`) + `org:payables:generate`.
  - Direct titles: `org:receivables:create`, `org:payables:create`.

Generation uses the existing distinct `generate` grants so authorized Members can confirm contract financial plans without receiving permission for direct manual titles. The Member grant boundary permits `org:receivables:generate`; it continues denying direct title creation and all payable generation. Role alone never grants generation or operational write access.

## Risks / Trade-offs

- **Risk**: Repeated generation calls for the same `Revenue` or `Expense`.
  - **Mitigation**: Lock the source row before reading its negotiated amount and checking bridges (`SELECT ... FOR UPDATE` inside the transaction; revenue generation also locks its contract). Reject any existing bridge, including cancelled title history. Regeneration requires a separate explicit reconciliation workflow and is not implemented here. This prevents simultaneous requests from creating duplicate plans without adding persistent batch entities.
- **Risk**: Floating point rounding issues when splitting into $N$ installments.
  - **Mitigation**: Enforce that the user-submitted plan sums exactly to cents, with validation on both frontend schema and backend domain service.

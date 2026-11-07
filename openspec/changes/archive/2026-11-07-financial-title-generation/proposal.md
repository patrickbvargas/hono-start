## Why

The canonical domain model (`docs/domain/DOMAIN_MODEL.md`, `docs/domain/FINANCIAL_SYSTEM.md`, `docs/domain/BUSINESS_RULES.md`) establishes that financial titles (`Receivable` and `Payable`) are strictly agnostic of operational entities and connect to `Contract` / `Revenue` / `Expense` exclusively via bridge tables (`ContractRevenueReceivable`, `ExpensePayable`).

Now that the database schema and triggers are decoupled and the operational context (`Person`, `Contract`, `Expense`) is verified, we need server-side mutations, schemas and invariants to generate financial titles from revenues and expenses and create direct unbridged titles. Contract details and workspaces provide an automatic, editable installment preview and title-generation confirmation, replacing legacy Fee creation on those surfaces.

## What Changes

- **Contract Revenue Bridge Generation (`revenue-receivable-generation`)**:
  - Service and server function to generate `Receivable` titles from an active `Revenue`.
  - Enforce closure balance constraint: $\sum \text{title amounts} == \text{revenue.negotiatedAmount}$ down to the exact cent.
  - Set debtor (`ClientProfile`), analytic category, payment method, kind (`DOWN_PAYMENT`, `INSTALLMENT`, `EXTRA`), due dates, and amount.
  - Atomically persist `Receivable` records and link them via `ContractRevenueReceivable`.
  - Transactional audit log recording.

- **Expense Bridge Generation (`expense-payable-generation`)**:
  - Service and server function to generate `Payable` titles from an active `Expense`.
  - Enforce closure balance constraint: $\sum \text{title amounts} == \text{expense.negotiatedAmount}$ down to the exact cent.
  - Set beneficiary (`SupplierProfile`), analytic category, payment method, kind (`DOWN_PAYMENT`, `INSTALLMENT`, `EXTRA`), due dates, and amount.
  - Atomically persist `Payable` records and link them via `ExpensePayable`.
  - Transactional audit log recording.

- **Direct Manual Title Creation (`direct-title-creation`)**:
  - Service and server function to create unbridged `Receivable` (debtor: `ClientProfile`) and `Payable` (beneficiary: `SupplierProfile`).
  - Mandatory justification `notes` and transactional audit log.

- **Domain Rules and Input Validation**:
  - Zod validation schemas for title installment plans, revenue settlement, and expense settlement.
  - Validation rules for positive amounts, valid due dates, active counterpart profiles, and closure locks.

## Capabilities

### New Capabilities
- `revenue-receivable-generation`: Generation of pure `Receivable` titles from contract `Revenue` with `ContractRevenueReceivable` bridge and strict closure balance lock.
- `expense-payable-generation`: Generation of pure `Payable` titles from `Expense` with `ExpensePayable` bridge and strict closure balance lock.
- `direct-title-creation`: Direct manual creation of agnostic `Receivable` and `Payable` titles without operational bridges.

### Modified Capabilities

## Impact

- `src/features/financial` or server data services: New title generation logic and bridge handoff routines.
- `src/features/contracts`: Integration point for triggering receivable generation from revenue plans.
- `src/features/expenses`: Integration point for triggering payable generation from expenses.
- Test coverage: Vitest unit and integration tests covering the closure balance lock, bridge atomicity, and title kind invariants.

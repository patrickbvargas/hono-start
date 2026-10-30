## Context

The financial architecture requires decoupling the core ledger (`Receivable`, `Payable`, `Receipt`, `Payment`) from business-specific domain entities (`Contract`, `Revenue`, `Expense`). Instead of foreign keys directly on titles or monolithic intermediate tables like `FinancialGeneration`, the system introduces explicit bridge tables (`ContractRevenueReceivable`, `ExpensePayable`, `RemunerationPayable`).

Titles created directly (e.g. manual ad-hoc receivables or recurring firm expenses like utility bills) exist cleanly in `Receivable` and `Payable` without any bridge records or fake origin records.

## Goals / Non-Goals

**Goals:**
- Implement the 4-bounded-context architecture in `prisma/schema.prisma`.
- Create bridge models: `ContractRevenueReceivable`, `ExpensePayable`, and `RemunerationPayable`.
- Convert `TitleKind` to a native enum (`DOWN_PAYMENT`, `INSTALLMENT`, `EXTRA`) on titles.
- Remove obsolete models (`FinancialGeneration`, `DirectFinancialEntry`, `RemunerationCalculation`, `TitleKind` lookup).
- Update cross-cutting models (`Attachment`, `AuditLog`) to link to `remunerationPayableId`.
- Update seed scripts and dummy data generators to populate the database with realistic test data complying with the new schema.
- Synchronize database schema and verify database integrity.

**Non-Goals:**
- Frontend refactoring (UI views and TanStack Form mutations will be adapted in subsequent feature changes).
- Changing global identity invariants (`Person`, `ClientProfile`, `SupplierProfile`, `EmployeeProfile`).

## Decisions

### Decision 1: Pure Title Models with Zero Operational FKs
- **Choice**: `Receivable` references only `Firm`, `debtorId (ClientProfile)`, `analyticId (FinancialAnalytic)`, `expectedPaymentMethodId (PaymentMethod)`, and carries `kind (TitleKind enum)`. `Payable` references only `Firm`, `beneficiaryId (SupplierProfile)`, `analyticId`, `expectedPaymentMethodId`, and `kind`.
- **Rationale**: Keeps the core financial engine strictly agnostic. Any future operational module (e.g. consulting, product sales, recurring subscriptions) can hook into the financial ledger simply by creating its own bridge table.
- **Alternatives Considered**: Direct nullable foreign keys (`contractId`, `expenseId`) on titles. Rejected because it pollutes the financial ledger with domain concerns and breaks bounded context isolation.

### Decision 2: 1:1 Bridge Invariants (`receivableId` UNIQUE, `payableId` UNIQUE)
- **Choice**: In `ContractRevenueReceivable`, `receivableId` has `@unique`. In `ExpensePayable`, `payableId` has `@unique`. In `RemunerationPayable`, `payableId` has `@unique`.
- **Rationale**: A single financial title represents an atomic obligation and cannot belong to multiple operational revenues or expenses simultaneously.
- **Alternatives Considered**: N:N bridges. Rejected because a title's face value corresponds to a single commercial origin.

### Decision 3: RemunerationPayable Replaces RemunerationCalculation
- **Choice**: Commission obligations are generated from `Receipt` and `ContractAssignment` directly into `RemunerationPayable` which in turn points to an auto-created `Payable` (beneficiary is the employee's `SupplierProfile`).
- **Rationale**: Eliminates the intermediate calculation entity; the bridge table itself stores the calculation snapshot (`calculationBase`, `effectivePercentage`, `calculatedAmount`, `computedDueDate`, `ruleSnapshot`) alongside the unique reference to the generated `Payable`.

### Decision 4: Native Enum for Title Classification
- **Choice**: Enum `TitleKind { DOWN_PAYMENT, INSTALLMENT, EXTRA }` in Prisma.
- **Rationale**: Title kinds are fixed domain classifications ($C = P - D + J + M$), not tenant-configurable lookups. Using a native database enum improves query performance and provides compile-time type safety.
- **Alternatives Considered**: Retaining `ref_title_kinds` table. Rejected per canonical contract `docs/domain/LOOKUP_VALUES.md`.

## Risks / Trade-offs

- **[Risk] Existing database data loss during schema migration**:
  - *Mitigation*: The project uses deterministic seed scripts to populate development and test environments (`pnpm db:seed`). Schema updates can be applied cleanly via Prisma migrate/push and re-seeded.
- **[Risk] Broken TypeScript compile in existing feature controllers**:
  - *Mitigation*: This change focuses on data persistence layer (`prisma/schema.prisma` and seeds). Feature controllers will be addressed in targeted follow-up changes, but the database schema, Prisma client, and seed verification will be fully green.

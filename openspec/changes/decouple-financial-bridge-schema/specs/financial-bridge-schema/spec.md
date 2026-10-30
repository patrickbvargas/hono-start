## ADDED Requirements

### Requirement: Decoupled pure financial titles
The system SHALL define `Receivable` and `Payable` models in Prisma that are agnostic of operational entities and contain zero direct foreign keys to `Revenue`, `Expense`, `Contract`, `FinancialGeneration`, or `DirectFinancialEntry`.

#### Scenario: Receivable schema contains no operational foreign keys
- **WHEN** the Prisma schema is inspected
- **THEN** `Receivable` has foreign keys only to `Firm`, `ClientProfile` (debtor), `FinancialAnalytic`, and `PaymentMethod`
- **AND** `Receivable` contains no `revenueId`, `generationId`, `directEntryId`, or contract reference

#### Scenario: Payable schema contains no operational foreign keys
- **WHEN** the Prisma schema is inspected
- **THEN** `Payable` has foreign keys only to `Firm`, `SupplierProfile` (beneficiary), `FinancialAnalytic`, and `PaymentMethod`
- **AND** `Payable` contains no `expenseId`, `generationId`, `directEntryId`, or `remunerationCalculationId`

### Requirement: Operational to financial bridge tables
The system SHALL define dedicated bridge models `ContractRevenueReceivable`, `ExpensePayable`, and `RemunerationPayable` to link operational events to financial titles with strict 1:1 uniqueness on titles.

#### Scenario: Contract revenue receivable bridge uniqueness
- **WHEN** a `ContractRevenueReceivable` record is created
- **THEN** it links a `Contract` and `Revenue` to a `Receivable`
- **AND** `receivableId` is unique, enforcing that a title belongs to at most one revenue plan

#### Scenario: Expense payable bridge uniqueness
- **WHEN** an `ExpensePayable` record is created
- **THEN** it links an `Expense` to a `Payable`
- **AND** `payableId` is unique, enforcing that a title belongs to at most one expense

#### Scenario: Remuneration payable bridge snapshot and uniqueness
- **WHEN** a `RemunerationPayable` record is created
- **THEN** it links a `Receipt` and `ContractAssignment` to a commission `Payable`
- **AND** `payableId` is unique
- **AND** it stores an immutable calculation snapshot containing `calculationBase`, `effectivePercentage`, `calculatedAmount`, `computedDueDate`, and `ruleSnapshot`

### Requirement: Native enum for title kind classification
The system SHALL use a native Prisma enum `TitleKind` on `Receivable` and `Payable` with values `DOWN_PAYMENT`, `INSTALLMENT`, and `EXTRA`.

#### Scenario: Title kind enum assignment
- **WHEN** a `Receivable` or `Payable` is created
- **THEN** the `kind` field accepts only `DOWN_PAYMENT`, `INSTALLMENT`, or `EXTRA`
- **AND** no lookup table `ref_title_kinds` is referenced

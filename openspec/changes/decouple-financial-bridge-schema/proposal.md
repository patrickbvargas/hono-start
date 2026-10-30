## Why

The canonical project documentation (`docs/domain/DOMAIN_MODEL.md`, `docs/domain/FINANCIAL_SYSTEM.md`, `docs/domain/FINANCIAL_UML.md`) establishes a strictly decoupled 4-bounded-context architecture. The pure financial core (`Receivable`, `Payable`, `Receipt`, `Payment`) must remain completely agnostic of operational entities (`Contract`, `Revenue`, `Expense`), interconnected solely via dedicated bridge tables (`ContractRevenueReceivable`, `ExpensePayable`, `RemunerationPayable`).

Currently, `prisma/schema.prisma` still contains redundant legacy models (`FinancialGeneration`, `DirectFinancialEntry`), direct operational foreign keys on `Receivable` and `Payable`, and obsolete table-based title kinds (`ref_title_kinds`). We need to update the Prisma schema, apply database changes, and overhaul the seed scripts to populate consistent test data matching the target contract.

## What Changes

- **BREAKING**: Remove `FinancialGeneration` and `DirectFinancialEntry` models and their relations from `Firm`, `Person`, `Revenue`, `Expense`, `Receivable`, and `Payable`.
- **BREAKING**: Remove direct operational foreign keys (`revenueId`, `expenseId`, `generationId`, `directEntryId`, `remunerationCalculationId`) from `Receivable` and `Payable`.
- **BREAKING**: Replace `TitleKind` lookup model (`ref_title_kinds`) and `titleKindId` columns with native Prisma enum `TitleKind` (`DOWN_PAYMENT`, `INSTALLMENT`, `EXTRA`) directly on `Receivable` and `Payable`.
- **BREAKING**: Replace `RemunerationCalculation` with `RemunerationPayable` bridge model connecting `Receipt` and `ContractAssignment` to `Payable`.
- Introduce bridge models:
  - `ContractRevenueReceivable`: Links operational `Revenue` to financial `Receivable` (`receivableId` UNIQUE).
  - `ExpensePayable`: Links operational `Expense` to financial `Payable` (`payableId` UNIQUE).
  - `RemunerationPayable`: Links `Receipt` and `ContractAssignment` to commission `Payable` (`payableId` UNIQUE) with immutable rule snapshot.
- Update cross-cutting models `Attachment` and `AuditLog` to reference `remunerationPayableId` instead of `remunerationCalculationId` / `financialGenerationId`.
- Update catalog seed and data fixtures (`seed-catalogs.json`, `seed.ts`, `seed-financial-*.ts`) to populate the database under the new bridge architecture with rich dummy test data.
- Align database schema via Prisma and regenerate client.

## Capabilities

### New Capabilities
- `financial-bridge-schema`: Defines the decoupled data persistence schema for financial bridges (`ContractRevenueReceivable`, `ExpensePayable`, `RemunerationPayable`), pure title models, and title kind enums.

### Modified Capabilities
- `development-seed-fixtures`: Seed pipeline must populate relational data according to the bridge schema, creating pure titles, operational bridges, and dummy test scenarios.

## Non-goals

- Refactoring frontend UI pages or application routes (covered in subsequent feature changes).
- Altering the multitenancy model or identity profile invariants (`Person`, `ClientProfile`, `SupplierProfile`, `EmployeeProfile`).

## Impact

- `prisma/schema.prisma`: Core schema overhaul.
- Database: Dropped legacy tables/columns, created bridge tables and enum type.
- `prisma/seed-catalogs.json`, `prisma/seed.ts`, `prisma/seed-financial-scenarios.ts`, `prisma/seed-financial-fixtures.ts`, `prisma/seed-financial-evidence.ts`: Seed scripts updated to the new models.
- `src/generated/prisma`: Regenerated client types.

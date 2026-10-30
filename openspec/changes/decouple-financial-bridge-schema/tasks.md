## 1. Prisma Schema Decoupling

- [x] 1.1 Remove `FinancialGeneration` and `DirectFinancialEntry` models and references from `prisma/schema.prisma`
- [x] 1.2 Remove operational foreign keys from `Receivable` and `Payable` models
- [x] 1.3 Add native `TitleKind` enum (`DOWN_PAYMENT`, `INSTALLMENT`, `EXTRA`) and remove `TitleKind` lookup model
- [x] 1.4 Add bridge models `ContractRevenueReceivable`, `ExpensePayable`, and `RemunerationPayable`
- [x] 1.5 Update `Attachment` and `AuditLog` models to reference `remunerationPayableId`
- [x] 1.6 Generate Prisma Client (`pnpm db:generate`)

## 2. Database Alignment

- [x] 2.1 Push or migrate database schema to Postgres
- [x] 2.2 Verify table definitions, foreign keys, and unique indexes in the database

## 3. Seed Pipeline & Test Data

- [ ] 3.1 Update `seed-catalogs.json` and catalog loader in `seed.ts`
- [ ] 3.2 Refactor `seed-financial-fixtures.ts` and `seed-financial-scenarios.ts` to use bridge tables and pure titles
- [ ] 3.3 Update `seed-financial-evidence.ts` attachments and assertions
- [ ] 3.4 Update `verify-financial-db.ts` to validate the new decoupled architecture
- [ ] 3.5 Execute `pnpm db:seed` and verify zero errors with rich dummy data populated

## 4. Final Verification

- [ ] 4.1 Run `tsx prisma/verify-financial-db.ts` and ensure all checks pass
- [ ] 4.2 Verify database contains realistic test scenarios for contracts, revenues, expenses, pure titles, bridges, receipts, and payments

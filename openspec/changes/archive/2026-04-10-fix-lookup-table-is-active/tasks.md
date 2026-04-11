## 1. Prisma Schema And Migration

- [x] 1.1 Add `isActive Boolean @default(true)` to the `EmployeeType` and `UserRole` models in `prisma/schema.prisma`
- [x] 1.2 Generate a Prisma migration that adds the new columns with `NOT NULL DEFAULT true`
- [x] 1.3 Regenerate the Prisma client after the schema change

## 2. Seed And Lookup Queries

- [x] 2.1 Update `prisma/seed.ts` so the employee-type and user-role upserts explicitly preserve `isActive: true`

## 3. Validation And Edge Cases

- [x] 3.1 Verify the employee create/edit form still behaves correctly when lookup option lists contain only active rows

## 4. Verification

- [x] 4.1 Run `pnpm check`
- [x] 4.2 Run `npx tsc --noEmit`

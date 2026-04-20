## Why

The project docs define lookup tables as records with `value`, `label`, and `isActive`, and require option queries to return only active lookup rows. The current schema and employee lookup fetches do not follow that contract for `EmployeeType` and `UserRole`, which means inactive lookup values cannot be represented or excluded consistently.

## What Changes

- Add `isActive Boolean @default(true)` to the `EmployeeType` and `UserRole` Prisma models and create a migration for the existing database.
- Update seed upserts so lookup rows remain explicitly active after seeding.
- Filter employee form lookup queries (`employee types` and `user roles`) to return only active rows ordered by label.
- Regenerate the Prisma client after the schema change so the generated types match the database.
- Document the shared lookup-table behavior in a dedicated capability spec.

## Non-goals

- Adding a lookup-table admin settings UI to toggle `isActive`.
- Changing the `Firm` model. The current project data model explicitly excludes `Firm` from the `isActive` requirement, so this change does not alter tenant records.
- Refactoring unrelated employee list, filter, or mutation behavior.

## Capabilities

### New Capabilities
- `lookup-reference-data`: Global lookup tables used for selectable reference data expose `isActive` and option queries return only active rows.

### Modified Capabilities
- `employee-management`: Employee create/edit flows use active-only type and role lookup options, so inactive lookup values are no longer selectable for new submissions.

## Impact

- Prisma schema and migration: `prisma/schema.prisma`, `prisma/migrations/*`
- Seed data: `prisma/seed.ts`
- Employee lookup queries: `src/features/employees/api/get.ts`
- Generated Prisma client/types: `src/generated/prisma/*`
- OpenSpec: new capability spec plus a delta for `employee-management`

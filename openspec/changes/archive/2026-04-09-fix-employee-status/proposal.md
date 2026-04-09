## Why

The project adopted an `isActive` boolean concern for all business entities (FR-DATA-05, FR-DATA-06), but the employees feature was never updated to implement it. As a result, the employee form lacks the "Ativo" checkbox, the filter has no status control in the UI, the table actions ignore the employee's active state, and the Prisma model is missing the `isActive` field entirely.

## What Changes

- **Add `isActive` field to the `Employee` Prisma model** — `Boolean @default(true)` with a DB index; migration required.
- **Add `isActive` to the employee form schema** (create and update) and default values.
- **Add "Ativo" checkbox to the employee create/edit form** (FR-AUTH-08).
- **Wire `isActive` through the create and update API handlers**.
- **Update the employee model schema** to expose `isActive` on the client-side `Employee` type.
- **Update the `getEmployees` API handler** to filter by `isActive` separately from soft-delete (`deletedAt`). Currently both are conflated under a single "status" filter backed by `deletedAt` only.
- **Update the employee filter schema** — rename/extend the `status` filter to distinguish `isActive` from soft-delete status, aligned with how the filter UI and API should interact.
- **Add the status filter control to `EmployeeFilter` UI** — a multiselect or toggle for Ativo/Inativo backed by `isActive`.
- **Fix the table row actions** — conditionally show Edit/Delete vs Restore based on `deletedAt` (not `isActive`); the commented-out `isActive` check must be resolved.
- **Update `defaultFormUpdateValues`** to include `isActive` pre-populated from the existing employee record.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `employee-management`: Requirements change to include the `isActive` form field ("Ativo" checkbox) in create and edit scenarios, and to clarify that the status filter filters by `isActive` (independent of `deletedAt`).
- `employee-filter-ui`: Requirements change to add the status filter control (Ativo / Inativo) rendered by the `EmployeeFilter` component.

## Impact

- **Prisma schema & migration**: `prisma/schema.prisma` — new `isActive` column; a database migration must be run.
- **API**: `src/features/employees/api/get.ts`, `create.ts`, `update.ts`
- **Schemas**: `src/features/employees/schemas/form.ts`, `model.ts`, `filter.ts`
- **Utilities**: `src/features/employees/utils/default.ts`
- **Components**: `src/features/employees/components/form/index.tsx`, `filter/index.tsx`, `table/index.tsx`
- **Specs**: `openspec/specs/employee-management/spec.md`, `openspec/specs/employee-filter-ui/spec.md`

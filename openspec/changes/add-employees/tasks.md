## 1. Database — Schema & Migration

- [x] 1.1 Add `EmployeeType` and `UserRole` lookup table models to `prisma/schema.prisma` (if not already present)
- [x] 1.2 Add `Employee` model to `prisma/schema.prisma` with all fields from DATA_MODEL §4.2 (`firmId`, `fullName`, `email`, `typeId`, `roleId`, `oabNumber`, `remunerationPercentage`, `referralPercentage`, `avatarUrl`, timestamps, `deletedAt`)
- [x] 1.3 Run `prisma migrate dev --name add-employees-table` to generate the migration file
- [x] 1.4 Add seed data for `EmployeeType` (LAWYER, ADMIN_ASSISTANT) and `UserRole` (ADMIN, USER) to `prisma/seed.ts`
- [x] 1.5 Verify migration and seed run cleanly (`prisma db seed`)

## 2. Schema & Validation Fixes

- [x] 2.1 Update OAB regex in `src/features/employees/schemas/form.ts` from `^RS\d{6}$` to `^[A-Z]{2}\d{6}$` to support all Brazilian state codes
- [x] 2.2 Add `referrerPercent <= remunerationPercent` cross-field validation to `employeeCreateSchema` and `employeeUpdateSchema`
- [x] 2.3 Ensure `referrerPercent` allows 0 (update min validation from `0.01` to `0`)
- [x] 2.4 Update `employeeSchema` (model) to reflect the correct field names matching the DB (`remunerationPercentage`, `referralPercentage`)

## 3. Backend — Server Functions

- [x] 3.1 Implement `getEmployees` server function with real Prisma query: filter by `firmId`, `deletedAt`, type, role, status; server-side sort with tiebreaker `{ id: "asc" }`; paginate with `skip`/`take`
- [x] 3.2 Implement `getEmployeeTypes` server function to query `EmployeeType` lookup table
- [x] 3.3 Implement `getEmployeeRoles` server function to query `UserRole` lookup table
- [x] 3.4 Implement `createEmployee` server function with Prisma `create`, scoped to `firmId`; handle unique constraint on `email` with a user-friendly Portuguese error
- [x] 3.5 Implement `updateEmployee` server function with Prisma `update`, verifying the record belongs to the session's firm before updating
- [x] 3.6 Implement `deleteEmployee` server function with soft-delete (`deletedAt = now()`); check deletion protection rules (active contract assignments with active remunerations block deletion)
- [x] 3.7 Add `restoreEmployee` server function (new) that clears `deletedAt`; expose as `restoreEmployeeOptions` and export from `index.ts`
- [x] 3.8 Remove `alert()` and `onSuccess`/`onError` callbacks from all mutation options factories (per CONVENTIONS.md — callbacks belong in the form hook)

## 4. Frontend — Employee List Route

- [x] 4.1 Update `src/routes/funcionarios.tsx` to render `EmployeeTable` (replacing raw JSON dump) and include a "Novo Funcionário" button (visible to Admins only)
- [x] 4.2 Add filter UI to the route (type, role, status) that updates URL search params on change
- [x] 4.3 Verify `EmployeeTable` columns, sort handlers, and `Pagination` component all read from and write to URL search params correctly

## 5. Frontend — Employee Table Component

- [x] 5.1 Uncomment and implement the row action column in `EmployeeTable` with edit and delete buttons (Admins only); add restore button for inactive rows
- [x] 5.2 Apply shared formatters to cell renderers: OAB format (`formatter.oab`), percentage (`formatter.percent`), status badge (`EntityStatus`), and type/role labels
- [x] 5.3 Implement a simplified read-only column set for regular Users (name, type, OAB only) — rendered conditionally based on role

## 6. Frontend — Create & Edit Modal

- [x] 6.1 Wire the "Novo Funcionário" button to open a create modal with `EmployeeForm` in `mode="create"`
- [x] 6.2 Wire the edit action in the table to open a modal with `EmployeeForm` in `mode="edit"`, passing the employee's current data as `initialData`
- [x] 6.3 Update `useEmployeeForm` to handle `onSuccess` with toast notification (`sonner`) and query cache invalidation (invalidate the employee cache key) — remove `alert()` calls
- [x] 6.4 Add dynamic OAB field visibility: show only when `type` is Advogado; hide/disable when Assistente Administrativo
- [x] 6.5 Update `defaultFormCreateValues()` and add `defaultFormUpdateValues(employee)` in `src/features/employees/utils/default.ts`

## 7. Frontend — Delete & Restore Confirmation Modal

- [x] 7.1 Implement the delete confirmation modal in `src/features/employees/components/delete/index.tsx` — show employee name, confirm/cancel buttons
- [x] 7.2 Wire the delete action in the table to open the delete confirmation modal
- [x] 7.3 On confirmed delete, call `deleteEmployee` mutation; show success or error toast; invalidate employee cache
- [x] 7.4 Add restore confirmation modal (new component or reuse delete modal with different copy)
- [x] 7.5 Wire the restore action to open restore confirmation; on confirm call `restoreEmployee`; show toast; invalidate cache

## 8. Feature Barrel & Exports

- [x] 8.1 Export all new/updated options factories (`restoreEmployeeOptions`, updated mutation options) from `src/features/employees/index.ts`
- [x] 8.2 Run `pnpm check` and fix any Biome lint/format issues

## 9. Error validation

- [x] 9.1 Run `pnpm check` then `npx tsc --noEmit`. Fix all errors.

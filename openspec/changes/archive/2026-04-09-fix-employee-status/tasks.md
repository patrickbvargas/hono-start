## 1. Database & Prisma

- [x] 1.1 Add `isActive Boolean @default(true)` field and `@@index([isActive])` to the `Employee` model in `prisma/schema.prisma`
- [x] 1.2 Run `prisma migrate dev --name add-employee-is-active` to generate and apply the migration
- [x] 1.3 Run `prisma generate` to regenerate the Prisma client

## 2. Schema & Types

- [x] 2.1 Add `isActive: z.boolean()` to `employeeBaseShape` in `schemas/form.ts` (shared by create and update)
- [x] 2.2 Add `isActive: z.boolean()` to `employeeSchema` in `schemas/model.ts`
- [x] 2.3 Add `active: z.string().catch("")` to `employeeFilterSchema` in `schemas/filter.ts` (URL param for isActive filter; values: `"true"` | `"false"` | `""`)

## 3. Default Values

- [x] 3.1 Add `isActive: true` to `defaultFormCreateValues()` in `utils/default.ts`
- [x] 3.2 Add `isActive: initialValue.isActive` to `defaultFormUpdateValues()` in `utils/default.ts`

## 4. API — Read

- [x] 4.1 In `api/get.ts`, add `isActive` to the mapped employee object (pass through from the Prisma result)
- [x] 4.2 In `api/get.ts`, add an `isActive` condition to `where` based on `data.active` (`"true"` → `{ isActive: true }`, `"false"` → `{ isActive: false }`, `""` → no constraint)
- [x] 4.3 In `api/get.ts`, verify that `getEmployeeTypes` and `getEmployeeRoles` option queries filter `isActive: true` on the lookup tables; add the filter if missing

## 5. API — Write

- [x] 5.1 In `api/create.ts`, pass `isActive: data.isActive` to `prisma.employee.create()`
- [x] 5.2 In `api/update.ts`, pass `isActive: data.isActive` to `prisma.employee.update()`

## 6. Form Component

- [x] 6.1 In `components/form/index.tsx`, add the "Ativo" `Checkbox` field (HeroUI) bound to the `isActive` form field, in both create and edit modes

## 7. Filter Component

- [x] 7.1 In `components/filter/index.tsx`, add a `Select` or `Multiselect` control labeled "Status" bound to the `active` filter field with options "Ativo" (`"true"`) and "Inativo" (`"false"`); wire its `onChange` to submit the filter form

## 8. Table — Row Actions

- [x] 8.1 In `components/table/index.tsx`, uncomment and fix the `isActive` / `deletedAt` check: condition actions so that non-deleted employees show Edit + Delete (hide Restore), and deleted employees show Restore (hide Edit + Delete); use `employee.status === "Ativo"` (or derive from the `status` field) as the discriminant

## 9. Verification

- [x] 9.1 Run `pnpm check` and fix any formatting or lint errors reported by Biome
- [x] 9.2 Run `npx tsc --noEmit` and fix all TypeScript errors before considering the task complete

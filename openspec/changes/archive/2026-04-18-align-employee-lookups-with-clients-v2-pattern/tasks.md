## 1. Contract alignment

- [x] 1.1 Update the employee, entity-foundation, and form-validation-boundary specs so the main objective is full employee-slice alignment with `clients_v2`, with lookup validation captured as one required sub-area.
- [x] 1.2 Confirm which employee responsibilities are truly equivalent to `clients_v2` and lock the shared names that must remain aligned across both slices.

## 2. Employee slice refactor

- [x] 2.1 Align `src/features/employees` equivalent module boundaries, internal naming, and import style with `src/features/clients_v2` wherever both slices perform the same job.
- [x] 2.2 Refactor employee lookup data helpers and lookup assertions so employee type and user role use singular existence and selectability responsibilities aligned with `clients_v2`.
- [x] 2.3 Update employee write orchestration, form/query consumers, and remaining internal helpers so the slice reads like the same house pattern while preserving employee-specific behavior.
- [x] 2.4 Remove employee-only convenience entrypoints or aggregate helpers that are no longer needed once the slice follows the same internal pattern as `clients_v2`.

## 3. Reference-slice sync

- [x] 3.1 If the chosen shared term differs from the current `clients_v2` name, apply the same naming update to `src/features/clients_v2` for the equivalent lookup-backed responsibilities.
- [x] 3.2 Verify that `clients_v2` and `employees` still expose the same minimal public surface and keep equivalent internal responsibilities comparably named.

## 4. Verification

- [x] 4.1 Update or add focused tests for employee and client lookup-backed writes, including unknown lookup values and unchanged inactive persisted selections on edit.
- [x] 4.2 Run `pnpm check` and fix any issues introduced by the refactor.
- [x] 4.3 Run `npx tsc --noEmit` and fix any remaining type errors before the change is considered ready to apply.

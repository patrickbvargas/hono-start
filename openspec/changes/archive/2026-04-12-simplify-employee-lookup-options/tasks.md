## 1. Specs And Docs

- [x] 1.1 Update shared and employee OpenSpec specs to describe lookup option queries returning all rows and disabling inactive values in forms.
- [x] 1.2 Update `docs/CONVENTIONS.md`, `docs/PRD.md`, and `docs/DATA_MODEL.md` so lookup-backed form options no longer document active-only datasets.

## 2. Employees Implementation

- [x] 2.1 Update employee type and user role option queries to fetch all lookup rows sorted by label while preserving disabled state metadata.
- [x] 2.2 Remove merged inactive-option helpers from the employee form and consume the backend option dataset directly.
- [x] 2.3 Simplify `useEmployeeForm` so it no longer performs client-side active-option validation for type and role selections.

## 3. Verification

- [x] 3.1 Review the employees slice against the updated lookup-option contract and confirm inactive persisted values render without feature-local merge logic.
- [x] 3.2 Run `pnpm check`.
- [x] 3.3 Run `npx tsc --noEmit`.

## 1. Decouple Consumers

- [x] 1.1 Update `src/routes/_app/index.tsx` to replace `ClientForm`, `EmployeeForm`, `EmployeeDetails`, and lookup prefetching with `@/features/people`.
- [x] 1.2 Update `src/features/related-records` (`details/index.tsx`, `use-record-page.ts`, `record-page.test.tsx`) to map client and employee records to `@/features/people`.
- [x] 1.3 Update `src/shared/components/__tests__/row-context-menu.test.tsx` to use `PersonTable` instead of `ClientTable`.
- [x] 1.4 Remove legacy contract tests in `src/features/__tests__/` (`form-contracts.test.ts`, `model-contracts.test.ts`, `search-contracts.test.ts`, `utility-contracts.test.ts`).

## 2. Remove Legacy Directories

- [x] 2.1 Delete directory `src/features/clients`.
- [x] 2.2 Delete directory `src/features/employees`.

## 3. Verification

- [x] 3.1 Run `vitest run` on affected features and verify all tests pass.
- [x] 3.2 Run `tsc --noEmit` and verify zero references or errors related to clients or employees.
- [x] 3.3 Run `biome check` to ensure formatting and linting pass.

## Why

The system has fully migrated from separated `Client` and `Employee` master models to the unified `Person` entity and profile architecture (`ClientProfile`, `SupplierProfile`, `EmployeeProfile`) located in `src/features/people`.
The legacy feature directories `src/features/clients` and `src/features/employees` are obsolete, causing compilation failures against the updated Prisma schema and cluttering the codebase. We need to decouple remaining consumer modules (`src/routes/_app/index.tsx`, `src/features/related-records`, and tests) and cleanly remove these directories.

## What Changes

- **Dashboard (`src/routes/_app/index.tsx`)**:
  - Replace `ClientForm` and `EmployeeForm` with `PersonForm` from `@/features/people`.
  - Replace `EmployeeDetails` with `PersonDetails` from `@/features/people`.
  - Replace lookup queries `getClientTypesQueryOptions()` and `getEmployeeTypesQueryOptions()` (from `employees`) with `getPersonTypesQueryOptions()` and `getEmployeeTypesQueryOptions()` from `@/features/people`.
  - Unify create overlays to open `PersonForm`.
- **Related Records (`src/features/related-records`)**:
  - In `components/details/index.tsx`, map `client` and `employee` kinds to `PersonDetails`, `PersonForm`, `PersonDelete`, `PersonRestore` from `@/features/people`.
  - In `hooks/use-record-page.ts`, route both `client` and `employee` records to `/pessoas/$personId`.
  - In `__tests__/record-page.test.tsx`, mock `@/features/people` instead of legacy client/employee modules.
- **Tests**:
  - In `src/shared/components/__tests__/row-context-menu.test.tsx`, replace `ClientTable` with `PersonTable`.
  - Remove obsolete tests in `src/features/__tests__/` (`form-contracts.test.ts`, `model-contracts.test.ts`, `search-contracts.test.ts`, `utility-contracts.test.ts`) that test removed directories.
- **Cleanup**:
  - Permanently delete `src/features/clients` and `src/features/employees`.

## Capabilities

### New Capabilities
- `legacy-cleanup`: Remove deprecated clients and employees feature modules and rewire dashboard and related records consumers to people.

### Modified Capabilities
- None (requirements on people/person directory remain defined in canonical docs and person specs).

## Impact

- `src/features/clients`: Deleted.
- `src/features/employees`: Deleted.
- `src/routes/_app/index.tsx`: Updated to use `@/features/people`.
- `src/features/related-records`: Updated to use `@/features/people`.
- `src/shared/components/__tests__/row-context-menu.test.tsx`: Updated.
- `src/features/__tests__/`: Cleaned up.

## Context

The repository has transitioned to the unified `Person` entity and profile architecture (`src/features/people`), canonicalized in `docs/domain/DOMAIN_MODEL.md`.
The directories `src/features/clients` and `src/features/employees` remain in the codebase, but their underlying Prisma models (`Client`, `Employee`) have been removed from `prisma/schema.prisma`.
Currently, remaining consumers are:
1. `src/routes/_app/index.tsx` (Dashboard view)
2. `src/features/related-records`
3. `src/shared/components/__tests__/row-context-menu.test.tsx`
4. Obsolete contract unit tests in `src/features/__tests__/`

## Goals / Non-Goals

**Goals:**
- Decouple all consumer modules and test files from `src/features/clients` and `src/features/employees`.
- Map all client and employee UI actions (form, details, routing) to `@/features/people`.
- Delete `src/features/clients` and `src/features/employees` completely.
- Ensure all tests and type checks pass.

**Non-Goals:**
- Changing database schema or Prisma models.
- Changing `src/features/people` implementation or behavior.

## Decisions

1. **Dashboard (`src/routes/_app/index.tsx`)**:
   - Replace separate `ClientForm` and `EmployeeForm` with `PersonForm` from `@/features/people`.
   - Update quick-action dropdown menu: "Novo cliente" and "Novo colaborador" (or "Nova pessoa") will open `personOverlay` rendering `PersonForm`.
   - Prefetch lookup options using `getPersonTypesQueryOptions()` and `getEmployeeTypesQueryOptions()` from `@/features/people`.
2. **Related Records (`src/features/related-records`)**:
   - In `components/details/index.tsx`: Map `client` and `employee` kinds to `PersonDetails`, `PersonForm`, `PersonDelete`, `PersonRestore` from `@/features/people`.
   - In `hooks/use-record-page.ts`: Navigate both `client` and `employee` kinds to `/pessoas/$personId` using `personSearchDefaults`.
   - In `__tests__/record-page.test.tsx`: Update mock references to `@/features/people`.
3. **Tests**:
   - Update `src/shared/components/__tests__/row-context-menu.test.tsx` to test with `PersonTable` from `@/features/people`.
   - Delete obsolete contract test files in `src/features/__tests__/` (`form-contracts.test.ts`, `model-contracts.test.ts`, `search-contracts.test.ts`, `utility-contracts.test.ts`) that specifically test deleted directories.
4. **Directory Deletion**:
   - Remove `src/features/clients` and `src/features/employees`.

## Risks / Trade-offs

- **Risk**: A hidden import from `clients` or `employees` breaking the build.
  - **Mitigation**: Full repository grep was performed, confirming only the identified files import these modules. A full `tsc --noEmit` and `vitest` run will verify clean removal.


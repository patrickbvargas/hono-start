## 1. Shared error helper

- [x] 1.1 Update `src/shared/lib/error-mapping.ts` so `hasExactErrorMessage(...)` accepts a string catalog object in addition to a string array.
- [x] 1.2 Keep the helper exact-match behavior unchanged for existing array-based callers.
- [x] 1.3 Add or adjust targeted tests, if the repo has coverage for shared helpers, to prove catalog and array inputs both work.

## 2. Employees feature constants and errors

- [x] 2.1 Split `src/features/employees/constants/index.ts` into focused files such as `cache.ts`, `values.ts`, `sorting.ts`, and `errors.ts`.
- [x] 2.2 Move all employee Portuguese error strings into `src/features/employees/constants/errors.ts`.
- [x] 2.3 Update employee validation helpers and lookup resolvers to import error constants instead of inline strings.
- [x] 2.4 Update employee API handlers to classify expected errors through the employee error catalog.

## 3. Clients feature constants and errors

- [x] 3.1 Split `src/features/clients/constants/index.ts` into focused files such as `cache.ts`, `values.ts`, `sorting.ts`, and `errors.ts`.
- [x] 3.2 Move all client Portuguese error strings into `src/features/clients/constants/errors.ts`.
- [x] 3.3 Update client validation helpers and lookup resolvers to import error constants instead of inline strings.
- [x] 3.4 Update client API handlers to classify expected errors through the client error catalog.

## 4. Contracts feature constants and errors

- [x] 4.1 Split `src/features/contracts/constants/index.ts` into focused files such as `cache.ts`, `values.ts`, `sorting.ts`, and `errors.ts`.
- [x] 4.2 Move all contract Portuguese error strings into `src/features/contracts/constants/errors.ts`.
- [x] 4.3 Update contract validation helpers, lookup resolvers, and resource guards to import error constants instead of inline strings.
- [x] 4.4 Update contract API handlers to classify expected errors through the contract error catalog.

## 5. Fees feature constants and errors

- [x] 5.1 Split `src/features/fees/constants/index.ts` into focused files such as `cache.ts`, `sorting.ts`, and `errors.ts`.
- [x] 5.2 Move all fee Portuguese error strings into `src/features/fees/constants/errors.ts`.
- [x] 5.3 Update fee validation helpers, write helpers, and resource guards to import error constants instead of inline strings.
- [x] 5.4 Update fee API handlers to classify expected errors through the fee error catalog.

## 6. Remunerations feature constants and errors

- [x] 6.1 Split `src/features/remunerations/constants/index.ts` into focused files such as `cache.ts`, `sorting.ts`, `export-formats.ts`, and `errors.ts`.
- [x] 6.2 Move all remuneration Portuguese error strings into `src/features/remunerations/constants/errors.ts`.
- [x] 6.3 Update remuneration validation helpers, resource guards, and API handlers to import error constants instead of inline strings.

## 7. Verification and cleanup

- [x] 7.1 Search the repository for remaining feature-owned inline Portuguese error literals and replace the ones that belong in feature error catalogs.
- [x] 7.2 Confirm the user-facing Portuguese text remains unchanged after the migration.
- [x] 7.3 Run the repository checks required by the workflow and fix any regressions before marking the change ready.

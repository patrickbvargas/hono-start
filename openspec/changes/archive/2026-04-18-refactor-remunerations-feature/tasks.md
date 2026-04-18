## 1. Baseline And References

- [x] 1.1 Review current `src/features/remunerations` imports, route consumers, hooks, tests, and old API module usage with `rg`.
- [x] 1.2 Re-check reference implementations in `clients_v2`, `employees`, `contracts`, and `fees` for API/data/rules naming before editing.
- [x] 1.3 Confirm no Prisma schema migration is required; if one becomes necessary, update the change artifacts before implementing it.

## 2. Rules Boundary

- [x] 2.1 Create `src/features/remunerations/rules/write.ts` with exported throwing assertions named with `assert...`.
- [x] 2.2 Replace `validateRemunerationWriteRules` usage in `schemas/form.ts` with the new assertion boundary while preserving Zod messages and paths.
- [x] 2.3 Remove the obsolete top-level `src/features/remunerations/rules.ts` after all imports move to `rules/write`.
- [x] 2.4 Update remuneration rules and form tests to cover successful assertions, thrown rule errors, and schema parse errors.

## 3. Data Boundary

- [x] 3.1 Create `src/features/remunerations/data/queries.ts` for list/detail reads, export read helpers, selectable options, access-resource loading, where/orderBy construction, includes/selects, and read-model mapping.
- [x] 3.2 Create `src/features/remunerations/data/mutations.ts` for update, delete, restore, and persisted-state guards.
- [x] 3.3 Move Prisma imports out of route-facing remuneration API modules into the new data modules.
- [x] 3.4 Preserve session-derived firm, employee, and admin scope behavior for lists, details, options, exports, updates, deletes, and restores.

## 4. API Boundary

- [x] 4.1 Replace split read modules with `src/features/remunerations/api/queries.ts` containing route-facing query and export option factories.
- [x] 4.2 Replace split write modules with `src/features/remunerations/api/mutations.ts` containing route-facing update, delete, and restore mutation option factories.
- [x] 4.3 Preserve existing Portuguese error mapping and `hasExactErrorMessage` behavior for known remuneration errors.
- [x] 4.4 Remove obsolete modules such as `api/get.ts`, `api/update.ts`, `api/delete.ts`, `api/restore.ts`, `api/export.ts`, `api/query.ts`, and `api/resource.ts` once no imports remain.

## 5. Consumers And Barrel

- [x] 5.1 Update remuneration hooks to import mutation and query option factories from the canonical API modules.
- [x] 5.2 Update route or component imports that reference old remuneration API option names.
- [x] 5.3 Keep `src/features/remunerations/index.ts` minimal and route-facing, matching the reference feature barrels.
- [x] 5.4 Verify no external consumer imports from remuneration `data/`, `rules/`, or old internal API modules.

## 6. Verification

- [x] 6.1 Run focused remuneration tests and update test expectations only where the refactor intentionally changes internal names.
- [x] 6.2 Run `pnpm check` and fix all reported issues.
- [x] 6.3 Run `npx tsc --noEmit` and fix all reported issues.
- [x] 6.4 Run `rg` for old names (`validateRemunerationWriteRules`, `api/get`, `api/update`, `api/delete`, `api/restore`, `api/export`, `api/query`, `api/resource`) and remove any stale references.

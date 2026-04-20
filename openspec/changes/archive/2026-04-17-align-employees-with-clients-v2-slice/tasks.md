## 1. Rebuild employee data and API boundaries

- [x] 1.1 Create `src/features/employees/data/queries.ts` and move the current employee list read logic, lookup loading, contract-count enrichment, search translation, and deterministic ordering out of `api/*` while preserving existing list behavior.
- [x] 1.2 Create `src/features/employees/data/mutations.ts` and move employee create, update, delete, and restore persistence logic plus persistence-aware checks out of the current `api/*` modules.
- [x] 1.3 Replace the current employee route-facing server wrappers with canonical `src/features/employees/api/queries.ts` and `src/features/employees/api/mutations.ts` option factories that delegate to `data/*` and preserve the existing authorization and firm-scope behavior.

## 2. Align employee rules and read models

- [x] 2.1 Replace the flat `src/features/employees/rules.ts` with focused modules under `src/features/employees/rules/` and update employee schema/form validation to use `assert...` rule entrypoints.
- [x] 2.2 Split `src/features/employees/schemas/model.ts` into explicit employee summary and detail read models and update feature consumers to stop depending on the legacy all-purpose `Employee` type.
- [x] 2.3 Add the employee detail query boundary needed for edit and details hydration so persisted data is loaded by id through the feature rather than passed from table rows.

## 3. Migrate the route and overlay consumers

- [x] 3.1 Refactor `src/routes/colaboradores.tsx` to use `useOverlay<EntityId>()`, preserve the existing loader-prefetch pattern, and wire create, edit, delete, restore, and details overlays through ids instead of row objects.
- [x] 3.2 Update employee table, form, details, delete, and restore components plus their hooks to consume id-based overlay flows and feature-owned detail hydration without changing current Portuguese UI copy or lifecycle behavior.
- [x] 3.3 Reduce `src/features/employees/index.ts` to the canonical minimal route-facing barrel and update imports so routes consume only the public employee surface.

## 4. Verify behavior and finish the refactor

- [x] 4.1 Update or add focused employee tests so rule-module validation, schema boundaries, and id-based detail/edit flows remain covered after the refactor.
- [x] 4.2 Run `pnpm check` and fix all reported issues.
- [x] 4.3 Run `npx tsc --noEmit` and fix all reported issues before marking the change complete.

## 1. Rebuild contract data and API boundaries

- [x] 1.1 Create `src/features/contracts/data/queries.ts` and move the current contract list, detail, option-query, lookup-resolution, and access-resource read logic out of `api/*` while preserving existing search, sorting, authorization, and tenant-scope behavior.
- [x] 1.2 Create `src/features/contracts/data/mutations.ts` and move contract create, update, delete, and restore persistence logic plus persistence-aware lifecycle and aggregate checks out of the current `api/*` modules.
- [x] 1.3 Replace the current contract route-facing server wrappers with canonical `src/features/contracts/api/queries.ts` and `src/features/contracts/api/mutations.ts` option factories that delegate to `data/*` and preserve the existing query and mutation surface.

## 2. Align contract rules and read models

- [x] 2.1 Replace the flat `src/features/contracts/rules.ts` with focused modules under `src/features/contracts/rules/` and update contract schemas plus write boundaries to use `assert...` rule entrypoints for pure non-Prisma assertions.
- [x] 2.2 Split `src/features/contracts/schemas/model.ts` into explicit contract summary and detail read models and update feature consumers to stop depending on the legacy all-purpose `Contract` type.
- [x] 2.3 Add or update the contract detail query boundary needed for edit and details hydration so persisted aggregate data is loaded by id through the feature rather than passed from table rows.

## 3. Migrate the route and overlay consumers

- [x] 3.1 Refactor `src/routes/contratos.tsx` to use `useOverlay<EntityId>()`, preserve the existing loader-prefetch pattern, and wire create, edit, delete, restore, and details overlays through ids instead of row objects.
- [x] 3.2 Update contract table, form, details, delete, and restore components plus their hooks to consume id-based overlay flows and feature-owned detail hydration without changing current Portuguese UI copy or contract lifecycle behavior.
- [x] 3.3 Reduce `src/features/contracts/index.ts` to the canonical minimal route-facing barrel and update imports so routes consume only the public contract surface.

## 4. Verify behavior and finish the refactor

- [x] 4.1 Update or add focused contract tests so rule-module validation, schema boundaries, data-boundary behavior, and id-based detail/edit flows remain covered after the refactor.
- [x] 4.2 Run `pnpm check` and fix all reported issues.
- [x] 4.3 Run `npx tsc --noEmit` and fix all reported issues before marking the change complete.

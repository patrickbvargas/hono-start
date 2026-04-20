## 1. Feature Anatomy

- [x] 1.1 Confirm no database migration is required; this change is source-structure-only.
- [x] 1.2 Create `src/features/fees/api/queries.ts`, `src/features/fees/api/mutations.ts`, `src/features/fees/data/queries.ts`, `src/features/fees/data/mutations.ts`, and `src/features/fees/rules/` using the same file roles as `clients_v2`, `employees`, and `contracts`.
- [x] 1.3 Move fee read-model includes, search-to-where translation, deterministic ordering, mapping, detail loading, selectable contract/revenue loading, and fee access-resource loading into `data/queries.ts`.
- [x] 1.4 Move fee create, update, delete, restore, remuneration synchronization, delete-state synchronization, and contract-status synchronization into `data/mutations.ts` without changing transaction boundaries or side-effect order.

## 2. API Boundary And Naming

- [x] 2.1 Rebuild route-facing fee query server functions in `api/queries.ts` so they derive session scope, enforce authenticated access, map known errors, and delegate Prisma work to `data/queries.ts`.
- [x] 2.2 Export canonical fee query option factories named `getFeesQueryOptions`, `getFeeByIdQueryOptions`, `getSelectableFeeContractsQueryOptions`, and `getSelectableFeeRevenuesQueryOptions`.
- [x] 2.3 Rebuild route-facing fee mutation server functions in `api/mutations.ts` so they validate inputs, derive session and role scope, enforce authorization, map known errors, and delegate writes to `data/mutations.ts`.
- [x] 2.4 Export canonical fee mutation option factories named `createFeeMutationOptions`, `updateFeeMutationOptions`, `deleteFeeMutationOptions`, and `restoreFeeMutationOptions`.

## 3. Rules And Consumers

- [x] 3.1 Replace root `src/features/fees/rules.ts` with focused modules under `src/features/fees/rules/`, preserving current validation behavior and using `assert...` names for exported throwing assertions.
- [x] 3.2 Update fee schemas, hooks, components, and tests to import from the new `api/*`, `data/*`, and `rules/*` locations.
- [x] 3.3 Update `src/features/fees/index.ts` to expose only the route-facing public surface, matching the minimal barrel convention used by `clients_v2`, `employees`, and `contracts`.
- [x] 3.4 Update `src/routes/honorarios.tsx` to import and prefetch with `getFeesQueryOptions` through the fee feature barrel.

## 4. Verification

- [x] 4.1 Run the focused fee test suite and update tests only for expected import/name changes.
- [x] 4.2 Run `pnpm check` and fix all reported issues.
- [x] 4.3 Run `npx tsc --noEmit` and fix all reported issues.
- [x] 4.4 Manually review the diff to confirm fee behavior, pt-BR UI copy, tenant scoping, role visibility, remuneration side effects, contract auto-completion behavior, and route UX are unchanged.

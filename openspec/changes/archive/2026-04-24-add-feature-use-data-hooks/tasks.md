## 1. Preparation

- [x] 1.1 Review TanStack Query v5 documentation for `queryOptions`, `useSuspenseQuery`, and query key behavior through Context7 before implementation.
- [x] 1.2 Confirm current route-level `useSuspenseQuery` usage and identify participating feature slices.
- [x] 1.3 Confirm no database migration is required for this change.

## 2. Dashboard Pilot

- [x] 2.1 Add `src/features/dashboard/hooks/use-data.ts` with `useDashboardData(search)` consuming `getDashboardSummaryQueryOptions(search)`.
- [x] 2.2 Export `useDashboardData` from `src/features/dashboard/index.ts`.
- [x] 2.3 Update `src/routes/index.tsx` to consume `useDashboardData(search)` while keeping the loader's `ensureQueryData(getDashboardSummaryQueryOptions(search))`.

## 3. Entity Route Data Hooks

- [x] 3.1 Add `useClientData(search)` in `src/features/clients/hooks/use-data.ts` and route-facing barrel export.
- [x] 3.2 Update `src/routes/clientes.tsx` to consume `useClientData(search)` while keeping loader prefetch through `getClientsQueryOptions(search)`.
- [x] 3.3 Add equivalent `useXData(search)` hooks and barrel exports for employees, contracts, fees, remunerations, and audit logs where routes currently consume primary page data directly.
- [x] 3.4 Update the matching route files to use the new `useXData` hooks without changing overlay, filter, pagination, sorting, or authorization behavior.
- [x] 3.5 Move feature option query hooks into `hooks/use-data.ts` and remove old `hooks/use-options.ts` files.
- [x] 3.6 Normalize multi-option hooks to use `useSuspenseQueries` for multiple unconditional suspense option queries.

## 4. Query Key Factories

- [x] 4.1 Add feature-owned query key factories for features with multiple related query keys, rooted in their existing cache key constants.
- [x] 4.2 Update query option factories to consume the key factories without changing stale times, query functions, or input semantics.
- [x] 4.3 Verify mutation invalidation still targets the intended feature root cache keys.
- [x] 4.4 Replace exported raw cache key invalidation with `featureKeys.all` and keep root cache strings private.
- [x] 4.5 Move query key factories from `constants/cache.ts` to feature `api/queries.ts` modules.
- [x] 4.6 Remove separate raw cache key constants so query key factories own the root tuple directly.
- [x] 4.7 Remove separate `api/query-keys.ts` files and keep key factories beside query options.

## 5. Tests And Verification

- [x] 5.1 Add or update boundary/convention tests to require route-consumed `useXData` hooks to live in `hooks/use-data.ts` and be imported through feature barrels.
- [x] 5.2 Run `pnpm check` and fix all reported issues.
- [x] 5.3 Run `npx tsc --noEmit` and fix all reported issues.
- [x] 5.4 Manually review changed routes to confirm loaders still prefetch with `get...QueryOptions` factories and render components receive the same data shapes.

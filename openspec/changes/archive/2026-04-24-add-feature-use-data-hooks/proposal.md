## Why

Routes currently call `useSuspenseQuery` directly for primary page data while feature hooks already own other feature orchestration concerns such as options, forms, delete, and restore flows. Introducing feature-local `useXData` hooks gives route components clearer vocabulary and keeps route render bodies focused on composition without replacing the existing `queryOptions` factories needed by loaders and cache operations.

## What Changes

- Add a feature-local data hook convention using `src/features/<feature>/hooks/use-data.ts`.
- Name each data hook `useXData`, where `X` is the feature or screen name, such as `useDashboardData` or `useClientData`.
- Move entity option query hooks into the same `use-data.ts` file using existing names such as `useXOptions`.
- Move route render-time `useSuspenseQuery` calls for primary page data into the matching feature-local data hook.
- Keep route loaders using feature `get...QueryOptions` factories and `queryClient.ensureQueryData`.
- Keep React Query option factories in `api/queries.ts` as the canonical reusable query abstraction.
- Introduce feature query key factories where useful for list/detail/option key consistency, without changing query behavior.
- Export route-consumed `useXData` hooks through the feature public barrel only when routes need them.
- No breaking changes.

## Capabilities

### New Capabilities
- `feature-data-hooks`: Defines the feature-local `use-data.ts` hook convention for route-consumed page data orchestration and React Query key ownership.

### Modified Capabilities
- None.

## Impact

- Affected code: `src/features/*/hooks/use-data.ts`, feature public barrels, feature `api/queries.ts`, feature cache key constants, and route files that currently call `useSuspenseQuery` for page data.
- Affected APIs: route-facing feature barrels may export new `useXData` hooks while keeping existing `get...QueryOptions` factories.
- Dependencies: no new package dependencies expected.
- User roles: no role behavior changes; existing session, authorization, and visibility rules remain enforced by existing server query boundaries.
- Multi-tenant implications: no data isolation changes; hooks consume existing tenant-scoped query factories and server functions.

## Non-goals

- Do not create a global `useData` hook or dependency-injection container.
- Do not move server functions, Prisma reads, or business rules into hooks.
- Do not hide query option factories from route loaders, mutation invalidation, tests, or imperative cache APIs.
- Do not change product behavior, query results, authorization, pagination, filters, or sorting.
- Do not convert every query hook at once if a feature has no route-level page data benefit.
- Do not export option hooks publicly unless a route or top-level consumer requires them.

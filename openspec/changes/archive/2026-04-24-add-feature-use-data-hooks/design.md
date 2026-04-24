## Context

Route files currently validate search state, prefetch data in loaders, and call `useSuspenseQuery` in route components for primary page data. Feature slices already use `hooks/` for orchestration concerns such as options, forms, delete, restore, and export flows, so route render code is the remaining place where page data query consumption is still expressed through raw React Query calls.

TanStack Query v5 documents `queryOptions` as a reusable, type-safe query configuration helper that can be shared between `useQuery`, `useSuspenseQuery`, `useQueries`, and `queryClient` methods such as `prefetchQuery` and `setQueryData`. That matches the repository's existing pattern: loaders use feature `get...QueryOptions` factories, while components consume those same factories through React Query hooks.

## Goals / Non-Goals

**Goals:**
- Add a feature-local `hooks/use-data.ts` convention for primary page data hooks.
- Use hook names in the form `useXData`.
- Consolidate feature option query hooks into the same `hooks/use-data.ts` file as separate `useXOptions` functions.
- Keep routes declarative by replacing route render-time `useSuspenseQuery` calls with route-facing feature hooks.
- Preserve existing route loader prefetching through `get...QueryOptions` factories.
- Improve query key consistency through feature-local key factories where the feature has list, detail, or option query variants.

**Non-Goals:**
- Do not introduce Angular-style dependency injection, a React context service container, or a global data registry.
- Do not replace TanStack Query with a custom abstraction layer.
- Do not hide query options from loaders, tests, mutations, or imperative cache APIs.
- Do not change authorization, tenant scoping, pagination, filters, sorting, or server query results.
- Do not move persistence, server functions, or business rules into React hooks.

## Decisions

### Keep `queryOptions` factories as the source of truth

Route-facing query option factories remain in each feature's `api/queries.ts`. `useXData` hooks call those factories, and route loaders continue to call the same factories through `queryClient.ensureQueryData`.

Alternative considered: make `useXData` the only public data API. Rejected because route loaders, prefetching, mutation invalidation, tests, and imperative cache interactions need query keys and query functions outside React render.

### Add one `hooks/use-data.ts` file per participating feature

Each feature that benefits from route page data orchestration gets `src/features/<feature>/hooks/use-data.ts`. The file exports a named hook such as `useClientData(search)` or `useDashboardData(search)`.

Alternative considered: put data hooks inside `api/queries.ts`. Rejected because `api/queries.ts` is the route-facing server wrapper and query option factory boundary; React hook orchestration belongs in `hooks/`.

### Use `use-data.ts` for feature query consumption

`useXData` should represent the data needed by the route body or screen. Option hooks such as `useClientOptions` should live in the same `hooks/use-data.ts` file as separate functions when they serve forms or filters. If a route genuinely needs primary entity data and option data together, `useXData` may compose multiple query consumers and return named values.

Multi-option hooks with multiple unconditional suspense queries should use `useSuspenseQueries` so equivalent entity option hooks share the same orchestration shape. Hooks with optional or `enabled` queries should keep `useQuery` for the conditional part instead of forcing suspense.

Alternative considered: create `useXData` hooks that aggregate every feature query. Rejected because broad hooks over-fetch, couple unrelated workflows, and make disabled/lazy queries harder to express.

### Prefer feature query key factories for evolving key structures

Features with multiple related queries should define a local key factory in `api/queries.ts`, then consume it from query option factories and mutation invalidation hooks. This keeps list, detail, and option keys consistent without adding a second API file.

Alternative considered: keep manual array literals everywhere. Accepted for very small features, but less suitable where list/detail/options already exist because key shape changes become repetitive and error-prone.

### Invalidate through feature key factories

Feature mutation hooks should invalidate broad feature caches with `featureKeys.all` instead of raw cache key strings. The key factory object in `api/queries.ts` is the only cache-key shape; it owns the root tuple directly in `all`.

Alternative considered: keep exporting `ENTITY_DATA_CACHE_KEY` and pass strings to shared invalidation helpers. Rejected because it creates two public cache APIs and lets invalidation drift away from the feature key factory.

## Risks / Trade-offs

- Route loaders and data hooks drift to different query options -> Mitigation: both must call the same feature `get...QueryOptions` factory.
- Over-broad `useXData` hooks fetch unused data -> Mitigation: each hook should serve one route/screen data contract and avoid aggregating unrelated form/detail/option queries by default.
- Public barrels leak too many internals -> Mitigation: export only route-consumed `useXData` hooks and keep internal hook helpers private.
- Query key factory refactor accidentally changes cache invalidation behavior -> Mitigation: preserve existing root cache constants and validate mutation invalidation still targets the intended feature root.

## Migration Plan

1. Implement the pattern on a small representative slice, starting with `dashboard`.
2. Migrate entity list routes incrementally by adding `hooks/use-data.ts`, exporting `useXData`, and replacing only route render-time `useSuspenseQuery` calls.
3. Introduce key factories feature-by-feature where they reduce existing manual key duplication.
4. Keep all `get...QueryOptions` exports until no route loader, mutation hook, test, or cache utility needs them, which is not expected in this change.

Rollback is straightforward: route components can return to direct `useSuspenseQuery(get...QueryOptions(...))` calls because query option factories remain unchanged.

## Open Questions

- Should this change migrate every route-level page query in one pass, or start with dashboard plus one entity route and then repeat after review?
- Should key factories be required for all features immediately, or introduced only for features with more than one query key variant?

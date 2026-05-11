# Route Prefetch Checklist

Use this checklist when creating or reviewing list routes that use loader prefetch, suspense hooks, and `RouteLoading`.

## Loader Checklist

- `validateSearch` uses the feature search schema.
- `loaderDeps` forwards validated `search`.
- The loader uses `Promise.all([...])` for the first-render query set.
- The loader prefetches the primary list query with `queryClient.ensureQueryData(...)`.
- The loader also prefetches every unconditional option query required by the header or filter on first render.
- The loader does not prefetch unrelated option queries just because a broader feature hook exists.

## Route UI Checklist

- The route consumes primary list data through the feature barrel hook, not `useSuspenseQuery` inline.
- The route renders `RouteLoading` in the header area so filter and pagination changes keep the page shape stable.
- The route does not define `pendingComponent` or `pendingMs` for list navigation feedback.
- The route keeps composition-only responsibilities: wrapper, filter, table, overlays, permissions.

## Suspense Checklist

- The first-render filter/header option hook lives in `hooks/use-data.ts`.
- Single unconditional option queries use `useSuspenseQuery`.
- Multiple unconditional option queries use one `useSuspenseQueries({ queries: [...] })`.
- Hooks return named fields, not raw React Query result objects.
- If the route mounts a suspending component on first paint, the loader prefetch matches that hook's unconditional queries exactly.
- If a component needs fewer options than a broader feature flow, use a narrower hook for that component.

## Smell Checklist

- First access to the route shows a blank area before content appears.
- Changing filter or page replaces the whole route instead of preserving header state.
- A filter component imports a broad option hook but only renders part of its data.
- The loader prefetched fewer queries than the mounted suspending filter consumes.
- The route imports `hooks/use-data.ts` directly instead of through the feature barrel.

## Current App Targets

Review these files first when this pattern changes:

- `src/routes/_app/index.tsx`
- `src/routes/_app/clientes.tsx`
- `src/routes/_app/colaboradores.tsx`
- `src/routes/_app/contratos.tsx`
- `src/routes/_app/honorarios.tsx`
- `src/routes/_app/remuneracoes.tsx`
- `src/routes/_app/auditoria.tsx`
- `src/features/__tests__/frontend-orchestration-boundaries.test.ts`
- `src/features/remunerations/__tests__/route-contract.test.ts`

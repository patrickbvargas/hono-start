## Why

The current `use-data.ts` pattern stops at route-level primary page data, so many feature components still call `useSuspenseQuery` or `useQuery` directly for detail, delete, restore, and section-level data reads. That keeps query consumption scattered across render components instead of consolidating it behind feature-owned hooks, which makes the intended orchestration boundary incomplete.

## What Changes

- Extend the feature data hook convention so feature components consume feature query data through custom hooks in `src/features/<feature>/hooks/use-data.ts`, not direct React Query calls in component render files.
- Prefer concise entity-shaped hook names across all participating features, using plural names for collections and singular names for single-entity reads, with screen-specific names reserved for cases where the screen contract is clearer than the entity name.
- Allow shared feature-local hooks to back multiple overlays when they read the same entity data, such as detail, delete, and restore components sharing one detail hook.
- Keep route loaders, form hooks, mutation orchestration, tests, and imperative cache access on the existing `get...QueryOptions` factories in `api/queries.ts`.
- Preserve the existing route-level `useXData(search)` pattern and broaden it to cover feature-owned component consumption rather than only route bodies.
- Add boundary tests that fail when feature components consume TanStack Query data directly instead of going through feature data hooks.
- No breaking changes.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `feature-data-hooks`: broaden the hook abstraction requirement from route-consumed page data to feature-consumed query data across list, detail, lifecycle confirmation, and equivalent feature component orchestration.

## Impact

- Affected code: `src/features/*/hooks/use-data.ts`, feature detail/delete/restore/section components, feature public barrels where route-facing hooks are exported, and boundary tests under `src/features/__tests__/`.
- Affected APIs: feature-local custom hook surfaces may grow with detail-oriented hooks, but query option factories remain available as the reusable boundary for loaders, cache work, and tests.
- Dependencies: no new package dependencies expected.
- User roles: no role or permission changes; existing session and authorization behavior stay in the current server and session boundaries.
- Multi-tenant implications: no tenant isolation changes; new hooks continue consuming the same tenant-scoped query factories and server functions.

## Non-goals

- Do not introduce a global service locator, React context registry, or Angular-style runtime DI container.
- Do not replace TanStack Query with a custom data framework.
- Do not move server functions, Prisma queries, business rules, authorization decisions, or persistence mapping into hooks.
- Do not remove `get...QueryOptions` factories from `api/queries.ts` or hide them from loaders, tests, mutations, or cache utilities.
- Do not change product behavior, loaded data shape, filters, sorting, pagination, or mutation side effects.

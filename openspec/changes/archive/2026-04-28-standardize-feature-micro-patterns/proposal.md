## Why

The repository already converges on a strong feature-slice pattern, but several small mechanics still drift across features, especially around public barrel surfaces, option-query consumption, and `hooks/use-data.ts` behavior. That drift makes new work slower and more error-prone because contributors must infer whether a difference is intentional or accidental.

## What Changes

- Standardize the public `index.ts` barrel contract for feature slices so equivalent route-facing consumers see the same categories of exports.
- Tighten the `feature-data-hooks` contract so feature-owned query consumption follows one consistent logic for collection data, single-entity data, and option data across all feature slices.
- Define a repository-wide micro-pattern for overlay and table props so equivalent lifecycle and detail flows prefer `id: EntityId` and id-based callbacks instead of ad hoc row-object contracts.
- Update implementation docs to explicitly cover the small feature mechanics that are currently split between examples, tests, and partial conventions.
- Extend boundary tests so regressions in barrel shape, query-consumption placement, and equivalent hook behavior fail fast.
- No breaking changes to product behavior, routes, permissions, or persistence contracts.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `entity-foundation`: clarify the canonical small feature contracts for public barrels, equivalent prop shapes, and cross-feature ownership consistency.
- `feature-data-hooks`: require one consistent feature-local data-consumption pattern for collection, entity, and option queries across feature slices.

## Impact

- Affected code: `src/features/*/index.ts`, `src/features/*/hooks/use-data.ts`, selected feature components and tests under `src/features/__tests__/`, and the implementation docs under `docs/implementation/`.
- Affected APIs: feature public barrels and feature-local hook surfaces may be normalized, but route URLs, business behavior, and server boundaries remain unchanged.
- Dependencies: no new runtime dependencies expected.
- User roles: no role or permission changes.
- Multi-tenant implications: none; tenant scoping and authorization remain in existing server and session boundaries.

## Non-goals

- Do not redesign business workflows or force all features into one domain shape.
- Do not replace TanStack Query, route loaders, or existing query option factories.
- Do not move server functions, Prisma reads/writes, or business rules into hooks.
- Do not change route URLs, search semantics, mutation side effects, or user-facing product behavior.

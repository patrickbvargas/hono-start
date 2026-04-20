## Why

The repository contract now names `src/features/clients_v2` as the reference slice for entity-management work, but `src/features/employees` still follows an older, transitional shape. That mismatch makes employees harder to maintain and weakens the value of the documented house pattern because two competing implementations now exist for the same route-model, query, and overlay conventions.

Today, the employees feature still mixes persistence logic into `api/*`, keeps pure business assertions in a flat `rules.ts`, passes full row objects through route overlays, and uses a single list model for table, edit, and details flows. `clients_v2` already proves the intended pattern: thin route composition, `api/queries.ts` plus `api/mutations.ts` boundaries, Prisma work in `data/*`, focused rules modules, id-based overlays, detail-query hydration, and a minimal route-facing barrel.

Refactoring employees to match `clients_v2` removes architectural drift before more entity slices copy the older employees structure.

## What Changes

- Reshape `src/features/employees` to the canonical slice anatomy from `clients_v2`, including `api/queries.ts`, `api/mutations.ts`, `data/queries.ts`, `data/mutations.ts`, `rules/`, and feature-local read-model mapping before schema parsing.
- Move Prisma-backed employee reads and writes out of the current `api/*.ts` files into `data/*`, leaving `api/*` as route-facing server wrappers and React Query option factories only.
- Replace the flat `rules.ts` file with focused rule modules under `rules/` so employee write assertions, lookup-selection assertions, and lifecycle assertions follow the documented house pattern.
- Split employee read contracts into list/detail-oriented models so route overlays can pass ids instead of entire employee summary objects, matching the `clients_v2` detail flow.
- Refactor the `/colaboradores` route to use id-based overlay state for edit, delete, restore, and details flows, with detail hydration handled by feature queries instead of row snapshots from the table.
- Align the employees feature barrel with the minimal public-surface rule so routes consume only the search schema, query options, top-level UI components, and any route-needed model types.
- Preserve the current employee business behavior, route path, Portuguese UI copy, and existing filter semantics unless a specific mismatch with the contract is discovered during the refactor.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `employee-management`: Refactor the employees slice so it conforms to the canonical `clients_v2` entity-management architecture without changing the intended product behavior.
- `entity-foundation`: Reinforce `clients_v2` as the reference slice by removing the remaining legacy architectural pattern from employees.

## Non-goals

- No new employee business rules, permissions, or product-scope expansion.
- No route-path changes, no new employee fields, and no UX redesign beyond what is necessary to support the canonical overlay/data-loading pattern.
- No extraction of employee-specific code into `shared/` unless the refactor exposes an already-proven primitive used by multiple slices.
- No implementation of unrelated entity features such as contracts, revenues, or remunerations.

## Impact

- Affected code: `src/features/employees/**`, `src/routes/colaboradores.tsx`, and any shared helper touched only to preserve the documented route and query boundary.
- Affected docs/specs: `employee-management`; potentially `entity-foundation` if the current spec language still describes employees as the reference slice instead of `clients_v2`.
- Affected roles: no permission change; administrators keep management access and non-managers remain outside the route.
- Main technical outcome: one canonical entity-management pattern across both `clients_v2` and `employees`, reducing duplication and lowering the cost of future feature slices.

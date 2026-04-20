## Why

The repository contract now treats `src/features/clients_v2` as the canonical entity-management slice, and `src/features/employees` has already been refactored to follow the same pattern. `src/features/contracts` is now the main remaining entity slice that still carries the older structure: Prisma-backed reads and writes live directly in `api/*`, aggregate access helpers are split across route-facing modules, the feature keeps a flat `rules.ts`, and the route still opens overlays with full contract row objects instead of id-based hydration.

That drift matters more in contracts than in simpler slices because contracts are the largest operational aggregate in the product. The feature owns list filtering, detail access, aggregate create/update writes, lookup-backed options, lifecycle actions, assignment composition rules, and revenue summary mapping. Keeping that scope on the older structure makes the contracts feature harder to trace, harder to test consistently, and more likely to become the exception that future slices accidentally copy.

Refactoring contracts to follow the same pattern as `clients_v2` and `employees` removes that remaining structural fork before more downstream work lands on top of it.

## What Changes

- Reshape `src/features/contracts` to the canonical slice anatomy used by `clients_v2` and `employees`, including `api/queries.ts`, `api/mutations.ts`, `data/queries.ts`, `data/mutations.ts`, segmented `rules/`, and a minimal route-facing `index.ts`.
- Move Prisma-backed contract reads, option loading, lookup resolution, resource access queries, and persistence-aware writes out of the current `api/get.ts`, `api/create.ts`, `api/update.ts`, `api/delete.ts`, `api/restore.ts`, `api/lookups.ts`, and `api/resource.ts` modules into `data/*`, leaving `api/*` as route-facing server wrappers and React Query option factories only.
- Split the flat `rules.ts` into focused rule modules under `rules/` so pure aggregate write assertions, assignment assertions, and lifecycle assertions become easier to discover and align with the documented `assert...` rule-entrypoint convention.
- Refactor contract read-model mapping so list and detail reads are mapped explicitly before schema parsing, following the same feature-owned read-model contract used by `clients_v2` and `employees`.
- Refactor the `/contratos` route and contract overlays to use id-based overlay state for edit, details, delete, and restore flows, with detail hydration performed by feature queries instead of row snapshots from the list result.
- Align the contract form hook with the current house pattern used by `employees`, where edit mode hydrates defaults from the feature detail query rather than receiving a full contract object from the route.
- Preserve the current contract business rules, permissions, Portuguese copy, route path, search/filter semantics, and aggregate behavior unless a contract-doc mismatch is discovered during the refactor and explicitly captured in a follow-up spec update.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `contract-management`: Refactor the contracts slice so it matches the canonical `clients_v2` entity-management architecture without changing intended contract behavior.
- `entity-foundation`: Extend the canonical slice-pattern alignment from `clients_v2` and `employees` to `contracts`, so the main entity-management features follow the same ownership boundaries.
- `form-validation-boundaries`: Align the contracts write flow, detail hydration flow, and route-to-feature orchestration with the same boundary contract already used by the reference slices.

## Non-goals

- No new contract business rules, status semantics, permissions, or route-path changes.
- No redesign of the contracts UI beyond what is required to support id-based overlays and canonical detail hydration.
- No behavioral rewrite of revenue, fee, or remuneration logic beyond moving existing contract-owned persistence and validation responsibilities into the documented slice boundaries.
- No extraction of contract-specific business logic into `shared/` unless the refactor exposes an already-proven generic primitive used by multiple slices.
- No implementation of new contract subfeatures such as fee management, attachments, or status automation beyond preserving current behavior.

## Impact

- Affected code: `src/features/contracts/**`, `src/routes/contratos.tsx`, and any shared helper touched only to preserve the documented overlay and query boundary.
- Affected docs/specs: `contract-management`; potentially `entity-foundation` and `form-validation-boundaries` if their current spec language needs to reflect contracts joining the canonical slice pattern.
- Affected roles: no permission changes; administrators keep lifecycle controls and regular users keep assignment-scoped access.
- Multi-tenant impact: no change in tenant boundaries; the refactor continues deriving firm scope and role-aware access from the authenticated session.
- Main technical outcome: `clients_v2`, `employees`, and `contracts` converge on one practical entity-management pattern, reducing architectural drift in the repository's highest-value feature slices.

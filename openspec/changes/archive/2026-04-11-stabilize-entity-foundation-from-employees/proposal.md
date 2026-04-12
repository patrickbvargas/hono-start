## Why

The employees feature is the first real domain slice in the codebase, but it is not yet stable enough to serve as the reference implementation for clients, contracts, revenues, and other entities. The current code proves the general slice structure, yet core cross-entity conventions are still inconsistent across route access, list filtering, lookup option loading, and server-side validation.

Starting new entities before those conventions are stabilized would turn the current employees slice into copy-paste debt. This change makes employees the canonical reference by first extracting and formalizing the shared patterns that other entity implementations will depend on.

## What Changes

- Define a shared entity foundation contract for list screens covering URL-driven search, filtering, sorting, pagination, cache key structure, overlay flows, and mutation refresh behavior.
- Align the employees feature to that contract so it becomes the baseline slice for future entity implementations.
- Standardize the separation between soft-delete state and active/inactive state in employee list and filter behavior.
- Require lookup option queries used by entity forms to return only selectable rows according to shared active-state rules.
- Strengthen employee create and update rules so documented business validation is enforced consistently in both UI and server flows.
- Require administrator-only entity-management routes and mutations to use the shared session authorization helpers as the authoritative boundary.
- Preserve existing product scope by focusing on foundation and consistency, not on introducing new business entities.

## Capabilities

### New Capabilities
- `entity-foundation`: Shared cross-entity conventions for list/search/filter/sort/pagination, option-query behavior, route-level management flows, and reference implementation boundaries for future domain slices.

### Modified Capabilities
- `employee-management`: Employee management must become the canonical reference slice and fully align with the shared entity foundation, validation rules, and authorization boundaries.
- `employee-filter-ui`: Employee filter semantics must distinguish soft-delete status from `isActive` state using a stable URL and UI contract that other entities can reuse.
- `lookup-reference-data`: Lookup option queries used by entity forms must follow a shared selectable-options rule so inactive lookup rows are excluded consistently.
- `session-authorization`: Management routes and server mutations must rely on shared session authorization helpers as the authoritative source for admin-only access and firm scoping.

## Non-goals

- Implementing clients, contracts, revenues, fees, remunerations, attachments, or audit log features.
- Replacing the current feature-slice architecture with a different architectural style.
- Adding real authentication, BetterAuth flows, or session persistence changes beyond the existing shared authorization boundary.
- Generalizing every employee-specific component into shared code immediately; only stable patterns should move into the foundation.

## Impact

- Affected code: `src/features/employees/**`, `src/routes/colaboradores.tsx`, `src/shared/session/**`, shared list/filter/pagination primitives, and shared option-query helpers.
- Affected specs: `employee-management`, `employee-filter-ui`, `lookup-reference-data`, and `session-authorization`, plus a new `entity-foundation` capability.
- Affected roles: administrators gain consistent management enforcement; regular users continue to be denied employee-management access.
- Multi-tenancy: all entity-management queries and mutations remain firm-scoped from the authenticated session, with the server helper as the authoritative source.

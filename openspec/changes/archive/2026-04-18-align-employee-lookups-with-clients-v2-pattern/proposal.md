## Why

`src/features/clients_v2` is the documented reference slice for this repository, but `src/features/employees` still carries older naming, internal boundary, and responsibility-shape differences. That makes the employee feature harder to maintain, weakens the value of the house pattern, and leaves future entity work without one fully consistent reference across equivalent slices.

The lookup-validation difference is part of that larger drift, not the whole change. Employees is the best next candidate for convergence because it already shares the same broad slice anatomy as `clients_v2`; what remains is to align the finer-grained implementation pattern, naming, and responsibility split so both features read as the same house style with employee-specific behavior layered on top.

## What Changes

- Refactor `src/features/employees` to follow the same implementation pattern as `src/features/clients_v2` for equivalent responsibilities, naming, and internal boundaries.
- Align employee feature naming with the current client reference where both slices perform the same job, including query/mutation boundaries, rule responsibilities, constants access, and form-orchestration conventions.
- Rework employee lookup-backed validation as one part of that broader alignment so employee `type` and `role` follow the same responsibility split used by clients while still supporting employee-specific rules.
- Keep employee-only behavior where the domain requires it, such as role validation, OAB rules, remuneration/referral rules, and any multi-lookup orchestration that cannot be flattened without losing clarity.
- If the employee refactor reveals a better name for an equivalent shared responsibility, sync that rename in `clients_v2` too instead of leaving the slices semantically misaligned.
- Preserve current route paths, permissions, Portuguese UI copy, search contracts, and intended business behavior for both features.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `employee-management`: refactor the employee feature so it follows the `clients_v2` reference pattern for equivalent responsibilities while preserving employee-specific business behavior, including the current inactive-option and edit-default semantics.
- `entity-foundation`: clarify that equivalent feature-slice responsibilities use aligned naming and boundary shapes across `clients_v2`, `employees`, and future entity slices.
- `form-validation-boundaries`: clarify that multi-lookup features extend the reference validation pattern without collapsing pure rules, lookup resolution, and persistence-aware checks into aggregate validators.

## Impact

- Affected code: `src/features/employees/**`, `src/routes/colaboradores.tsx` if route-facing names or consumers need alignment, and `src/features/clients_v2/**` only where a repository-wide naming sync is required.
- Affected specs: `openspec/specs/employee-management/spec.md`, `openspec/specs/entity-foundation/spec.md`, and `openspec/specs/form-validation-boundaries/spec.md`.
- Affected roles: no permission change; administrators keep employee-management access and all other roles keep current restrictions.
- Multi-tenant impact: none in behavior, but the refactor must preserve session-derived firm scoping and server-authoritative lookup validation.

## Non-goals

- No new employee or client fields.
- No change to route URLs, overlay behavior, or visible copy beyond incidental terminology cleanup.
- No change to business rules such as OAB requirements, referral percentage validation, client-type immutability, or inactive lookup semantics.
- No extraction to `shared/` unless a stable cross-feature abstraction is already proven by both slices.

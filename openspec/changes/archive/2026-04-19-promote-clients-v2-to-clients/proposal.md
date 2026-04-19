## Why

The repository now has two client feature implementations: the old `src/features/clients` slice and the newer `src/features/clients_v2` slice that the route and implementation docs already treat as the canonical reference. Keeping the `_v2` suffix makes the intended implementation look transitional and leaves a stale feature path available for accidental imports.

## What Changes

- **BREAKING** Replace the old `src/features/clients` implementation with the current `src/features/clients_v2` implementation.
- **BREAKING** Rename the promoted feature path from `src/features/clients_v2` to `src/features/clients`.
- Update route imports, tests, documentation, and OpenSpec specs so the canonical client feature path is `src/features/clients`.
- Remove the obsolete client implementation instead of keeping both slices or adding a compatibility alias.
- Preserve current `/clientes` product behavior, pt-BR copy, server-driven list behavior, overlay flow, authorization, validation, and client business rules.

## Non-goals

- Do not redesign client-management behavior, validation semantics, permissions, or the `/clientes` route UX.
- Do not change the documented stack, route model, or shared UI patterns.
- Do not refactor unrelated feature slices except where references to the client reference slice must be renamed.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `client-management`: Require the promoted `src/features/clients` slice to be the authoritative client-management implementation while preserving existing client behavior.
- `entity-foundation`: Replace `src/features/clients_v2` references with `src/features/clients` as the canonical reference slice for feature structure, ownership boundaries, list behavior, option-query behavior, protected mutation flows, and route-facing public surface.
- `form-validation-boundaries`: Replace `clients_v2` reference wording with the promoted `clients` slice name for rule and schema boundary expectations.

## Impact

- Affected code: `src/features/clients/**`, `src/features/clients_v2/**`, `src/routes/clientes.tsx`, feature public-barrel tests, and any source imports or comments that reference `clients_v2`.
- Affected docs/specs: implementation docs that name `clients_v2`, OpenSpec specs that name `clients_v2`, and archived examples only if active tooling or tests require reference cleanup.
- Affected users: no role or tenant behavior changes; administrators and regular users should see the same client-management behavior after the replacement.
- Multi-tenant implications: unchanged; the promoted slice must preserve existing firm-scoped reads, writes, option queries, and authorization checks.

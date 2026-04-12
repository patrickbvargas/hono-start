## Why

The codebase already documents lookup rows as being referenced by their stable `value`, never by database `id`, but the current employee form and filter contracts still use numeric ids on the client. That mismatch forces UI code to search option arrays for business meaning, duplicates filter schemas for URL parsing versus normalized state, and makes lookup-backed URLs depend on environment-specific ids.

## What Changes

- Change lookup-backed client contracts so forms, field components, and URL filter state use lookup `value` strings instead of database ids.
- Update shared field option primitives so `FieldOption` receives `value` as its selection key rather than `id`.
- Reuse the shared `Option` payload contract for employee lookup queries instead of feature-specific option transforms.
- Resolve lookup `value` strings to relational ids at the server boundary for Prisma filters and mutations.
- Simplify employee business rules so lawyer-only OAB handling compares stable lookup values directly in the form and validation layer.
- Align specs and docs around one canonical rule: lookup labels and active state come from the database, while client-side identity uses stable lookup values.
- **BREAKING** Employee list URL filter params for lookup-backed fields move from numeric ids to lookup values.

## Capabilities

### New Capabilities

### Modified Capabilities
- `employee-management`: Employee forms and lookup-backed filters use stable lookup values in client state while server handlers continue persisting relational ids.
- `lookup-reference-data`: Lookup option payloads expose stable value-based identity for shared field components while remaining ordered by `label` and respecting disabled inactive rows.
- `entity-foundation`: Shared form and URL-state contracts for lookup-backed options use stable values instead of environment-specific ids.

## Non-goals

- Replacing Prisma lookup tables with enums.
- Changing database schema for employee relations away from `typeId` and `roleId`.
- Reworking business-entity option queries that are supposed to stay id-based and active-only.
- Adding lookup administration screens or changing multi-tenant boundaries.

## Impact

- Affected code: `src/shared/types/field.ts`, shared form field components, shared option schemas, employee form/filter/search schemas, employee constants, and employee server functions that resolve lookup values to ids.
- Affected docs/specs: `docs/CONVENTIONS.md`, `docs/PRD.md`, `docs/DATA_MODEL.md`, `openspec/specs/employee-management/spec.md`, `openspec/specs/lookup-reference-data/spec.md`, and `openspec/specs/entity-foundation/spec.md`.
- Affected roles: administrators using employee create/edit and employee list filters.
- Multi-tenancy: unchanged, because lookup resolution still happens inside firm-scoped server handlers and lookup tables remain global reference data.

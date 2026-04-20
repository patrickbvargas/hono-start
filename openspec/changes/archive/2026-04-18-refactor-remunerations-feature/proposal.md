## Why

The remunerations feature predates the canonical feature-slice pattern now used by `clients_v2`, `employees`, `contracts`, and `fees`, leaving its API, data access, and rules boundaries inconsistent with the documented architecture. Refactoring it now removes a local exception in a financial feature where rule discoverability and server-side ownership need to be predictable.

## What Changes

- Refactor `src/features/remunerations` to use the canonical slice anatomy: `api/queries.ts`, `api/mutations.ts`, `data/queries.ts`, `data/mutations.ts`, `rules/`, `schemas/`, `hooks/`, `components/`, `constants/`, `utils/`, and a minimal route-facing `index.ts`.
- Replace the top-level `src/features/remunerations/rules.ts` validation collector with explicit throwing assertion modules under `src/features/remunerations/rules/`.
- Rename exported pure remuneration rule entrypoints to `assert...` functions that throw on failure, matching `clients_v2`, `employees`, `contracts`, and `fees`.
- Move Prisma-backed reads, writes, read-model mapping, persisted resource checks, and option loading out of route-facing API modules and into `data/`.
- Keep route-facing server functions and React Query option factories in `api/queries.ts` and `api/mutations.ts`.
- Preserve existing remuneration behavior, including role-aware visibility, tenant isolation, administrator-only manual override updates, soft delete, restore, export, and list/detail workflows.
- Update tests so they assert the new rule boundary, API/data split, and preserved remuneration behavior.

## Non-goals

- Do not change remuneration business semantics, calculation formulas, role permissions, or UI copy.
- Do not change the database schema or introduce a Prisma migration unless an existing implementation defect makes it unavoidable.
- Do not rewrite unrelated feature slices or shared infrastructure.
- Do not introduce new public imports from remuneration internals outside the feature barrel.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `remuneration-management`: Update the remuneration implementation contract so pure business rules live under `src/features/remunerations/rules/` and export throwing `assert...` functions, while route-facing API and Prisma-backed data access follow the canonical slice pattern.
- `form-validation-boundaries`: Clarify that the remunerations feature now follows the canonical `assert...` rule boundary and API/data split used by the reference feature slices.

## Impact

- Affected code: `src/features/remunerations/**`, remuneration route imports if they reference renamed query or mutation option factories, and feature-local remuneration tests.
- Affected APIs: internal feature exports may be renamed to match canonical query and mutation option naming; public route-facing behavior must remain equivalent.
- Affected roles: administrators keep firm-wide remuneration management and manual override permissions; regular users keep scoped remuneration visibility.
- Multi-tenant implications: all refactored query and mutation paths must continue deriving `firmId`, `employeeId`, and admin scope from the authenticated server session.
- Dependencies: no new runtime dependencies are expected.

## Context

`src/features/remunerations` currently implements the visible remuneration workflow, but its internal boundaries differ from the repository's canonical feature slices. Reads, option queries, access-resource loading, persistence writes, route-facing server functions, and read-model mapping are spread across files under `api/`, while pure business rules live in a top-level `rules.ts` file that exports `validate...` functions returning issue arrays.

The documented architecture and current reference features use a stricter shape: route-facing server wrappers in `api/queries.ts` and `api/mutations.ts`, Prisma-backed work in `data/queries.ts` and `data/mutations.ts`, and pure throwing assertions under `rules/` with exported `assert...` names. This matters for remunerations because the feature handles financial values, role-scoped visibility, administrator-only manual overrides, and tenant isolation.

## Goals / Non-Goals

**Goals:**

- Make `src/features/remunerations` match the canonical slice shape used by `clients_v2`, `employees`, `contracts`, and `fees`.
- Move Prisma reads, writes, resource access checks, option loading, and read-model mapping into `data/`.
- Consolidate route-facing query and mutation option factories into `api/queries.ts` and `api/mutations.ts`.
- Replace `validateRemunerationWriteRules` with throwing `assert...` functions under `rules/`.
- Preserve current list, detail, update, delete, restore, export, filtering, sorting, cache invalidation, and toast behavior.
- Preserve role-aware visibility and firm-scoped server authority from the authenticated session.

**Non-Goals:**

- No remuneration formula change.
- No permission model change.
- No database schema change.
- No UI redesign.
- No refactor of unrelated feature slices.

## Decisions

### Use the existing reference slice names exactly

Create `api/queries.ts`, `api/mutations.ts`, `data/queries.ts`, `data/mutations.ts`, and `rules/write.ts` for remunerations. Remove or stop exporting old split API modules such as `api/get.ts`, `api/update.ts`, `api/delete.ts`, `api/restore.ts`, `api/export.ts`, `api/query.ts`, and `api/resource.ts` after their responsibilities have moved.

Alternative considered: keep the old files as compatibility wrappers. That would preserve two valid local patterns and keep the feature as an exception, which is the problem this change is meant to remove.

### Keep server-function wrappers in `api/`

`api/queries.ts` will own React Query option factories and `createServerFn` read/export handlers. `api/mutations.ts` will own mutation option factories and write handlers. These files will derive session scope, call authorization helpers, translate unknown errors into feature errors, and delegate persistence work to `data/`.

Alternative considered: move `createServerFn` handlers into `data/`. That conflicts with the documented boundary and the reference features.

### Move persisted remuneration logic into `data/`

`data/queries.ts` will own:

- list/detail queries
- selectable contract and employee option queries
- remuneration access-resource loading
- where/orderBy construction
- Prisma include/select definitions
- raw-row to `Remuneration` mapping

`data/mutations.ts` will own:

- update persistence for manual overrides
- soft delete
- restore
- persisted state guards such as deleted remuneration and deleted parent fee checks

Alternative considered: keep resource access in `api/resource.ts`. The reference slices put persisted query helpers under `data/`, and keeping this separate would preserve another local exception.

### Rules export only throwing assertions

Create `rules/write.ts` with exported functions such as `assertRemunerationAmountPositive`, `assertRemunerationEffectivePercentageRange`, and `assertRemunerationWriteRules`. These functions will throw `Error` with `REMUNERATION_ERRORS` messages on invalid input. Non-throwing issue collectors will not be exported from `rules/`.

Schemas can keep Zod's path-aware errors by calling the assertions inside `superRefine` and mapping caught error messages to the relevant paths. The exported rule boundary remains throwing and `assert...`-named.

Alternative considered: return `ValidationIssue[]` from rules and wrap that in API code. That contradicts the requested target pattern and the implementation contract.

### Preserve public feature behavior while allowing internal export renames

The public `src/features/remunerations/index.ts` should expose route-facing query options, components, search schema, and route-consumed types only. Route imports should be updated to the canonical names if query and mutation option factories are renamed.

Alternative considered: export every internal helper to minimize import edits. That would leak implementation details through the feature barrel and violate the public barrel rule.

## Risks / Trade-offs

- Query or mutation behavior changes during file moves -> Keep the first implementation pass mechanical, then run feature tests and search route imports for old module paths.
- Zod error paths regress when changing from issue collectors to assertions -> Add focused schema tests for amount and percentage validation messages.
- Authorization scope regresses when moving resource loading -> Keep session-derived scope in API wrappers and keep resource lookup firm-scoped in `data/queries.ts`.
- Export behavior regresses because it shares list query helpers -> Reuse the same where/orderBy/map helpers for list and export.
- Old internal imports linger -> Use `rg` for old filenames and exported names before finishing implementation.

## Migration Plan

1. Add the new `rules/`, `data/`, and canonical `api/` modules.
2. Move existing behavior into the new modules without changing business semantics.
3. Update hooks, components, the feature barrel, routes, and tests to consume the canonical API.
4. Remove obsolete remuneration modules once no imports remain.
5. Run focused remuneration tests, then the broader affected test suite and typecheck.

Rollback is a code-only revert of this change because no data migration is expected.

## Open Questions

- None. The user explicitly requested the final implementation to match the reference feature pattern, including `assert...` rule naming.

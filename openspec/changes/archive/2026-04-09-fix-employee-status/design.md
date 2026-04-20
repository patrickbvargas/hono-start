## Context

The `isActive` boolean concern was added to all business entities as documented in `DATA_MODEL.md` (§4.2), `CONVENTIONS.md`, and enforced by PRD requirements FR-DATA-05/06/07 and FR-AUTH-08/09. The `Employee` Prisma model is missing this field entirely. As a result, the employee feature — form, filter schema, filter UI, API handlers, and table actions — is out of sync with the established pattern already in place for other entities.

Current state:
- `prisma/schema.prisma` — `Employee` model has no `isActive` column
- `schemas/form.ts` — no `isActive` field in create or update schema
- `components/form/` — no "Ativo" checkbox
- `schemas/filter.ts` — has a `status` field backed by `deletedAt` only; no `isActive` filter
- `components/filter/` — no status/active filter control rendered
- `components/table/` — `isActive` check commented out; all row actions always rendered
- `api/get.ts` — filters by `deletedAt` only; no `isActive` condition
- `api/create.ts` / `api/update.ts` — do not write `isActive`

## Goals / Non-Goals

**Goals:**
- Add `isActive Boolean @default(true)` to the `Employee` Prisma model, with a `@@index([isActive])`
- Expose `isActive` in the employee form (create and edit) as a "Ativo" checkbox per CONVENTIONS.md
- Thread `isActive` through create and update API handlers, model schema, and default values
- Add `active` URL search param to the employee filter schema; wire it in `getEmployees`
- Render an active/inactive filter control in `EmployeeFilter`
- Fix table row actions to be conditional on `deletedAt` (edit/delete vs restore)

**Non-Goals:**
- Role-based access control (admin vs regular user visibility — tracked as a separate TODO in the codebase)
- Filter by `deletedAt` separately from `isActive` is an existing behavior — do not change it
- Changes to any other feature (clients, contracts, etc.)

## Decisions

### 1. `isActive` and `deletedAt` remain independent
`isActive = false` means the employee is visible in lists but excluded from form option dropdowns. `deletedAt != null` means the record is soft-deleted and hidden from the default list view. They are never conflated. A soft-deleted employee can have `isActive = true`; if restored, their active status is preserved.

_Rationale_: Matches DATA_MODEL.md §60, CONVENTIONS.md Prisma section, and FR-DATA-05.

### 2. URL param for isActive filter: `active`
The `active` URL search param (values: `"true"` | `"false"` | `""` for all) is added to the employee filter schema. The existing `status` filter (Ativo/Inativo via `deletedAt`) is left unchanged.

_Rationale_: DATA_MODEL.md §136 states: "Tables / lists default to non-deleted records; `isActive` can be filtered via the `active` URL search param."

### 3. Form field: `Checkbox` labeled "Ativo"
The `isActive` field is rendered as a `Checkbox` component (HeroUI) with the label "Ativo" — consistent with every other entity in the project. No confirmation modal for toggling.

_Rationale_: CONVENTIONS.md Forms section; UI Patterns section ("Active/inactive toggle" paragraph).

### 4. Table row actions: conditional on `deletedAt`
The `isActive` state does not affect which row actions are shown. Actions are conditioned on `deletedAt`:
- Employee not deleted (`deletedAt: null`) → show Edit + Delete; hide Restore
- Employee deleted (`deletedAt != null`) → show Restore; hide Edit + Delete

_Rationale_: The commented-out `// const isActive = employee.status === "Ativo"` referenced the derived status string (which currently reflects `deletedAt`). The correct discriminant is `deletedAt` directly — using the derived `status` field on the model for the same purpose is acceptable since `status === "Ativo"` iff `deletedAt === null`.

### 5. Migration: column defaults to `true`
The Prisma migration sets `isActive Boolean @default(true)`. All existing employee rows receive `isActive = true` automatically via the column default.

_Rationale_: No data backfill needed; default is consistent with new-record behavior.

## Risks / Trade-offs

- **Database migration required** → Must run `prisma migrate dev` (dev) / `prisma migrate deploy` (prod) before deploying. Rollback removes the column; no data loss.
- **`getEmployeeTypes` / `getEmployeeRoles` option queries** — these fetch lookup tables (`EmployeeType`, `UserRole`) which also have `isActive`. Per DATA_MODEL conventions (form option queries filter `isActive: true`), these should already be filtering `isActive: true`. Verify and update if missing — low-risk, isolated change.

## Migration Plan

1. Add `isActive Boolean @default(true)` + `@@index([isActive])` to `Employee` in `prisma/schema.prisma`
2. Run `prisma migrate dev --name add-employee-is-active`
3. Regenerate Prisma client: `prisma generate`
4. Implement code changes (schemas, handlers, components)
5. Run `pnpm check` and `npx tsc --noEmit` to verify

**Rollback**: Revert schema, run a migration that drops the column.

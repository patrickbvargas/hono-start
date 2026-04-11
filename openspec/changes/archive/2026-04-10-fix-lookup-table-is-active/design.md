## Context

`docs/PRD.md` Appendix B and `docs/DATA_MODEL.md` Sections 1.6 and 3 define lookup tables as global reference records with immutable `value`/`label` fields and an `isActive` flag that controls whether a row is returned by form option queries. The current Prisma schema only implements `value` and `label` on `EmployeeType` and `UserRole`, and the employee feature fetches both tables with an unrestricted `findMany`.

This creates a gap between documented behavior and the running code:
- The database cannot represent inactive employee types or inactive user roles.
- The employee form option queries cannot exclude inactive lookup rows.
- Generated Prisma types encode the wrong shape for both lookup models.

The same docs explicitly exempt `Firm` from the `isActive` convention, so the change should align the real lookup tables without expanding scope into tenant modeling.

## Goals / Non-Goals

**Goals:**
- Add `isActive` to `EmployeeType` and `UserRole` with a default of `true`
- Preserve existing rows by backfilling them as active through the migration default
- Keep lookup ordering stable (`label` ascending)
- Regenerate Prisma artifacts so application types match the schema

**Non-Goals:**
- Building admin CRUD or settings pages for lookup activation
- Changing `Firm` to behave like a lookup table
- Introducing a shared lookup service abstraction beyond what is needed for the current employee queries

## Decisions

### 1. Scope the schema change to `EmployeeType` and `UserRole`
These are the lookup tables currently used by implemented employee option queries, and both are explicitly modeled as lookup tables in `DATA_MODEL.md`. `Firm` is not included because the docs describe it as the tenant root and explicitly exclude it from the `isActive` convention.

Alternative considered:
- Adding `isActive` to `Firm` as part of the same migration. Rejected because it would contradict the current documented data model and expand the change beyond lookup-table alignment.

### 2. Use a non-null boolean with default `true`
The migration should add `isActive BOOLEAN NOT NULL DEFAULT true` to both tables. That keeps existing rows valid without a separate backfill step and matches the documented lookup-table pattern.

Alternative considered:
- Nullable `isActive` with application-level fallback. Rejected because it weakens the schema contract and complicates every lookup query.

### 3. Apply active-only filtering in option queries, not in all lookup reads
The documented rule is specific to form option queries.

### 4. Treat inactive lookups referenced by existing employees as a follow-up edge case
Once a type or role is inactive, it should disappear from new option queries. Existing employees may still reference that lookup row, and list/detail views can continue rendering those labels through relational joins. If edit forms later need to preserve selection of an inactive current value, that should be handled deliberately in the form options layer rather than by weakening the option-query rule.

## Risks / Trade-offs

- Existing edit flows may need a follow-up if an employee references an inactive type or role and the select component requires the current option to be present. -> Mitigation: keep this documented as an explicit edge case and validate the form behavior during implementation.
- Prisma client regeneration will touch generated files outside the hand-edited feature code. -> Mitigation: isolate the schema change, regenerate once, and review generated diffs rather than editing generated output manually.
- A migration is required before deploying the query change. -> Mitigation: sequence rollout as migrate first, then deploy application code that reads the new field.

## Migration Plan

1. Update `prisma/schema.prisma` to add `isActive Boolean @default(true)` to `EmployeeType` and `UserRole`.
2. Generate a Prisma migration that adds both columns as `NOT NULL DEFAULT true`.
3. Regenerate Prisma client/types.
4. Update seed upserts so seeded lookup rows remain explicitly active.
5. Run `pnpm check` and `npx tsc --noEmit`.

Rollback:
- Revert the application code and Prisma schema, then apply a rollback migration that drops the added columns if the change must be undone before other features depend on them.

## Open Questions

- If an employee already references an inactive `EmployeeType` or `UserRole`, should the edit form inject the current inactive option as a disabled/preserved selection, or should the user be forced to choose a new active lookup value before saving? Inject as a disabled option

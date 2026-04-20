## Why

The employees page already supports URL-driven filtering, but the current `EmployeeFilter` renders every control inline in the header, which consumes horizontal space and makes the list harder to scan. Refactoring the filter into an always-visible search field plus an advanced filters popover keeps the common fullname/OAB search immediately available while preserving the existing filter coverage for users who manage employees.

## What Changes

- Refactor the employees header filter UI so `name` search remains visible as a dedicated search field for `fullName` / `oabNumber`
- Move the `type`, `role`, and `active` controls into an advanced filters popover/dropdown trigger instead of rendering them inline
- Preserve the current URL-driven filter model, Portuguese labels, and server-side behavior already implemented for employee filtering
- Add any shared HeroUI re-exports needed to support a `Popover`-based implementation through `src/shared/components/ui/`

## Non-goals

- No backend query, schema, pagination, or sorting changes
- No changes to employee filter semantics or available filter dimensions
- No multi-tenant behavior changes; filtering remains scoped to the authenticated firm

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `employee-filter-ui`: Change the employee list filter layout so the fullname/OAB search is always visible and the remaining controls are grouped inside an advanced filters popover

## Impact

- Affected users: authenticated users who can access the employee list, especially administrators managing larger teams
- Affected code: `src/features/employees/components/filter/`, `src/features/employees/hooks/use-filter.ts`, `src/routes/colaboradores.tsx`, and `src/shared/components/ui/`
- Dependencies/systems: HeroUI filter primitives via the shared UI layer and TanStack Router URL search param state
- Database / API impact: none

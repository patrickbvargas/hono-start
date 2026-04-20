## 1. Shared UI support

- [x] 1.1 Add a shared `Popover` re-export under `src/shared/components/ui/` and expose it from the shared UI barrel
- [x] 1.2 Confirm no database migration, API contract change, or schema change is required for this refactor

## 2. Employee filter refactor

- [x] 2.1 Refactor `src/features/employees/components/filter/index.tsx` so `name` uses a visible HeroUI `SearchField`
- [x] 2.2 Move the `type`, `role`, and `active` controls into a HeroUI `Popover` opened from an advanced filters trigger
- [x] 2.3 Update `src/features/employees/hooks/use-filter.ts` so the form stays synchronized with URL-driven filter state after navigation and filter changes

## 3. Verification

- [x] 3.1 Verify the employees page still applies search, type, role, and active filters correctly through URL search params
- [x] 3.2 Run `pnpm check`
- [x] 3.3 Run `npx tsc --noEmit`

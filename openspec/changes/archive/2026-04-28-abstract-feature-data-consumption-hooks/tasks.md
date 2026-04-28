## 1. Preparation

- [x] 1.1 Review current direct feature-component query consumers and confirm the in-scope list for entity details, delete, restore, and equivalent feature-owned section reads.
- [x] 1.2 Confirm no database migration is required for this change.
- [x] 1.3 Align hook naming across all participating features so collection reads use plural names and single-entity reads use singular names, while preserving screen-specific names only where they remain clearer.

## 2. Feature Data Hook Refactor

- [x] 2.1 Update `src/features/clients/hooks/use-data.ts` to expose the preferred collection and single-entity hooks, then migrate client detail components off direct React Query consumption.
- [x] 2.2 Update `src/features/employees/hooks/use-data.ts` to expose the preferred collection and single-entity hooks, then migrate employee details, delete, and restore components to reuse the shared single-entity hook.
- [x] 2.3 Update `src/features/contracts/hooks/use-data.ts` to expose the preferred collection and single-entity hooks, then migrate contract details, delete, and restore components to reuse the shared single-entity hook.
- [x] 2.4 Update `src/features/fees/hooks/use-data.ts` to expose the preferred collection and single-entity hooks, then migrate fee detail components off direct React Query consumption.
- [x] 2.5 Update `src/features/remunerations/hooks/use-data.ts` to expose the preferred collection and single-entity hooks, then migrate remuneration detail components off direct React Query consumption.
- [x] 2.6 Decide whether `src/features/attachments/components/section` joins this change, and either migrate it to a feature data hook or document and encode its exception.

## 3. Public Surface And Boundaries

- [x] 3.1 Update feature public barrels so route-facing hooks continue to export through `src/features/<feature>/index.ts` without leaking unnecessary internal helpers.
- [x] 3.2 Preserve all `get...QueryOptions` exports in `api/queries.ts` and verify loaders, form hooks, mutations, and cache utilities still consume the same query option factories.
- [x] 3.3 Keep feature-owned component imports on local `hooks/use-data.ts` usage and avoid introducing a global hook registry or DI-style service container.

## 4. Contract Enforcement

- [x] 4.1 Extend `src/features/__tests__/frontend-orchestration-boundaries.test.ts` to fail when feature-owned components consume feature data with direct `useQuery` or `useSuspenseQuery` calls instead of feature-local hooks.
- [x] 4.2 Scope the boundary checks so shared infrastructure such as authenticated session helpers is excluded unless a separate shared-hook contract is introduced.
- [x] 4.3 Add assertions for the preferred collection/singular hook naming where the feature exposes both list and entity-by-id readers.

## 5. Verification

- [x] 5.1 Run `pnpm check` and fix all reported issues.
- [x] 5.2 Run `npx tsc --noEmit` and fix all reported issues.
- [x] 5.3 Manually review the affected overlays and route screens to confirm data shape, lifecycle copy, and cache behavior remain unchanged after the hook indirection refactor.

## 1. Dashboard skeleton surface

- [x] 1.1 Map current dashboard loaded layout and define matching skeleton sections for header, metrics, evolution chart, remuneration table, and breakdown cards.
- [x] 1.2 Implement dashboard-specific skeleton component inside `src/features/dashboard/components` using shared UI re-exports and existing responsive layout conventions.

## 2. Route wiring and visual contract

- [x] 2.1 Replace dashboard route `pendingComponent` in `src/routes/_app/index.tsx` to render the dedicated dashboard skeleton instead of generic `RouteLoading`.
- [x] 2.2 Preserve incremental loading feedback behavior in the dashboard header without reintroducing spinner-only first paint.
- [x] 2.3 Add or update tests covering dashboard skeleton structure and route wiring for initial pending behavior.

## 3. Verification

- [x] 3.1 Verify no DB migration is required and no data/query contract changed.
- [x] 3.2 Run `pnpm check` and fix any issues introduced by the dashboard skeleton change.
- [x] 3.3 Run `npx tsc --noEmit` and fix any type errors introduced by the change.

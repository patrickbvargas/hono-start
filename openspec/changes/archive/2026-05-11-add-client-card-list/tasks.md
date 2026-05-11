## 1. Shared Entity Foundation

- [x] 1.1 Extract the shared entity-fields contract from `EntityDetail` with reusable field and skeleton exports.
- [x] 1.2 Create a dedicated shared `DataCardList` component with empty state and footer composition, independent from `TanStack Table`.

## 2. Client List Surface

- [x] 2.1 Keep `ClientTable` and `ClientList` as separate feature surfaces and wire both through a shared `EntityView` controller in the clients route.
- [x] 2.2 Keep client card clicks wired to the existing details overlay and preserve row/card lifecycle actions without changing route-level filter, sort, or pagination behavior.
- [x] 2.3 Persist the desktop table/card preference through the shared global entity-view mode and force cards on mobile.

## 3. Verification

- [x] 3.1 Add or update focused tests for the shared foundation and the clients list responsive surface.
- [x] 3.2 Run `pnpm check` and `npx tsc --noEmit`, then fix any issues before closing the change.

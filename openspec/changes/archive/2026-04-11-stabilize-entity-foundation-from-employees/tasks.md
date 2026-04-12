## 1. Foundation Contract

- [x] 1.1 Normalize employee search/filter schemas so `isActive` filtering and deleted-state visibility are represented as separate URL-driven concerns.
- [x] 1.2 Align employee list query building and sort handling with the shared entity-management foundation contract, including deterministic ordering for pagination.
- [x] 1.3 Extract or formalize the minimal shared helpers needed for canonical entity-management list behavior without moving employee-specific logic into `shared/` prematurely.

## 2. Employees Reference Slice

- [x] 2.1 Update the employees route to enforce administrator-only management access through the shared session authorization helper before rendering protected UI.
- [x] 2.2 Update the employee filter UI to expose an explicit deleted-state control alongside the existing `isActive` status control and keep both synchronized with URL state.
- [x] 2.3 Update employee create and edit validation so lawyer/admin-assistant OAB rules and referral percentage rules are enforced consistently in feature hooks and server mutations.
- [x] 2.4 Align employee mutation success/error flows and cache refresh behavior with the shared reference pattern used for management screens.

## 3. Selectable Options

- [x] 3.1 Update employee type and user role option queries to return only active selectable lookup rows sorted by label.
- [x] 3.2 Verify employee forms continue to render persisted values safely while excluding inactive lookup rows from new selections.

## 4. Verification

- [x] 4.1 Review the employees slice against the new `entity-foundation` spec and confirm it is the baseline reference for future entity implementations.
- [x] 4.2 Run `pnpm check`.
- [x] 4.3 Run `npx tsc --noEmit`.

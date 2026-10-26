## 1. Shared menu support

- [x] 1.1 Consult Base UI Context7 documentation and implement shared contextual primitives and DataTable opt-in with valid row markup and keyboard handling. No database migrations required.
- [x] 1.2 Share EntityActions permission filtering and item rendering across dropdown and contextual surfaces.

## 2. Collection integration

- [x] 2.1 Opt in all seven primary entity tables using one feature-owned action renderer per table; retain lifecycle helpers and callbacks.
- [x] 2.2 Update canonical frontend interaction contract.

## 3. Verification

- [x] 3.1 Add focused tests for right click, keyboard access/dismissal, action parity, permissions, lifecycle, nested controls and sorted/paginated record identity.
- [x] 3.2 Review conventions, run focused tests, pnpm check and npx tsc --noEmit; validate OpenSpec and inspect pointer positioning in browser when available.

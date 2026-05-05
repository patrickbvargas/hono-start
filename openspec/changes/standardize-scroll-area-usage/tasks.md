## 1. Shared Scroll Contracts

- [ ] 1.1 Confirm every shared internal scroll surface that belongs in the pattern and leave popup primitives explicitly out of scope.
- [ ] 1.2 Update the owning shared wrappers and specs so detail drawers and equivalent shared surfaces use the shared `ScrollArea` boundary consistently.

## 2. Shared Wrapper Adoption

- [ ] 2.1 Align `EntityDetail.Body` with the shared `ScrollArea` contract and verify long detail content keeps drawer header and footer stable.
- [ ] 2.2 Evaluate `SidebarContent` and shared dialog body wrappers, then adopt the same pattern where bounded internal scrolling is part of the wrapper contract.

## 3. Verification

- [ ] 3.1 Add or update focused coverage for shared scroll-wrapper behavior where practical.
- [ ] 3.2 Run `pnpm check` and `npx tsc --noEmit`, then fix any issues before closing the change.

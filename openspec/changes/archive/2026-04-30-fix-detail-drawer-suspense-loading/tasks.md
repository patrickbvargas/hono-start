## 1. OpenSpec And Shared Detail Loading

- [x] 1.1 Add a shared detail-drawer suspense fallback pattern in the shared entity detail wrapper.
- [x] 1.2 Refactor entity detail drawers to render a local suspense boundary with shared skeleton fallback for clients, employees, contracts, fees, and remunerations.

## 2. Verification

- [x] 2.1 Add focused Vitest coverage for the detail drawer loading contract so background list context remains rendered while detail content suspends.
- [x] 2.2 Run `pnpm check` and `npx tsc --noEmit`, fix any issues, and then mark tasks complete.

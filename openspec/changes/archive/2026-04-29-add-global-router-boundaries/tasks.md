## 1. Root boundaries

- [x] 1.1 Add root-level global `errorComponent` and `notFoundComponent` to the TanStack Router root route
- [x] 1.2 Reuse or create shared fallback components that render correctly inside the root document shell
- [x] 1.3 Remove redundant route-level error boundaries where the global fallback is sufficient

## 2. Verification

- [x] 2.1 Add or update tests for unmatched routes and uncaught route errors
- [x] 2.2 Verify route-specific boundaries still work when intentionally overridden
- [x] 2.3 Run `pnpm check` and `npx tsc --noEmit`

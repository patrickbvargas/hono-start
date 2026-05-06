## 1. Dashboard Refactor

- [x] 1.1 Create dedicated dashboard metric-cards component and move card rendering helpers into it.
- [x] 1.2 Update the root dashboard component to orchestrate layout with the extracted metric-cards surface.

## 2. Verification

- [x] 2.1 Update focused dashboard tests to reflect the new orchestration boundary.
- [x] 2.2 Run `pnpm check` and `npx tsc --noEmit`, then resolve any issues before marking tasks done.

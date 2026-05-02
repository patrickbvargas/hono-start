## 1. OpenSpec Alignment

- [x] 1.1 Add the OpenSpec proposal, design, and app-layout delta spec for the shared table scroll-boundary change

## 2. Shared Layout Implementation

- [x] 2.1 Refactor the shared wrapper body to expose bounded flex height without owning the vertical scroll area
- [x] 2.2 Update the shared data table and shared table primitives so the table fills available height, scrolls internally, and keeps the header sticky with pagination inside the same region

## 3. Verification

- [x] 3.1 Run `pnpm check` and `npx tsc --noEmit`, then fix any resulting issues

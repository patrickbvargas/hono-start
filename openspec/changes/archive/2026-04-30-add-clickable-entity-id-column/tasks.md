## 1. OpenSpec And Shared UI

- [x] 1.1 Add the OpenSpec artifacts for the clickable entity id pattern and document the shared UI approach for principal entity tables.
- [x] 1.2 Create a shared clickable entity id helper and update shared row actions ordering so details remain available as a fallback action.

## 2. Entity Table Implementation

- [x] 2.1 Update clients, employees, and contracts tables to prepend the clickable id column and reuse existing `onView(id)` details callbacks.
- [x] 2.2 Update fees and remunerations tables to prepend the clickable id column and reuse existing `onView(id)` details callbacks.

## 3. Verification

- [x] 3.1 Add or update focused Vitest coverage for the shared pattern and table contract changes.
- [x] 3.2 Run `pnpm check` and `npx tsc --noEmit`, fix any issues, then mark the change complete.

## 1. Feature contract

- [x] 1.1 Create the new `remuneration-management` spec delta covering route behavior, visibility rules, manual overrides, lifecycle actions, and export expectations.
- [x] 1.2 Verify whether the current `Remuneration` Prisma model needs any index-only migration for the new query patterns; if so, add the migration and reseed workflow, otherwise document that no schema change is required.

## 2. Remuneration schemas and server operations

- [x] 2.1 Create `src/features/remunerations/schemas/model.ts`, `filter.ts`, `sort.ts`, and `search.ts` following the same schema-first list workflow used by the existing entity slices.
- [x] 2.2 Create the remuneration form-side schema and pure validation helpers for administrator manual override writes, keeping Prisma-dependent checks at the server boundary.
- [x] 2.3 Implement remuneration list, detail, and export server functions with deterministic sorting, role-aware scoping, and session-derived tenant enforcement.
- [x] 2.4 Implement remuneration update, delete, and restore server functions so only administrators can mutate remunerations and any edit converts the record into a manual override when required.

## 3. Hooks and UI components

- [x] 3.1 Add remuneration feature constants, default values, and the public barrel export without leaking internal files.
- [x] 3.2 Implement remuneration hooks for filters, admin edit orchestration, delete, restore, and export flows, including toast feedback and query invalidation after successful mutations.
- [x] 3.3 Implement remuneration filter, table, details drawer, edit modal, delete confirmation, and restore confirmation components with pt-BR labels and explicit manual-override state.

## 4. Route wiring and permissions

- [x] 4.1 Add the `/remuneracoes` route using the thin-route pattern: validate search state, require authenticated access, prefetch remuneration queries, and mount the remuneration overlays.
- [x] 4.2 Update shared route config and navigation wiring so the remuneration screen appears consistently in the application shell.
- [x] 4.3 Verify role behavior end to end so administrators have firm-wide remuneration access while regular users only see and export remunerations tied to their own employee identity.

## 5. Verification

- [x] 5.1 Run `pnpm check` and fix all reported issues.
- [x] 5.2 Run `npx tsc --noEmit` and fix all reported issues.

## 1. Persistence foundation

- [x] 1.1 Review the current Prisma schema, contract aggregate, and seed setup, then add the missing persistence coverage required for `Fee` and `Remuneration`.
- [x] 1.2 Update `prisma/schema.prisma` with `Fee` and `Remuneration` models, relations, lifecycle fields, indexes, and uniqueness constraints aligned with the fee-management spec.
- [x] 1.3 Update contributor docs to record the repository-specific Prisma workflow: run `npx prisma migrate reset` first, then `npx prisma migrate dev --name <change-name>`, then `npx prisma db seed`.
- [x] 1.4 Run the documented Prisma workflow to generate and validate the migration and reseed the local development database.

## 2. Fee feature contract

- [x] 2.1 Create `src/features/fees/schemas/model.ts`, `form.ts`, `filter.ts`, `sort.ts`, and `search.ts` following the same schema-first workflow as the existing entity slices.
- [x] 2.2 Define feature-local default values, normalization helpers, and validation helpers for fee payloads, installment uniqueness, positive amount checks, parent-resource consistency, and remuneration-generation behavior.
- [x] 2.3 Add fee feature constants and the public barrel export without leaking internal implementation files.

## 3. Server operations and derived state

- [x] 3.1 Implement fee list and detail server functions with URL-driven filters, deterministic sorting, tenant scoping, parent-resource joins, and assignment-scoped visibility.
- [x] 3.2 Implement fee create and update server functions as transactional writes covering authoritative parent validation, fee persistence, remuneration side effects, and post-write revenue-progress and contract-status evaluation.
- [x] 3.3 Implement fee delete and restore server functions with administrator-only enforcement, linked-remuneration lifecycle handling, and mutation responses aligned with the shared pattern.
- [x] 3.4 Extend shared session policy and scope/resource helpers so fee server operations can enforce allowed contract boundaries, writable-state checks, and admin-only lifecycle actions consistently.

## 4. Hooks and UI components

- [x] 4.1 Implement fee hooks for filters, form orchestration, delete, and restore flows, including toast feedback and query invalidation after successful mutations.
- [x] 4.2 Implement fee list and filter components using the shared entity-management pattern for contract, revenue, date-range, active-state, and deleted-state controls where applicable.
- [x] 4.3 Implement the fee form modal, details drawer, delete confirmation, and restore confirmation components with Portuguese labels and parent-context summaries.
- [x] 4.4 Implement fee table rendering for the documented financial summary columns and lifecycle actions based on the current user's permissions.

## 5. Route wiring and cross-feature integration

- [x] 5.1 Add the `/honorarios` route using the thin-route pattern: validate search state, require authenticated access, prefetch fee queries, and mount the fee feature overlays.
- [x] 5.2 Update contract and revenue read models or query helpers so revenue progress and contract completion are derived from persisted fee data where the product surfaces require it.
- [x] 5.3 Verify role-based behavior so administrators have firm-wide fee access while regular users only see and mutate fees within allowed contract boundaries.

## 6. Verification

- [x] 6.1 Run `pnpm check` and fix all reported issues.
- [x] 6.2 Run `npx tsc --noEmit` and fix all reported issues.

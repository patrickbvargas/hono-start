## 1. Persistence foundation

- [x] 1.1 Review the current Prisma schema and seed setup, then add the missing lookup tables or seed coverage required for legal areas, contract statuses, assignment types, and revenue types.
- [x] 1.2 Add Prisma models, relations, indexes, and uniqueness constraints for `Contract`, `ContractEmployee`, and `Revenue`, including firm scoping, `isActive`, `deletedAt`, and process-number uniqueness.
- [x] 1.3 Generate and validate the Prisma migration for the new contract aggregate schema, including the active-dependency indexes needed for contract, assignment, and revenue queries.

## 2. Contract feature contract

- [x] 2.1 Create `src/features/contracts/schemas/model.ts`, `form.ts`, `filter.ts`, `sort.ts`, and `search.ts` following the same schema-first workflow as the existing entity slices.
- [x] 2.2 Define feature-local default values and validation helpers for contract payloads, assignment compatibility, referral/team-composition rules, revenue uniqueness, and status-lock semantics.
- [x] 2.3 Add contract feature constants and the public barrel export without leaking internal implementation files.

## 3. Server operations and authorization

- [x] 3.1 Implement contract list and detail server functions with URL-driven filters, deterministic sorting, lookup-value resolution, tenant scoping, and assignment-scoped visibility.
- [x] 3.2 Implement contract create and update server functions as transactional aggregate writes covering the parent contract, assignments, and revenues with authoritative server-side validation and Portuguese error messages.
- [x] 3.3 Implement contract delete and restore server functions with administrator-only enforcement, active-revenue deletion protection, and lifecycle responses aligned with the shared mutation pattern.
- [x] 3.4 Extend shared session policy and any needed scope/resource helpers so contract server operations can enforce assigned-user access, writable-state checks, and admin-only lifecycle actions consistently.

## 4. Hooks and UI components

- [x] 4.1 Implement contract hooks for filters, form orchestration, delete, and restore flows, including toast feedback and query invalidation after successful mutations.
- [x] 4.2 Implement contract list and filter components using the shared entity-management pattern for client, legal-area, contract-status, active-state, and deleted-state filters.
- [x] 4.3 Implement the contract form modal, details drawer, delete confirmation, and restore confirmation components with Portuguese labels and aggregate sections for assignments and revenues.
- [x] 4.4 Implement contract table rendering for the documented summary columns and lifecycle actions based on the current user's permissions.

## 5. Route wiring and cross-feature integration

- [x] 5.1 Add the `/contratos` route using the thin-route pattern: validate search state, require authenticated access, prefetch contract queries, and mount the contract feature overlays.
- [x] 5.2 Update client and employee feature integrations to use the real contract tables for active-contract deletion checks, contract counts, and contract-related option-loading behavior now that the aggregate exists.
- [x] 5.3 Verify role-based behavior so administrators have firm-wide contract access while regular users only see and mutate assigned writable contracts.

## 6. Verification

- [x] 6.1 Run `pnpm check` and fix all reported issues.
- [x] 6.2 Run `npx tsc --noEmit` and fix all reported issues.

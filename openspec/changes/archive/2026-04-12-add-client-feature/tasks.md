## 1. Data model and shared prerequisites

- [x] 1.1 Review the existing Prisma schema and seed data against the client-management spec, then add any missing `ClientType` and `Client` models, relations, indexes, and seed rows required for the feature.
- [x] 1.2 Create and validate the Prisma migration for the client data model changes, including firm-scoped document uniqueness and the standard `isActive` / `deletedAt` indexes.
- [x] 1.3 Add or confirm any shared helpers needed for client document formatting or authenticated route/session access only if the behavior is generic enough to avoid client-specific leakage into `shared/`.

## 2. Client feature contract

- [x] 2.1 Create `src/features/clients/schemas/model.ts`, `form.ts`, `filter.ts`, `sort.ts`, and `search.ts` using the same schema-first workflow as `employees`.
- [x] 2.2 Define client default values and pure validation helpers for CPF/CNPJ validation, immutable client type handling, and create vs edit payload differences inside the client feature slice.
- [x] 2.3 Add client feature constants and the public barrel export for the new slice without exposing internal file paths.

## 3. Server operations and authorization

- [x] 3.1 Implement client list, detail, and option-query server functions with URL-driven filter support, deterministic sorting, lookup-value resolution for `ClientType`, and firm scoping from the authenticated session.
- [x] 3.2 Implement client create and update server functions with authoritative server-side CPF/CNPJ validation, duplicate-document protection, immutable type enforcement on edit, and Portuguese error messages.
- [x] 3.3 Implement client delete and restore server functions with administrator-only enforcement, active-contract deletion protection, and success/error responses aligned with the shared mutation contract.

## 4. Hooks and UI components

- [x] 4.1 Implement client hooks for filters, form orchestration, delete, and restore flows, including toast feedback and query invalidation after successful mutations.
- [x] 4.2 Implement client list and filter components using the shared entity-management patterns for URL-driven search, type filter, active filter, and deleted-state filter.
- [x] 4.3 Implement the client form modal, details drawer, delete confirmation, and restore confirmation components with Portuguese labels and type-dependent client form behavior.

## 5. Route wiring and verification

- [x] 5.1 Add the clients route using the thin-route pattern: validate search state, require authenticated access, prefetch client queries, and mount the client feature overlays.
- [x] 5.2 Verify role-based behavior so authenticated users can list/create/edit/view clients while only administrators can delete or restore them.
- [x] 5.3 Run `pnpm check` and `npx tsc --noEmit`, then fix all reported issues before marking the change complete.

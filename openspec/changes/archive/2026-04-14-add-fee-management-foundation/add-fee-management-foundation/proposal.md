## Why

The product contract already defines fee management as a core workflow, but the current implementation stops at contracts and revenues. Adding the fee-management foundation now closes that gap so the application can record real payment events, derive revenue progress from persisted fees, and unlock the documented downstream remuneration workflow.

## What Changes

- Add a new fee-management capability for firm-scoped fee listing, filtering, sorting, detail viewing, create, update, soft-delete, and restore flows.
- Materialize the missing persistence foundation for `Fee`, including tenant scoping, active-state and soft-delete lifecycle fields, installment uniqueness, and relations to `Revenue` and `Firm`.
- Implement fee creation and editing as authoritative server operations that enforce installment limits, positive amounts, revenue ownership, contract writability, and optional remuneration-generation behavior.
- Expose the documented `/honorarios` route using the repository's standard entity-management pattern with URL-driven filters, server-prefetched queries, modal create/edit flows, details drawer, and lifecycle confirmations.
- Extend revenue and contract read models so paid value, installments paid, remaining value, and contract completion are derived from persisted fee records instead of revenue-plan fields alone.
- Document the repository-specific Prisma migration workflow requirement that contributors must reset the Prisma development database before generating a new migration, then create the migration and reseed, because attempting a plain migration first is not reliable in this project and can time out.

## Capabilities

### New Capabilities
- `fee-management`: Fee persistence, `/honorarios` list and overlay flows, fee validation, fee lifecycle actions, role-aware visibility, and fee-driven revenue-progress updates.

### Modified Capabilities

## Non-goals

- Implementing the full remuneration-management feature slice, manual remuneration overrides, export workflows, or audit-log review surfaces in this change.
- Redesigning the contract feature into a dedicated full-screen financial workspace instead of following the existing route and overlay pattern.
- Replacing the established Prisma, TanStack, or shared-session architecture rather than extending it with the missing fee domain pieces.

## Impact

- Affected code: `prisma/schema.prisma`, Prisma migrations and `prisma/seed.ts`, `src/features/fees/**`, `src/routes/**` for `/honorarios`, shared session policy and scope helpers for fee authorization, and any contract or revenue query shaping that must surface fee-derived progress.
- Affected docs: new `fee-management` spec plus implementation docs covering Prisma migration workflow for this repository.
- Affected roles: administrators gain firm-wide fee visibility and lifecycle actions; regular users gain access only to fees within allowed contract boundaries; delete and restore remain administrator-only.
- Multi-tenancy: every fee read and write remains strictly scoped to the authenticated user's `firmId`, and every referenced revenue or contract must belong to that same firm.

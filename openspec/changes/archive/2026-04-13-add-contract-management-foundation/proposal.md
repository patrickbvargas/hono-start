## Why

The product contract already defines contracts as a core operational aggregate, but the codebase still has no contract route, feature slice, or backing Prisma models. Adding the contract-management foundation now unlocks the documented workflow that ties clients, collaborators, legal areas, and revenue planning together, while also removing temporary fallbacks already present in the client and employee slices.

## What Changes

- Add a new contract-management capability for firm-scoped contract listing, filtering, sorting, create, edit, detail viewing, soft-delete, and restore flows.
- Materialize the missing persistence foundation for contracts by adding Prisma support for `Contract`, `ContractEmployee`, and `Revenue`, along with the lookup resolution required for legal area, contract status, assignment type, and revenue type.
- Implement contract creation and editing as aggregate operations that validate client eligibility, team composition, revenue uniqueness, process-number uniqueness, and status-lock semantics at the server boundary.
- Apply assignment-scoped authorization so administrators can see all contracts while regular users can view and update only assigned writable contracts.
- Update existing client and employee feature dependencies that currently stub or probe contract data so they use the real contract tables once available.

## Capabilities

### New Capabilities
- `contract-management`: Contract list, filters, details, create/edit flows, lifecycle actions, assignment handling, revenue-plan handling, validation, and assignment-scoped authorization.

### Modified Capabilities

## Non-goals

- Implementing fee recording, remuneration generation, attachment management, audit-log review surfaces, or export flows beyond the contract-side data foundation they depend on.
- Building a generic aggregate framework or extracting new shared abstractions before the contract slice proves a stable second pattern.
- Expanding client or employee details into rich cross-feature dashboards just because contract data becomes available.

## Impact

- Affected code: `prisma/schema.prisma`, Prisma migrations and seed data for the required lookup families, `src/features/contracts/**`, `src/routes/**` for the contracts route, shared session policy and scope utilities for contract authorization, and existing client/employee server operations that currently reference contracts indirectly.
- Affected specs: new `contract-management` capability only, unless implementation reveals a missing cross-capability requirement that belongs in an existing spec.
- Affected roles: administrators gain full contract-management access; regular users gain assigned-contract visibility and writable contract actions within the documented lifecycle limits; delete and restore remain administrator-only.
- Multi-tenancy: every contract, assignment, and revenue read or write remains strictly scoped to the authenticated user's `firmId`, and all related entities referenced during mutations must belong to the same firm.

## Why

The product requirements and data model already define client management as a core entity, but the application still lacks the first client slice. Adding clients now unlocks contract work on top of a real firm-scoped business entity while reusing the stabilized entity workflow established by employees.

## What Changes

- Add a new client-management capability for firm-scoped client listing, filtering, sorting, create, edit, soft-delete, restore, and detail viewing.
- Support both client types defined by the product docs: `INDIVIDUAL` and `COMPANY`, with type-driven labels and document validation rules.
- Apply the shared entity-management workflow to clients, including URL-driven list state, separate `isActive` and deleted-state filters, modal create/edit flows, drawer-based details, and protected delete/restore confirmations.
- Enforce per-firm uniqueness for client document numbers and derive all tenant scope from the authenticated session on the server.
- Expose client option queries for downstream contract flows using the shared business-entity selectable-options rule (`deletedAt = null` and `isActive = true`).

## Capabilities

### New Capabilities
- `client-management`: Client list, filters, details, create/edit flows, lifecycle actions, validation, and firm-scoped option-query behavior.

### Modified Capabilities

## Non-goals

- Implementing contract management, client attachments, or client-to-contract detail integrations beyond the behavioral contract needed for the initial client slice.
- Introducing new cross-entity workflow rules unless client requirements expose a real gap in the current foundation.
- Building a generic CRUD framework or extracting shared abstractions before a second consumer proves them.

## Impact

- Affected code: `src/features/clients/**`, `src/routes/**` for the clients route, shared session/authorization wiring used by the route and server functions, Prisma schema and seed data for `ClientType` and `Client` if not already materialized, and shared formatters/validators for CPF/CNPJ if needed.
- Affected specs: new `client-management` capability only, unless implementation reveals a missing foundation rule.
- Affected roles: administrators and regular users can list, create, edit, and view clients; delete and restore remain administrator-only.
- Multi-tenancy: all client reads, writes, and option queries remain strictly scoped to the authenticated user's `firmId`; any client-supplied tenant scope is ignored.

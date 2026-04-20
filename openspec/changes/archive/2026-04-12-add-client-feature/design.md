## Context

The product docs already define `Client` as a core business entity with firm-scoped uniqueness, dynamic form behavior by client type, URL-driven list state, soft-delete support, and active/inactive visibility rules. The codebase, however, only has one implemented entity slice today: `employees`.

That makes the client feature the first non-admin entity slice that must follow the same implementation workflow while changing one important access rule: clients are visible to all authenticated users, while delete and restore remain administrator-only. The design therefore needs to preserve the existing entity foundation and workflow rules without accidentally coupling the client slice to employee-only authorization or validation assumptions.

## Goals / Non-Goals

**Goals:**
- Introduce a `clients` feature slice that follows the existing schema-first, feature-owned workflow used by `employees`.
- Support the client-management behavior already described in the product and data-model docs: list, filter, sort, create, edit, details, soft-delete, restore, and option queries.
- Keep the route thin and declarative while moving client-specific rules into feature schemas, server functions, hooks, and components.
- Enforce per-firm isolation and document uniqueness on the server using the authenticated session as the source of tenant scope.
- Preserve compatibility with future contract work by exposing a client option-query boundary that returns active, non-deleted clients only.

**Non-Goals:**
- Implementing contracts, attachments, or client-linked downstream screens in this change.
- Introducing a generic CRUD framework or moving single-use client code into `shared/` prematurely.
- Redefining the cross-entity workflow rules already captured in `entity-foundation`.

## Decisions

### D1. Reuse the employees slice as the workflow reference, not as a business template

The client slice will mirror the same high-level structure already standardized in `docs/WORKFLOW.md` and `entity-foundation`:

```text
schemas
  -> api
  -> hooks
  -> components
  -> route
```

The route stays responsible for search validation, query prefetching, route-level access checks, and overlay composition. Client-specific validation, Prisma filter building, mutation orchestration, and detail payload shaping stay inside `src/features/clients`.

Alternative considered: implement clients directly in a route-first style because the slice is small. Rejected because it would break the documented workflow just as the second entity is introduced.

### D2. Treat client type as a lookup-backed field using stable `value` identity end to end

The data model defines `ClientType` as a lookup table. The client slice will therefore follow the same lookup contract already stabilized for employees:
- form state and URL filter state bind by lookup `value`
- the option query returns all lookup rows ordered by `label`
- inactive lookup rows remain visible but disabled
- server handlers resolve submitted `value` strings to relational ids before Prisma writes or filters

This keeps the new slice aligned with the current foundation and avoids introducing raw lookup ids into client-facing state.

Alternative considered: use raw `typeId` in form and filter state because only one client lookup currently exists. Rejected because it would diverge from the value-based contract already established as the cross-entity standard.

### D3. Client authorization differs by action, not by route

Unlike employees, the clients route is not administrator-only. All authenticated users can list, create, edit, and view clients. Delete and restore remain administrator-only and must be enforced in server mutations as the authoritative boundary, with UI actions hidden for non-admin users.

This means the route gate should require authentication and firm context, but not reuse the employee-management admin-only policy wholesale. Client delete/restore flows still use the shared authorization helpers for the protected actions that remain admin-restricted.

Alternative considered: make the entire clients route administrator-only to simplify reuse of the employee route pattern. Rejected because it conflicts with the PRD permission matrix and would block regular-user contract intake workflows.

### D4. Type-dependent document validation belongs in the feature contract and server boundary

Client creation and editing depend on type-specific rules:
- `INDIVIDUAL` requires a valid CPF
- `COMPANY` requires a valid CNPJ
- the type is fixed at creation and cannot be changed later
- the form label adapts to `Nome` vs `Razão Social`

The feature schemas and server mutations should own these rules so that client behavior stays coherent across direct mutation calls, form submission, and future integrations. The UI may provide immediate feedback, but the server remains authoritative.

Alternative considered: enforce CPF/CNPJ shape only in the form component and persist a normalized document string without feature-level validation. Rejected because it would weaken the slice contract and permit invalid direct writes.

### D5. Details and option-query boundaries should be forward-compatible with contracts without depending on contracts now

The initial client slice should expose:
- a details drawer payload for core client fields
- a selectable option query that returns only active, non-deleted clients

The details contract can include placeholders for related contracts and attachments later, but the first implementation should not depend on contract or attachment features being present. This keeps the client slice independently shippable while preserving a clear boundary for later integrations.

Alternative considered: block the client feature until related contracts and attachments can be rendered fully. Rejected because the PRD already defines clients as a standalone core entity and contracts depend on having clients first.

## Risks / Trade-offs

- [Risk] The client slice could accidentally copy employee-specific admin assumptions. → Mitigation: keep route access and mutation authorization decisions explicit in the client spec and design.
- [Risk] CPF/CNPJ validation may introduce normalization questions not yet standardized in shared helpers. → Mitigation: keep the first implementation feature-local unless a second consumer proves a stable shared validator.
- [Risk] The client details view may feel incomplete before contracts and attachments exist. → Mitigation: scope the initial drawer to core client data and define forward-compatible extension points rather than inventing placeholder cross-feature dependencies.
- [Risk] Lookup-table behavior for `ClientType` could drift from the newer value-based lookup contract. → Mitigation: explicitly adopt the same value-based option and URL-state pattern used by the current entity foundation.

## Migration Plan

1. Add a new `client-management` spec delta describing the client slice behavior.
2. Implement the client data model pieces required by the docs if they are not already present in Prisma and seed data.
3. Build the `clients` feature slice in the standard order: schemas, APIs, hooks, components, then route.
4. Add authenticated route access for clients and admin-only protection for delete/restore server mutations.
5. Verify the new slice remains aligned with the entity workflow before starting contract implementation.

Rollback is low risk because the change introduces a new vertical slice rather than altering an existing production workflow. If needed, the route and feature can be removed without affecting the employees capability.

## Open Questions

- Should the first client detail drawer include empty sections for contracts and attachments, or should those sections appear only when those features exist?
- Should document values be persisted normalized digits-only, formatted for display only, or stored exactly as entered after validation?
- Does the current shared session helper already expose a generic “authenticated user” route gate, or will the client route need a small shared authorization helper in addition to the admin checks?

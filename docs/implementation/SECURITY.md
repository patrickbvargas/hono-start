# Security

This document defines reusable trust-boundary and authorization rules for the repository pattern.

## Trust Boundaries

- Authenticated session context is the only trusted source for tenant scope, actor identity, and role.
- Client-submitted tenant or authority claims must never be trusted.
- In multi-tenant products, cross-tenant data access is always a bug.

## Authorization Rules

- Every protected operation must enforce role and tenant checks at the server boundary.
- UI visibility is not sufficient authorization.
- Administrative capabilities require explicit administrative enforcement.
- Route-level guards must fail early for screens that are entirely restricted, but server operations still need enforcement.
- Non-admin users may mutate only resources they are allowed to touch and only while those resources remain writable by product rules.

## Tenant Isolation

- In multi-tenant products, every business query and mutation must be scoped to the authenticated tenant.
- In multi-tenant products, related records referenced by input must also belong to the same tenant.
- Global lookup tables are the intentional exception when the product uses them.
- Session-derived scope utilities in `src/shared/session` are the canonical place for access-policy composition in this repository.

## Session Policy Shape

- Session selectors determine current role, tenant scope, and actor identity.
- Session scope utilities derive tenant-scoped or actor-scoped access for each subject area.
- Session policy utilities decide whether an action is allowed against a resource and must remain aligned with the domain role model.

## Sensitive Data Rules

- Database errors, stack traces, and internals must not be exposed to end users.
- Sensitive role-scoped data must follow the documented role model.
- Audit-trail data is append-only and administrator-scoped when the product includes audit history.

## Security And Compliance Summary

- Input validation is required before accepting user input.
- Audit trail is mandatory and immutable.
- Data isolation is tenant-scoped when the product is multi-tenant.
- Role enforcement governs protected actions.
- Data retention relies on soft-delete behavior rather than permanent deletion.
- Sensitive scoped data stays restricted by role and resource scope.
- Authentication security includes rate-limited failed-login behavior.

## Environment And Secrets

- Application code reads environment configuration through the validated environment layer.
- Do not access raw environment variables directly in arbitrary application modules.

## File Handling

- Attachment uploads must respect documented type and size constraints.
- Attachment access and deletion rules must preserve the role model and audit expectations.

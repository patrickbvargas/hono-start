# Security

## Approved financial redesign — target precedence

Status: approved plan, not implemented. [Target financial contract](../domain/FINANCIAL_SYSTEM.md) and its linked roadmap/UML/authorization supersede conflicting financial and identity semantics below for the ordered redesign. Remaining text describes the preserved running baseline and unchanged house rules; do not infer target implementation from it.

Target financial scope and exact-key catalog are in FINANCIAL_AUTHORIZATION.md. Member confidentiality covers every response/aggregate/evidence path. Verify Person/profile and current Organization; never trust client authority or polymorphic IDs. Denied batch lines roll back all effects. No provider mutations in planning.


Permission membership checks use `hasPermission(session, "org:clients:read")`.
This function returns the result of an exact `session.permissions.includes(key)`
check, or false without a session. Call sites use Clerk keys directly; do not add
local aliases, role matrices, wildcard expansion or translated action registries.
When either scoped grant qualifies, list the keys explicitly at the call site.
Resource enforcement (`can` / `assertCan`) additionally preserves same-firm,
assignment, ownership and lifecycle rules. Those rules never grant missing keys.

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

- Operational queries, writes and referenced operational parents must use the authenticated current Firm.
- Global Client, Employee and lookup records intentionally have no Firm ownership; current membership and action grants remain required.
- Shared master IDs do not authorize another Firm's operations. Evidence visibility follows its owner, independently of origin firmId. See [Multitenancy](../domain/MULTITENANCY.md).
- Session-derived scope utilities in `src/shared/session` are the canonical place for access-policy composition in this repository.

## Session Policy Shape

- Session contains the Clerk identity and current permission grants, a required business Employee binding, the employee type, and the Firm configured in active Organization privateMetadata.firmId. It carries no local role or duplicate Employee ID in the account profile.
- `server.ts` verifies Clerk state and resolves business context once per request. It never computes grants from business data.
- Session has four implementation modules: `schema.ts` holds the Zod contract, permission keys and types; `server.ts` holds verification and middleware; `client.tsx` holds route queries, React context and identity-change invalidation; `access.ts` holds resource checks and business scopes. `index.ts` exports browser-safe APIs. Protected server operations import middleware and resolvers directly from `server.ts`.
- React consumers read `useLoggedUserSession()` from the route provider and use ordinary permission checks. There is no separate session store or local credential lifecycle.
- Session scope utilities derive tenant-scoped or actor-scoped access for each subject area.
- Session policy utilities decide whether an action is allowed against a resource and must remain aligned with the domain role model.

## Sensitive Data Rules

- Database errors, stack traces, and internals must not be exposed to end users.
- Sensitive role-scoped data must follow the documented role model.
- Audit-trail data is append-only. Audit read permission also requires current read access to the audited entity; enforce the same scope on history, lists, counts, options and direct details.

## Security And Compliance Summary

- Input validation is required before accepting user input.
- Audit trail is mandatory and immutable.
- Data isolation is tenant-scoped when the product is multi-tenant.
- Role enforcement governs protected actions.
- Business data retention uses soft deletion; attachment deletion permanently removes metadata and binaries as defined in `docs/domain/DOMAIN_MODEL.md`.
- Sensitive scoped data stays restricted by role and resource scope.
- Authentication security includes rate-limited failed-login behavior.

## Environment And Secrets

- Application code reads environment configuration through the validated environment layer.
- Do not access raw environment variables directly in arbitrary application modules.

## File Handling

- Attachment uploads must respect documented type and size constraints.
- Attachment access and deletion rules must preserve the role model and audit expectations.

## Clerk authority and enforcement

- Clerk is the only authentication and permission-grant authority. Local role names never bypass checks.
- The official SDK verifies auth context; `src/start.ts` explicitly includes CSRF middleware for server functions.
- Every protected request verifies current provider session, user restrictions, Organization membership and private Firm mapping; request-local reuse avoids repeated lookups within that request. Provider failures deny execution.
- Custom permission grants derive from current Backend API membership state, not stale JWTs, client metadata or webhook delivery.
- The required metadata Employee binding establishes the business actor. Active/deleted, assignment and writable-resource constraints remain server-side domain checks; Firm is resolved only from current server-fetched Organization privateMetadata.firmId, strictly validated as a positive integer and an existing Firm. Public/unsafe metadata and client inputs never grant Firm access; no default-Firm fallback exists.
- Clerk owns credential policy, email verification, session duration and attack protection.
- Webhooks verify the raw request signature and deduplicate delivery IDs. They never synchronize authentication data into Employee.
- Public keys use the Vite public boundary. Secret/webhook keys use validated server env only.
- See CLERK_MIGRATION.md for deployment, rate-limit and cutover prerequisites.

## Business and authentication isolation

See `docs/domain/DOMAIN_MODEL.md` for ownership boundaries. Authentication resolves the required business actor through server-validated Clerk privateMetadata.employeeId. Employee UI contains business fields only; account administration belongs to Clerk Dashboard.

## Private attachment storage

Attachment binaries use private Supabase Storage storage. Only authenticated owner-authorized application requests deliver bytes. Server-only credentials have bucket-scoped access; responses use private/no-store and nosniff. See ATTACHMENTS.md.

Employee is global. The same active Employee ID and type remain bound across authorized Organizations; each membership supplies its own current grants. Missing, invalid, inactive or deleted bindings deny the session for every role, including administrators. Organization changes clear prior-unit caches, and operational scope is derived afresh on the server.

## Company-wide clients and employees

See [Multitenancy](../domain/MULTITENANCY.md) for the authoritative entity-scope matrix, global lifecycle, evidence visibility and current-Firm enforcement.

## Required configuration feedback

The request-local session resolver exposes a Zod-validated ready/configuration_required/unauthenticated result. Only verified active members receive configuration issue codes; private metadata values are never returned in denied results. Both malformed/missing fields are reported together before domain lookup. Optional session readers still return null on denial; required server readers reject configuration failures with a safe configuration message. Provider errors remain errors, rather than configuration findings. Login recovery uses the same resolver and existing Organization selection, retry and logout flows. Defensive nullable actor types remain supported by resource helpers, but server resolution never emits an unbound actor.

Outside the explicit post-login organization-choice step, Organization selection is hidden whenever any employeeId or firmId configuration issue exists, including combined issues, because required metadata must be corrected in Clerk. The post-login step allows members of multiple Organizations to choose a unit before configuration recovery; it never grants protected product access. Retry and sign-out remain available. Organization selection remains available before selection or for other access denials without configuration findings.

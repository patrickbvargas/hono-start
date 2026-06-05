## Context

The current application uses a legacy auth provider for identity, session, password, and recovery flows. That implementation also depends on Prisma-managed provider tables and provider-specific APIs in shared auth, session resolution, authentication flows, and administrator employee-access flows.

The target direction is different: Supabase Auth must become the canonical authentication provider, and the data model must be ready for future Supabase RLS adoption. The project does not require a one-to-one migration of legacy-provider internals because it is still under active development, but it does require preserving the documented product behavior around login, protected routes, password reset, forced password change, collaborator access grant/revoke, tenant isolation, and role-derived authorization.

This change is cross-cutting:

- shared auth clients and environment configuration change
- shared session resolution changes
- employee access management changes
- authentication UI orchestration changes
- Prisma schema and seed data change
- auth-related tests change

The repository already uses Supabase for storage, so Supabase Auth aligns the auth provider with the broader platform direction. The design must also avoid creating a second custom auth system in Prisma, because that would fight the future RLS model instead of preparing for it.

## Goals / Non-Goals

**Goals:**

- Adopt Supabase Auth as the only identity, password, and session provider.
- Remove all legacy-provider compatibility artifacts once Supabase flows pass locally.
- Preserve the product-facing authentication behavior that the docs require, even when internal implementation details change.
- Keep authorization and tenant scope authoritative in domain data derived from the linked employee, firm, role, and employee-type records.
- Move access lifecycle flags such as `isAccessEnabled` and `mustChangePassword` into domain-owned state so they survive provider changes and remain available for future RLS policies.
- Prepare a stable identity linkage that future RLS policies can evaluate through `auth.uid()` and employee-domain relationships.
- Finish rollout by dropping provider-shadow Prisma auth tables and tests that no longer match the canonical architecture.

**Non-Goals:**

- Implement row-level security policies in this change.
- Preserve legacy-provider internal tables, APIs, or hashing formats.
- Rebuild authorization around JWT claims alone.
- Move all business queries from Prisma to Supabase APIs.

## Decisions

### Decision: Supabase Auth owns identity and session lifecycle

The application will use Supabase Auth for sign-in, sign-out, password recovery, password updates, and administrator-auth user lifecycle.

Why:

- This follows the native provider model instead of emulating legacy-provider behavior on top of Supabase.
- It removes the need to keep Prisma-managed auth provider tables in sync with the real auth source.
- It aligns with the future RLS direction where authenticated database access centers on Supabase identity.

Alternatives considered:

- Keep the legacy provider and add Supabase only for future RLS preparation.
  Rejected because it prolongs dual-provider complexity and delays convergence on the target platform.
- Recreate legacy-provider-style session tables in Prisma while using Supabase only for credential verification.
  Rejected because it creates a shadow auth system and undermines future RLS alignment.

### Decision: Domain access flags move to `Employee`

Administrator-controlled access flags such as `isAccessEnabled` and `mustChangePassword` will live on the employee domain record instead of provider-owned auth tables.

Why:

- These flags represent product behavior, not generic auth provider state.
- Administrators manage collaborator access through employee workflows, so the authoritative state belongs with the employee lifecycle.
- Future RLS and authorization checks need domain-owned state that is queryable without depending on provider-private tables.

Alternatives considered:

- Store these flags in Supabase `user_metadata`.
  Rejected because user-editable metadata is not safe for authorization decisions.
- Store these flags in Supabase `app_metadata` only.
  Rejected because the application still needs authoritative domain state and predictable relational access from Prisma-backed business flows.

### Decision: Link Supabase identities directly from `Employee`

The first implementation will add `authUserId` directly to `Employee` as the stable link to `auth.users.id`.

Why:

- The relation is one-to-one in the current product model.
- The field is simple to query from session resolution and future RLS policies.
- It minimizes joins and migration complexity during the provider cutover.

Alternatives considered:

- Introduce a separate `auth_identities` table now.
  Deferred because the current needs are one auth identity per employee, and a direct field keeps rollout simpler.
- Resolve employees by email only.
  Rejected because email changes are product-managed events and should not be the durable auth key.

### Decision: Shared session helpers derive the domain actor from Supabase session plus employee linkage

The canonical session helpers in `src/shared/session` will stop reading legacy-provider session state and instead:

1. resolve the current Supabase session
2. extract the authenticated auth user id
3. find the linked employee by `authUserId`
4. verify employee access state and lifecycle
5. build the existing logged-user domain actor shape

Why:

- This preserves the repository's documented session and authorization shape for downstream consumers.
- It keeps tenant and role decisions derived from domain data instead of from client-submitted or stale token data.
- It allows future claims and RLS work without breaking feature-level consumers now.

Alternatives considered:

- Rewrite every feature to consume raw Supabase session objects.
  Rejected because it would spread provider concerns across the app and break existing authorization boundaries.
- Trust JWT claims as the sole role and tenant source immediately.
  Rejected because claims freshness and rollout complexity make that too risky for the provider migration step.

### Decision: Supabase-native flows replace legacy-provider-specific flows, with app-side orchestration for product rules

The application will use Supabase-native APIs for login, logout, password reset, and password change, while app-side orchestration preserves product rules such as OAB login normalization, forced password change, protected route redirects, and administrator-issued temporary passwords.

Why:

- This keeps the provider interaction idiomatic while preserving business behavior.
- It limits custom code to product-specific logic rather than to generic auth plumbing.

Alternatives considered:

- Preserve the exact legacy-provider API surface behind a compatibility wrapper.
  Rejected because it would encode the old provider model into the new implementation.

### Decision: Cleanup finishes with full legacy-provider removal

The rollout will introduce Supabase-linked employee access fields first, switch runtime flows second, and then remove legacy-provider tables, Prisma models, generated types, tests, and docs once the Supabase-native paths are verified.

Why:

- This keeps risk low during cutover while still converging on one canonical auth implementation.
- It prevents the repository contract from drifting into a dual-auth shape that future contributors might treat as intentional.

Alternatives considered:

- Keep the legacy provider schema and code indefinitely after Supabase runtime migration.
  Rejected because it leaves dead database objects, stale generated Prisma surfaces, and misleading tests in the codebase.

## Risks / Trade-offs

- [Supabase session behavior differs from the legacy provider session behavior] → Preserve the product contract in route guards and shared session helpers, and document any unavoidable session-policy differences before implementation.
- [Access revocation may not invalidate already-issued short-lived access tokens instantly] → Enforce `isAccessEnabled`, `isActive`, and `deletedAt` checks whenever protected server session resolution occurs, and revoke refresh-backed sessions through Supabase admin operations.
- [Employee records may lack a valid auth linkage during rollout] → Build migration and bootstrap scripts that create or relink Supabase users before cutover, and fail protected access safely when no valid linkage exists.
- [Auth migration and future RLS work could become entangled] → Explicitly keep RLS out of this change and prepare only the identity linkage and domain access fields required for later policy work.
- [Existing tests may encode legacy-provider internals] → Rewrite tests around documented product behavior and shared session contracts rather than provider-specific tables or method names.

## Migration Plan

1. Add new employee access fields and keep the legacy provider schema untouched for the moment.
2. Introduce Supabase browser, server, and admin auth clients plus validated environment keys.
3. Update shared session resolution to support Supabase-linked identities and domain access checks.
4. Replace authentication feature flows with Supabase-native login, logout, password reset, password change, and forced-change orchestration.
5. Replace employee-management access grant, revoke, and password reset flows with Supabase admin operations.
6. Update seeds and bootstrap tooling so development users can be recreated or relinked in Supabase Auth.
7. Run auth-focused tests against the new domain contract and remove legacy-provider assumptions from the suite.
8. Switch the runtime to Supabase Auth in development and staging.
9. Remove legacy-provider runtime code, Prisma models, generated types, and tests once the new flows are verified.
10. Drop deprecated legacy-provider tables in the same cleanup phase so the repository no longer models a shadow auth provider.

Rollback strategy:

- Keep legacy-provider tables and code available only until Supabase Auth flows are validated in this change.
- Gate schema cleanup behind successful verification of the new auth flows and updated tests.
- If rollout fails before cleanup, restore the previous runtime wiring before applying the destructive cleanup migration.

## Open Questions

- Which Supabase session settings and plan capabilities will the project use for remembered-session behavior and any advanced auth hooks?
- Will the implementation store `authUserId` as a direct nullable field on `Employee` only, or is there any near-term need for a separate auth-identity relation table?
- Will password reset and recovery emails use Supabase-managed templates initially, or does the project need a custom email hook in the first migration step?
- Does the team want to preserve the current failed-login threshold in app-managed logic first, or defer to Supabase-native protections until a later hardening pass?

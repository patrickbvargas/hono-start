## Why

Authentication currently depends on Supabase Auth while application code and local role lookups define authorization grants. Move identity, sessions, organization membership, roles, and permission grants to Clerk so access can be administered without editing an application role matrix, while retaining the documented feature structure and firm isolation.

## What Changes

- Adopt the official Clerk TanStack React Start SDK, provider, request middleware, server authentication, and supported authentication/account UI.
- Map each Firm to one Clerk Organization and each enabled Employee to a Clerk User and organization membership. Clerk becomes the authority for authentication and permission grants.
- Replace local Administrator/User permission branches with Clerk Custom Permissions, including explicit all-versus-assigned/own scopes. Keep tenant, assignment, ownership, and lifecycle predicates as server-side data enforcement, not as a second role-to-permission authority.
- Follow Clerk's `org:<feature>:<permission>` key format; preserve native `org:sys_*:*` System Permissions for Clerk features and use Custom Permissions for business features.
- **BREAKING** Replace Supabase identities and UUID-only identity links with Clerk string identifiers; existing sessions end at cutover.
- **BREAKING** Prefer Clerk-native email login, invitations/account setup, password recovery, account management, pending-session tasks, and session policy over custom OAB credential resolution, temporary-password issuance, and per-login remember-me durations. Update the owning contracts explicitly.
- Preserve pt-BR product language, thin routes, feature API/data/hooks/schemas ownership, shared UI boundaries, TanStack Query, TanStack Form, Prisma, and Zod.
- Add repeatable identity/organization migration, verified lifecycle synchronization, restrictive access handling, and a documented cutover/recovery procedure.

## Capabilities

### New Capabilities

- `clerk-identity-lifecycle`: Provider integration, tenant/employee identity mapping, synchronization, migration, and reconciliation.

### Modified Capabilities

- `authentication`: Clerk-native authentication, recovery, account management, pending-session handling, and session/cache transitions.
- `session-authorization`: Clerk-granted permission evaluation, organization-scoped actor resolution, and scope-aware enforcement without local role grants.
- `employee-management`: Clerk-backed access provisioning, membership removal/restoration, configurable roles, and account recovery instead of local credentials.

## Impact

- `src/shared/session/*`, authentication-related shared libraries, validated environment configuration, root/start integration, auth routes, and account UI.
- `src/features/authentication/*`, `src/features/employees/*`, all authorization consumers, scoped feature data queries, dashboards, exports, attachments, navigation, and associated tests.
- Prisma Firm/Employee links, removal of local authorization-role dependencies, seed/bootstrap setup, and a generated DB migration are required. Historical business IDs and audit actors remain stable.
- Canonical domain and implementation docs must change before runtime implementation. Existing Administrator/User capabilities become initial Clerk role grants, not immutable runtime role names.
- Clerk development/production configuration, supported SDK version, custom-permission entitlements and limits, membership lifecycle, and webhook delivery become deployment prerequisites.

## Non-goals

- Migrating PostgreSQL hosting or replacing Supabase Storage in this change. Storage-only Supabase configuration remains until its separate migration.
- Replacing the ORM, framework, form library, query cache, folder structure, or shared UI layer.
- Claiming Clerk Organizations RBAC is an arbitrary per-contract policy engine. Contract assignments and business-state validation remain persisted domain facts, enforced using scopes granted by Clerk. A requirement to edit arbitrary per-record policies entirely inside Clerk would require a separate capability decision.

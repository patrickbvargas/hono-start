## Why

The project's current authentication implementation is built around a legacy auth provider, but the product direction now requires adopting Supabase Auth as the canonical identity and session provider while preserving the documented product behavior. Making this change now lets the team align authentication with the future Supabase security model, including planned row-level security, without carrying forward a provider-specific auth schema that no longer matches the target platform.

## What Changes

- Replace the legacy auth provider as the product's identity, session, password, and recovery provider with Supabase Auth.
- Rework the shared session resolution flow so authenticated domain context is derived from the Supabase session plus linked employee, firm, role, and employee-type records.
- Move administrator-managed access flags and forced-password-change state onto domain-owned employee access fields instead of legacy provider-owned tables.
- Recreate administrator access grant, access revoke, and temporary-password reset flows on top of Supabase Auth admin operations.
- Remove all legacy auth runtime code, Prisma models, database tables, tests, and documentation references once Supabase-native flows are verified.
- Align auth integration points with the documented Supabase SSR, browser, password, and admin-client patterns instead of preserving compatibility shims from the prior provider.
- Preserve the documented login, password reset, forced password change, protected route, and logout product behavior while allowing implementation details such as session storage and auth table structure to change.
- Prepare the authentication-domain linkage so future Supabase RLS policies can rely on stable auth user identity without reworking the employee access model again.

## Non-goals

- Implement Supabase RLS policies in this change.
- Migrate legacy auth database tables one-to-one into Prisma-managed replacements.
- Preserve prior auth-provider internal APIs, tables, hashes, or session semantics when Supabase-native behavior is sufficient.
- Keep deprecated legacy-provider tables as rollback ballast after the Supabase cleanup is complete.
- Redesign product permissions, tenant scope rules, or employee-management UX beyond the auth-provider migration needs.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `authentication`: change the authentication provider contract from legacy-provider credential flows to Supabase Auth-backed credential, reset, password-change, forced-change, protected-route, and logout flows while preserving documented product behavior.
- `employee-management`: change administrator access-grant, access-revoke, and temporary-password reset behavior so it manages Supabase-linked collaborator access instead of legacy auth records.
- `session-authorization`: change authenticated session resolution so shared server and client session helpers derive the domain actor from Supabase-authenticated identity linked to employee, firm, role, and employee-type records.

## Impact

- Affected code: `src/shared/lib/auth*`, `src/shared/session/*`, `src/features/authentication/*`, `src/features/employees/*`, environment validation, Prisma schema, seeds, and auth-related tests.
- Affected dependencies and systems: legacy provider removal, Supabase Auth client/server/admin integration, Supabase project auth configuration, and email/password recovery flows.
- Multi-tenant impact: tenant and role authority remain server-derived from the linked employee and firm records; the change must preserve firm isolation and future RLS readiness.
- Affected roles: all authenticated users, plus administrators who grant, revoke, or reset collaborator access.

## Why

The current collaborator access flow still relies on `public.employees.isAccessEnabled` as the primary login gate, which keeps access control split between application state and Supabase Auth state. We want revoked access to be enforced by the auth provider itself so login denial, unblocking, and session handling follow the native Supabase Auth model without extra application-side gating.

## What Changes

- Replace the application-managed collaborator login gate based on `employees.isAccessEnabled` with Supabase Auth `ban/unban` as the authoritative access-control mechanism for credential login.
- Update grant-access and revoke-access flows so they unban or ban the linked Supabase Auth user instead of only toggling a domain flag.
- Keep `employees.authUserId` as the application-to-auth linkage while removing the requirement that login eligibility depends on an application-side access-enabled flag.
- Update login behavior so revoked collaborators are denied by the Supabase Auth account state rather than by a post-auth application lookup.
- Align employee access UI, seed data, tests, and specs with the new provider-native access-control lifecycle.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `authentication`: credential login eligibility and revoked-access behavior will move from an app-managed access flag to Supabase Auth account ban state.
- `employee-management`: grant-access, revoke-access, and password-reset requirements will use Supabase Auth ban/unban and session invalidation semantics as the source of truth for collaborator access.

## Impact

- Affected roles: administrators who grant/revoke/reset collaborator access, and collaborators who sign in with credential accounts.
- Multi-tenant impact: firm isolation remains unchanged because employee lookup, authorization, and audit boundaries still derive tenant scope from the authenticated session.
- Affected code: employee access mutations, authentication login flow, employee detail access UI, Prisma schema/migrations if `isAccessEnabled` is removed or downgraded, seed reconciliation, and auth/employee Vitest coverage.
- Affected systems: Supabase Auth admin API (`updateUserById` with ban state, session revocation), `public.employees`, and OpenSpec contracts for authentication and employee management.

## Non-goals

- This change does not alter public login routes, remembered-session duration rules, or password policy requirements.
- This change does not redesign employee lifecycle concepts such as `isActive`, soft delete, or firm-scoped authorization.

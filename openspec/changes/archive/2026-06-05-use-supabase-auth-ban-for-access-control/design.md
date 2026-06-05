## Context

The current collaborator access lifecycle is split across two systems. Supabase Auth stores the credential identity in `auth.users`, while the application stores access enablement in `public.employees.isAccessEnabled`. This means a collaborator can still authenticate with the provider and only be denied afterward by application logic, which duplicates responsibility and makes grant/revoke behavior less native to Supabase Auth.

The project already uses Supabase Auth as the only credential provider and keeps `employees.authUserId` as the linkage between the domain model and `auth.users.id`. That makes Supabase Auth account state a better source of truth for whether a collaborator may sign in.

## Goals / Non-Goals

**Goals:**
- Make Supabase Auth ban state the authoritative control for collaborator credential access.
- Keep employee-to-auth linkage through `employees.authUserId`.
- Simplify login so access denial happens at the provider boundary rather than after successful authentication.
- Keep administrator access-management workflows and audit visibility coherent in the employee details experience.
- Preserve firm isolation and shared authorization boundaries.

**Non-Goals:**
- Redesign password policy, remembered-session behavior, or public authentication routes.
- Change employee lifecycle semantics for `isActive`, soft delete, or role-based authorization.
- Introduce multiple auth providers or a generalized external-identity abstraction.

## Decisions

### 1. Use Supabase Auth `ban/unban` as the access-control source of truth
Grant-access will unban the linked auth user, and revoke-access will ban the linked auth user. Login eligibility will therefore follow the provider's auth account state instead of an application-side access flag.

Why:
- Prevents a revoked collaborator from successfully completing provider authentication.
- Aligns access control with the single auth provider already used by the system.
- Reduces custom login gating logic and removes duplicated access state.

Alternative considered:
- Keep `isAccessEnabled` as the source of truth and continue checking it after sign-in.
  Rejected because it keeps the split-brain model and forces the app to compensate for a provider-authenticated but business-rejected user.

### 2. Remove `employees.isAccessEnabled` instead of keeping it as a mirrored field
The application will continue to store `authUserId`, but `isAccessEnabled` will be removed from the employee model if no other documented business rule depends on it.

Why:
- A mirrored field can drift from provider truth.
- The domain meaning of "can this collaborator log in?" becomes unambiguous.
- Employee access UI can derive state from the linked auth user status when loading details.

Alternative considered:
- Keep `isAccessEnabled` as a denormalized display field.
  Rejected unless implementation constraints make provider-state reads impractical, because it reintroduces synchronization work and migration risk without adding business truth.

### 3. Keep `employees.authUserId` as the stable linkage to `auth.users`
The employee record will still own the application-domain association to the auth user, and employee-management flows will continue to use that linkage for grant, revoke, reset, and session-oriented admin operations.

Why:
- The app still needs a firm-scoped collaborator record independent from auth-provider fields.
- It preserves the existing session resolution and domain authorization model.
- It keeps migrations focused on access state rather than identity ownership.

Alternative considered:
- Resolve employee linkage by email only.
  Rejected because email can change and is less stable than the provider UUID.

### 4. Revoke and reset actions must continue to revoke active sessions
Revoke-access and admin password reset will keep revoking the collaborator's active sessions in addition to banning or updating credentials.

Why:
- Ban state should stop future logins, but active sessions must also be invalidated for immediate effect.
- This preserves the current security expectation already described in specs.

Alternative considered:
- Ban only and wait for token/session expiry.
  Rejected because it weakens the immediate-lockout contract for administrators.

### 5. Login copy should distinguish revoked access from invalid credentials only when the provider/domain state allows it safely
If Supabase returns a ban-related denial that can be mapped safely, the login flow may show a dedicated revoked-access message. Otherwise, the flow should fall back to the existing safe invalid-credentials copy.

Why:
- The product wants better user feedback for revoked collaborators.
- Supabase error payloads can be provider-specific, so the mapping must remain safe and resilient.

Alternative considered:
- Always show the same invalid-credentials message.
  Rejected because it hides an explicit admin action and makes support harder when the account is intentionally blocked.

## Risks / Trade-offs

- [Provider error semantics differ from current app logic] → Map only stable, documented Supabase auth denial signals and keep safe fallback copy for unknown cases.
- [Removing `isAccessEnabled` touches multiple slices] → Update Prisma schema, generated client, seed, employee queries, detail UI, and focused tests in one change.
- [Provider-state reads may add complexity to employee detail queries] → Centralize auth-user status resolution in feature-local server data access rather than scattering provider calls.
- [Session revocation API behavior may differ from assumption] → Verify current Supabase admin/session semantics before implementation and keep explicit tests around revoke/reset flows.

## Migration Plan

1. Add the OpenSpec delta specs and implementation tasks.
2. Update employee access mutations to ban/unban linked Supabase users and keep session revocation on revoke/reset flows.
3. Update login handling to rely on provider denial plus active/non-deleted employee linkage checks.
4. Remove `isAccessEnabled` from Prisma schema, migrations, seed, employee queries, UI contracts, and tests if no remaining requirement needs it.
5. Run database reset/seed and focused auth/employee tests, then the standard typecheck/test/build verification.

Rollback strategy:
- Reintroduce application-side gating with the previous `isAccessEnabled` column and revoke/grant toggles if provider-state integration proves unstable.
- Because the change is centered on one auth provider, rollback remains localized to auth and employee-access slices plus Prisma migrations.

## Open Questions

- Which exact Supabase admin/session API should be the canonical session-revocation path for revoke-access and admin password reset in the installed SDK version?
- Do we want employee list/detail screens to surface provider ban state directly as "Acesso concedido/revogado", or should the UI rename the concept to reflect auth-account status more explicitly?

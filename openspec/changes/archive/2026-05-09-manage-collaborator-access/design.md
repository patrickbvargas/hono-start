## Context

The repository already has three adjacent behaviors:

- employee management is administrator-only and already exposes employee details, create/edit, delete/restore, and temporary-password reset for collaborators with credential accounts.
- authentication uses provedor legado de auth with `disableSignUp: true`, so only pre-created credential accounts can sign in.
- the shared server session helper already rejects protected access when the linked employee is deleted or inactive, but there is no administrator-facing way to grant or revoke access in the first place.

This creates a product gap: employee records exist independently of credential access, yet only seeded provedor legado de auth rows can log in. The requested change keeps provedor legado de auth as the current auth provider and adds explicit administrator-managed access provisioning without waiting for the separate auth-migration change.

## Goals / Non-Goals

**Goals:**
- Let administrators grant system access to an employee from the employee details flow.
- Let administrators revoke access without deleting the provedor legado de auth user row, so access can be granted again later.
- Force a password change the first time a newly granted collaborator signs in.
- Block login for revoked, inactive, or soft-deleted employees.
- Revoke active sessions when access is revoked.
- Keep audit history for access-management actions without persisting plaintext passwords.

**Non-Goals:**
- Replacing provedor legado de auth or changing the login identifier contract.
- Building self-signup, invite emails, or non-admin access-management flows.
- Introducing a new domain table just to mirror auth access state.
- Changing the one-employee-to-one-login assumption.

## Decisions

### 1. Access state will be derived from provedor legado de auth credential-account presence plus an explicit account flag

Decision:
- Reuse the existing provedor legado de auth `user` row linked by `employeeId`.
- Extend the provedor legado de auth `user` table with an `isAccessEnabled` boolean.
- Treat a collaborator as able to authenticate only when:
  - a linked `user` row exists,
  - `isAccessEnabled = true`,
  - the linked employee is active and not soft-deleted,
  - a credential account exists.

Rationale:
- Missing `account` already means password sign-in cannot succeed.
- A separate enable/disable flag avoids destructive account deletion and supports cheap re-enable.
- Keeping state on `user` avoids inventing another access table for a one-to-one relationship.

Alternatives considered:
- Delete the credential account on revoke: simpler to reason about, but makes re-enable act like reprovisioning and discards the current auth linkage.
- Add a feature-local access table: more explicit, but duplicates a one-to-one relationship already anchored by provedor legado de auth `user`.

### 2. Grant access will create or reactivate provedor legado de auth rows and issue a temporary password

Decision:
- Add a server-side employee mutation that:
  - finds or creates the provedor legado de auth `user` row for the employee,
  - finds or creates the `credential` account,
  - hashes a generated temporary password,
  - sets `mustChangePassword = true`,
  - sets `isAccessEnabled = true`,
  - clears existing sessions for that auth user,
  - returns the temporary password once to the admin UI.

Rationale:
- This matches the current reset-password UX and keeps onboarding/re-onboarding consistent.
- It avoids any public signup flow.
- Clearing sessions on grant gives a clean state if the account previously existed.

Alternatives considered:
- Grant access without forcing a password change: weaker operational security.
- Auto-email a reset link: out of scope and not guaranteed by current product setup.

### 3. Revoke access will be a logical block, not record deletion

Decision:
- Revoke access by setting `user.isAccessEnabled = false` and deleting all active sessions for that auth user.
- Keep the user and credential account rows intact.

Rationale:
- Matches the requested "block and later unblock" workflow.
- Preserves identity linkage and avoids recreating auth rows.
- Session deletion immediately removes active access.

Alternatives considered:
- Delete sessions only: insufficient, because the next login would still work.
- Null out the password hash: possible, but less explicit than an access-enabled flag and complicates restore semantics.

### 4. Login blocking will happen before provedor legado de auth sign-in

Decision:
- Extend the authentication data layer so login first resolves the employee by email/OAB and loads access-eligibility data.
- Reject login with the same safe invalid-credentials error when:
  - no matching active employee exists,
  - no linked auth user exists,
  - `isAccessEnabled = false`,
  - no credential account exists.

Rationale:
- Keeps safe non-enumerating feedback.
- Avoids depending on undocumented provedor legado de auth middleware for this repository-specific rule.
- Aligns with existing pre-sign-in failed-attempt protection.

Alternatives considered:
- provedor legado de auth request hook for `/sign-in/email`: viable, but adds auth-library coupling where the repository already owns login orchestration in feature code.

### 5. Employee details will remain the admin control center for access

Decision:
- Extend employee detail read models with access-state fields:
  - `hasCredentialAccount`
  - `isAccessEnabled`
  - derived `accessStatus`
- Show:
  - `Conceder acesso` when no usable access exists.
  - `Revogar acesso` when access is currently enabled.
  - `Resetar senha` only when a credential account exists and access is enabled.

Rationale:
- Keeps all employee/account administration in one existing admin-only surface.
- Reuses current drawer/action patterns and avoids inventing a second management route.

Alternatives considered:
- Add access controls to the create/edit modal: heavier form complexity and worse fit for one-time generated-password disclosure.

## Risks / Trade-offs

- Revoked account still keeps hashed credential history -> acceptable because `isAccessEnabled` and session revocation remain authoritative blockers.
- Existing data could contain a linked `user` without a credential account -> grant-access mutation must handle both create and repair paths.
- Login denial for inactive employees now happens before provedor legado de auth -> mitigation: keep the same safe invalid-credentials message and reuse failed-attempt tracking.
- New auth-table flag requires a Prisma migration -> mitigation: default `true` for existing seeded users so current access is preserved after migration.

## Migration Plan

1. Add `isAccessEnabled` to the provedor legado de auth `user` table with default `true`.
2. Regenerate Prisma client.
3. Update auth configuration additional fields and login resolution.
4. Add employee access-management mutations and UI.
5. Add tests for grant, revoke, and blocked login behavior.

Rollback:
- Revert code to ignore `isAccessEnabled`.
- Keep the column in place if rollback must be low-risk; it is additive and non-destructive.

## Open Questions

None for this MVP.

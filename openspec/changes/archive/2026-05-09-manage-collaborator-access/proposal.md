## Why

Administrators can already manage employee records and reset passwords for collaborators who already have credential accounts, but the product still lacks a normal operational flow to grant or revoke access for the rest of the team. Right now, access effectively depends on seeded auth rows, which breaks the documented employee-account management contract and prevents administrators from controlling who can enter the system.

## What Changes

- Add an administrator-only access-management flow on employee details so an administrator can grant system access to a collaborator who does not yet have a credential account.
- Add an administrator-only revoke-access flow that blocks future logins without deleting the employee or requiring account recreation later.
- Reuse temporary-password and forced-password-change behavior when access is granted so the collaborator must choose a new password on first use.
- Ensure revoked access and inactive/deleted employees cannot authenticate, and revoke active sessions when access is revoked.
- Surface access state in the employee-management UI with clear pt-BR labels and actions for grant, revoke, and password reset.
- Audit access grant and revoke mutations without storing plaintext passwords.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `authentication`: login eligibility now depends on active employee status and on whether administrator-managed access is currently granted.
- `employee-management`: employee details now include administrator-only grant-access and revoke-access flows in addition to password reset for existing credential accounts.

## Impact

- Affected code in `src/features/authentication`, `src/features/employees`, `src/shared/lib/auth`, and shared session/auth enforcement paths.
- Affected persistence in BetterAuth-backed `user`, `account`, and `session` tables, without introducing a new external dependency.
- Affected product contract in employee/account management behavior and authentication eligibility rules.

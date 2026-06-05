## Why

Authenticated users currently have a public password-reset flow but no in-product way to rotate a known credential. This forces an avoidable recovery workflow for a routine account-security action and leaves the authenticated shell without a documented password-change path.

## What Changes

- Add an authenticated change-password flow for users who know their current password.
- Expose the flow from the existing account entrypoint in the authenticated user menu.
- Validate current password, new password confirmation, and password policy with safe pt-BR feedback.
- Optionally revoke other active sessions when the password is changed.
- Update authentication product docs and OpenSpec requirements to cover authenticated password changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `authentication`: extend the authenticated account-security surface so signed-in users can change their password from inside the product shell.

## Impact

- Affected code: `src/features/authentication`, `src/features/app-sidebar`, shared authenticated-shell UI wiring, and focused authentication tests.
- Affected APIs: authenticated authentication mutation boundary gains a change-password server function backed by provedor legado de auth.
- Dependencies: reuse the existing `provedor-legado-auth` password-management API; no new runtime dependency or database migration.
- Roles and tenancy: available to all authenticated users and enforced from authenticated session context only.

## Non-goals

- No public self-service flow beyond the existing password reset.
- No employee-admin password management for other users.
- No profile page or standalone `/configuracoes` route in this change.

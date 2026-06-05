## Why

O reset por email está em espera, mas a operação ainda precisa de um caminho seguro para recuperar acesso de colaboradores. Hoje administradores não conseguem redefinir a senha de outro colaborador e o fluxo autenticado só cobre a troca voluntária da própria senha.

## What Changes

- Add an administrator-only employee password-reset action from the employee details drawer.
- Generate a simple temporary password, store only its hash, revoke the target user's sessions, and require a password change on the next login.
- Force authenticated users flagged for password rotation into a dedicated in-product password-change screen before they can access other protected routes.
- Reuse the authenticated change-password form shape for the forced password-change experience.
- Align authentication form defaults with the repository pattern by moving them into `src/features/authentication/utils/default.ts`.
- Update product docs and OpenSpec requirements for admin-managed password reset and forced password rotation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `authentication`: extend authenticated session handling to support forced password rotation after an administrator-issued temporary password reset.
- `employee-management`: extend the employee details surface with an administrator-only password-reset action for collaborators who already have a credential account.

## Impact

- Affected code: `src/features/authentication`, `src/features/employees`, `src/shared/session`, authenticated route guards, Prisma auth schema wiring, and focused auth/employee tests.
- Affected APIs: authentication gains an authenticated forced-change mutation; employee management gains an admin-only reset-password mutation.
- Dependencies: reuse existing provedor legado de auth credential hashing plus provider-owned auth tables; no new runtime dependency.
- Data model: add a persisted `mustChangePassword` flag to provedor legado de auth `User`.
- Roles and tenancy: only administrators can reset another collaborator password; forced password change applies only to the authenticated flagged user.

## Non-goals

- No email-based password recovery work.
- No creation of credential accounts for employees who do not already have one.
- No employee self-service reset without current password beyond the existing public reset flow.
- No standalone account settings area beyond the forced-password screen required by this flow.

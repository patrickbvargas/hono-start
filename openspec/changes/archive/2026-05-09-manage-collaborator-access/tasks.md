## 1. OpenSpec And Data Setup

- [x] 1.1 Add the OpenSpec proposal, design, and spec deltas for admin-managed collaborator access.
- [x] 1.2 Add the BetterAuth user access flag to the Prisma schema and migration, then regenerate affected auth typing/configuration.

## 2. Backend Access Management

- [x] 2.1 Extend authentication lookup and login enforcement so revoked, inactive, deleted, or non-provisioned collaborators cannot sign in and still receive safe invalid-credentials feedback.
- [x] 2.2 Implement employee access-management mutations for grant access and revoke access, including temporary password generation, session revocation, and audit-safe payloads.
- [x] 2.3 Extend employee detail queries and models with access-state fields needed by the admin UI.

## 3. Admin UI And Verification

- [x] 3.1 Update the employee details drawer and hooks to expose admin-only grant-access and revoke-access actions with pt-BR feedback.
- [x] 3.2 Add or update focused tests for login blocking, grant/revoke flows, and employee access-state rendering.
- [x] 3.3 Run `pnpm check` and `npx tsc --noEmit`, fix all resulting issues, and only then mark the implementation tasks complete.

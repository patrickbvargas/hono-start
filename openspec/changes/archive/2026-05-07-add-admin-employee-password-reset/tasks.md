## 1. OpenSpec and contract alignment

- [x] 1.1 Add OpenSpec spec deltas for admin-managed employee password reset and forced password change on next login.
- [x] 1.2 Update canonical product and implementation docs for the new reset and forced-change behavior.

## 2. Backend auth and employee reset flow

- [x] 2.1 Add persisted auth-user state for forced password change and expose it through the shared server session contract.
- [x] 2.2 Add an administrator-only employee reset-password mutation that generates a temporary password, hashes it, revokes target sessions, and records an audit-safe employee mutation without storing the plaintext password.
- [x] 2.3 Add an authenticated forced-change-password mutation that clears the required-reset flag after a successful new-password submission.

## 3. Frontend auth and employee UX

- [x] 3.1 Refactor authentication form defaults into `src/features/authentication/utils/default.ts` and keep the forced flow aligned with the existing change-password form shape.
- [x] 3.2 Add the admin reset-password action to the employee details drawer and show the generated temporary password in a one-time confirmation flow.
- [x] 3.3 Add a dedicated forced-password authenticated route and guard protected navigation so flagged users must update the temporary password before continuing.

## 4. Verification

- [x] 4.1 Add focused Vitest coverage for the new auth/session and employee reset contracts.
- [x] 4.2 Run focused tests plus `pnpm check` and `npx tsc --noEmit`, then fix any failures before closing the change.

## 1. Authenticated password-change boundary

- [x] 1.1 Add authenticated change-password input schema, safe error catalog entries, and provedor legado de auth-backed mutation handling in the authentication feature.
- [x] 1.2 Add focused server-side tests covering success, invalid current password, and revoke-other-sessions behavior for the new authenticated mutation.

## 2. Authenticated shell UI

- [x] 2.1 Add a feature-local change-password form hook and modal component that follow the shared app-form, toast, and mutation orchestration patterns.
- [x] 2.2 Wire the existing authenticated user-menu `Conta` entry to open the change-password modal without introducing a new route.

## 3. Contract alignment and verification

- [x] 3.1 Update canonical authentication docs to include authenticated password changes alongside login and password reset behavior.
- [x] 3.2 Run focused auth tests plus `pnpm check` and `npx tsc --noEmit`, then fix any failures before closing the change.

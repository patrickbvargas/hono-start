## 1. Auth foundation

- [x] 1.1 Add BetterAuth dependency, validated auth environment variables, and bootstrap/auth configuration files needed by TanStack Start.
- [x] 1.2 Add Prisma models and migration(s) required for BetterAuth persistence and for linking authenticated identities back to existing employees.
- [x] 1.3 Update development seed/setup so at least one administrator and one regular user can authenticate against existing employee records.

## 2. Shared session integration

- [x] 2.1 Replace mock-only `src/shared/session` readers with optional and required authenticated-session helpers backed by BetterAuth.
- [x] 2.2 Update shared session model, selectors, and scope helpers so protected consumers keep the current domain actor shape while public consumers can observe an unauthenticated state.
- [x] 2.3 Update protected server query/mutation wrappers and route guards to fail early on unauthenticated access without using placeholder session data.

## 3. Public auth experience

- [x] 3.1 Create `src/features/authentication` slice with login form schema, pt-BR UI, and submit flow for email-or-OAB plus password.
- [x] 3.2 Implement remember-me behavior, logout action, and safe invalid-credential feedback using BetterAuth session APIs.
- [x] 3.3 Implement password-reset request and reset-completion flows with safe non-enumerating messages.
- [x] 3.4 Implement failed-login protection for 5 failed attempts within 1 minute per normalized identifier.

## 4. Routing and shell enforcement

- [x] 4.1 Add public `/login` and `/recuperar-senha` routes and split public vs authenticated shells so the sidebar renders only for protected product screens.
- [x] 4.2 Redirect unauthenticated users from protected routes to `/login` and redirect authenticated users away from public auth screens to `/`.
- [x] 4.3 Wire authenticated navigation/session state so product routes continue using the existing role- and tenant-aware authorization rules after login.

## 5. Verification

- [x] 5.1 Add focused Vitest coverage for shared authenticated-session helpers, protected-route redirects, remember-me duration behavior, failed-login threshold enforcement, and password-reset flow handling.
- [x] 5.2 Run `pnpm check` and fix all issues.
- [x] 5.3 Run `npx tsc --noEmit` and fix all issues.

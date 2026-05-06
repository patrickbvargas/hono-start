## 1. OpenSpec And Shared Cache Boundary

- [x] 1.1 Add a shared session-side helper that clears auth-bound `QueryClient` cache state without requiring DB migrations.
- [x] 1.2 Keep the helper centralized in the session layer so login and logout reuse the same cache-boundary behavior.

## 2. Authentication Hook Implementation

- [x] 2.1 Update the login hook to clear authenticated query caches before refreshing the current session query and navigating into protected routes.
- [x] 2.2 Update the logout hook to use the same authenticated query cache-clearing helper before redirecting to `/login`.

## 3. Verification

- [x] 3.1 Add focused Vitest coverage for login and logout cache-clearing orchestration, including protected query removal and session refresh behavior.
- [x] 3.2 Run `pnpm check` and `npx tsc --noEmit`, fix any resulting issues, and only then mark the tasks complete.

## 1. Feature Slice Refactor

- [x] 1.1 Reshape `src/features/authentication/components` into the canonical leaf-folder layout and update the top-level feature barrel to expose only the route-facing auth surface.
- [x] 1.2 Normalize authentication component, hook, and prop naming so the slice follows the repository's documented conventions without changing login, logout, or password-reset behavior.
- [x] 1.3 Keep auth route composition declarative by updating `src/routes/login.tsx` and `src/routes/recuperar-senha.tsx` only as needed for the refactored feature exports and public-screen composition.

## 2. Public Auth UI Normalization

- [x] 2.1 Replace the bespoke authentication screen styling with shared UI composition from `@/shared/components/ui` while preserving the existing fields, helper text, actions, and public-route behavior.
- [x] 2.2 Ensure the login and password-reset forms continue to use feature-hook orchestration through `useAppForm`, with persistence, redirects, cache invalidation, and toast handling remaining outside the route files.
- [x] 2.3 Verify that no feature or route auth component introduces direct vendor UI imports, migration-layer imports, or new one-off styling patterns that conflict with the documented frontend contract.

## 3. Verification

- [x] 3.1 Add or update focused Vitest coverage for the refactored authentication flow where structure or UI composition changes could regress login and password-reset behavior.
- [x] 3.2 Run the relevant authentication tests and confirm no database migration is required for this refactor-only change.
- [x] 3.3 Run `pnpm check` and `npx tsc --noEmit`, fix any resulting issues, and leave the change in an implementation-ready state.

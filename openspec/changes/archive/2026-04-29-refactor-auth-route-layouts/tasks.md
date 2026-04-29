## 1. Route Layout Structure

- [x] 1.1 Create the `_app/route.tsx` pathless layout route to own authenticated session gating and render the shared authenticated shell through `Outlet`.
- [x] 1.2 Create the `_auth/route.tsx` pathless layout route to own the shared public authentication container for login and password-reset pages.
- [x] 1.3 Confirm no database migration or seed change is required for this routing refactor.

## 2. Protected And Public Route Migration

- [x] 2.1 Move authenticated route files under `src/routes/_app/` while preserving existing public URLs for `/`, `/clientes`, `/colaboradores`, `/contratos`, `/honorarios`, `/remuneracoes`, and `/audit-log`.
- [x] 2.2 Move `login` and `recuperar-senha` under `src/routes/_auth/` while preserving the existing public URLs and redirect behavior.
- [x] 2.3 Remove per-route authenticated shell wrapping from protected route leaves and keep route loaders focused on feature-specific prefetching only.

## 3. Validation

- [x] 3.1 Regenerate and verify the TanStack Router route tree reflects the `_app` and `_auth` pathless layouts without changing canonical paths.
- [x] 3.2 Add or update focused Vitest coverage for authenticated-route composition or session-route behavior impacted by the new layout ownership.
- [x] 3.3 Run `pnpm check` and `npx tsc --noEmit`, fix all resulting issues, and verify authenticated and public navigation flows still redirect correctly.

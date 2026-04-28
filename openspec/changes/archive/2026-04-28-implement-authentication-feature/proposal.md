## Why

The product contract already defines authentication, password reset, remembered sessions, and protected-route behavior, but the current codebase still exposes only authenticated product routes and shared session utilities without a real login entrypoint or reset flow. This leaves the repository misaligned with the documented product surface and blocks reliable tenant-scoped access from a real BetterAuth session.

## What Changes

- Add a real authentication feature with public `/login` and `/recuperar-senha` routes using pt-BR forms and validation.
- Implement BetterAuth-backed sign-in, sign-out, remembered-session duration, and protected-route session checks for authenticated product screens.
- Add failed-login protection that enforces the documented threshold of 5 failed attempts within 1 minute for the same identifier.
- Implement password-reset request and reset completion flows within current product scope.
- Replace placeholder or implicit session reads with a shared session contract derived from the authenticated BetterAuth session on both server and client consumers.
- Redirect unauthenticated users away from protected product routes and redirect successful login back to the dashboard.

## Capabilities

### New Capabilities
- `authentication`: public authentication routes, login and password-reset flows, remembered sessions, lockout behavior, logout, and protected-route redirects for authenticated screens

### Modified Capabilities
- `session-authorization`: shared session helpers must derive actor identity, firm scope, and role data from the real authenticated session source and handle unauthenticated access safely

## Non-goals

- No redesign of business-role semantics, tenant rules, or existing feature permission matrices.
- No broader notification platform beyond what is necessary to support password reset.
- No changes to core client, contract, fee, remuneration, attachment, dashboard, or audit-log business behavior beyond consuming real authenticated session context.
- No self-service registration or external client portal flows.

## Impact

- Affected routes: new `/login` and `/recuperar-senha`; protected handling for `/`, `/clientes`, `/colaboradores`, `/contratos`, `/honorarios`, `/remuneracoes`, and `/audit-log`
- Affected shared areas: `src/shared/session`, root-route auth gating, validated env/auth setup, and navigation behavior for authenticated vs public screens
- Likely affected dependencies and systems: BetterAuth configuration, persistence needed for session/account/recovery data, and delivery provider wiring for password-reset messages
- Affected roles: administrators and regular users both authenticate through the new flow; administrator-only and scoped-user permissions remain enforced after login
- Multi-tenant implication: authenticated session remains the only trusted source of firm and role scope, so all protected operations must continue deriving authority from session state rather than client input

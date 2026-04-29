## ADDED Requirements

### Requirement: Authentication route guards execute before route loading
The system SHALL enforce public-auth and protected-app route redirects in TanStack Router `beforeLoad` handlers instead of route `loader` functions. When an unauthenticated actor is redirected away from a protected route, the system MUST preserve the originally requested internal destination so the post-login flow can resume there safely.

#### Scenario: Unauthenticated user is redirected before protected route loading
- **WHEN** an unauthenticated user navigates to a protected route such as `/clientes`
- **THEN** the protected `_app` route redirects in `beforeLoad`
- **AND** the protected route loader does not act as the primary authentication gate

#### Scenario: Requested protected destination is preserved
- **WHEN** an unauthenticated user is redirected from a protected route to `/login`
- **THEN** the redirect payload includes the originally requested internal destination
- **AND** the login flow can navigate back to that destination after successful authentication

#### Scenario: Authenticated user is redirected away from public auth routes before loading
- **WHEN** an authenticated user navigates to `/login` or `/recuperar-senha`
- **THEN** the public auth route redirects in `beforeLoad`
- **AND** the public route loader does not act as the primary authenticated-user gate

#### Scenario: Unsafe redirect destinations are ignored
- **WHEN** the login flow receives a redirect destination that is missing, malformed, or not an internal route
- **THEN** the system ignores that destination
- **AND** the post-login flow navigates to the default authenticated entry route

# authentication Specification

## Purpose
TBD - created by archiving change implement-authentication-feature. Update Purpose after archive.
## Requirements
### Requirement: Public authentication routes exist outside the authenticated shell
The system SHALL expose `/login` and `/recuperar-senha` as public routes grouped under a TanStack Router pathless layout route at `_auth/route.tsx`. These routes SHALL render inside the shared public-auth container and SHALL NOT require an authenticated session or render the authenticated sidebar shell.

#### Scenario: Unauthenticated user opens login route
- **WHEN** an unauthenticated user navigates to `/login`
- **THEN** the system renders the login screen inside the `_auth` public container
- **AND** the authenticated product sidebar is not rendered

#### Scenario: Unauthenticated user opens password-reset route
- **WHEN** an unauthenticated user navigates to `/recuperar-senha`
- **THEN** the system renders the password-reset flow inside the `_auth` public container
- **AND** no prior authenticated session is required

### Requirement: Users authenticate with email or OAB number plus password
The system SHALL allow a user to sign in by submitting one identifier field containing either email or OAB number together with a password, using the documented OAB semantics and safe pt-BR error feedback. A successful login MUST refresh the shared frontend session query before the user enters protected product routes.

#### Scenario: User logs in with email
- **WHEN** a user submits a valid email and correct password
- **THEN** the system authenticates the user
- **AND** refreshes the shared frontend session query with the resolved logged-user actor
- **AND** redirects the user to `/`

#### Scenario: User logs in with OAB number
- **WHEN** a user submits a valid OAB identifier in the documented format and the correct password
- **THEN** the system authenticates the user
- **AND** refreshes the shared frontend session query with the resolved logged-user actor
- **AND** redirects the user to `/`

#### Scenario: Invalid credentials fail safely
- **WHEN** a user submits an unknown identifier or incorrect password
- **THEN** the system denies access and shows a safe pt-BR authentication error without exposing whether the identifier exists

### Requirement: Remembered sessions follow documented duration rules
The system SHALL create authenticated sessions with a default duration of 24 hours and SHALL extend the session duration to 7 days when the user explicitly selects the remember-me flow.

#### Scenario: Default session duration is used
- **WHEN** a user logs in successfully without selecting remember-me
- **THEN** the system issues an authenticated session with the default 24-hour duration

#### Scenario: Remember-me extends session duration
- **WHEN** a user logs in successfully with remember-me selected
- **THEN** the system issues an authenticated session with a 7-day duration

### Requirement: Protected routes require authenticated session
The system SHALL group authenticated product routes under a TanStack Router pathless layout route at `_app/route.tsx`, and that layout SHALL enforce the authenticated-session requirement before rendering child routes. Protected frontend routes SHALL derive browser-side authenticated state from one synchronized session source so child routes do not observe a divergent unauthenticated snapshot after login. The system SHALL continue to redirect authenticated users away from public login and password-reset screens to the dashboard.

#### Scenario: Unauthenticated user hits protected route
- **WHEN** an unauthenticated user navigates to `/clientes`
- **THEN** the `_app` authenticated layout blocks access before rendering the child route
- **AND** the system redirects the user to `/login`

#### Scenario: Authenticated user revisits login route
- **WHEN** an authenticated user navigates to `/login`
- **THEN** the system redirects the user to `/`

#### Scenario: Authenticated child route does not use stale unauthenticated browser session state
- **WHEN** a user has completed login successfully and enters a protected child route inside the authenticated shell
- **THEN** the child route reads the synchronized frontend authenticated-session source
- **AND** it does not fail because a separate optional browser session cache still holds an unauthenticated result

### Requirement: Password reset is supported
The system SHALL support password-reset request and reset-completion behavior for valid accounts using safe, non-enumerating user feedback.

#### Scenario: User requests password reset
- **WHEN** a user submits a valid account identifier on `/recuperar-senha`
- **THEN** the system starts a password-reset flow and shows a safe confirmation message without revealing account existence

#### Scenario: User completes password reset
- **WHEN** a user opens a valid password-reset verification link and submits a new password that satisfies policy
- **THEN** the system updates the password and allows the user to authenticate with the new credential

### Requirement: Failed-login protection enforces documented threshold
The system SHALL temporarily block additional authentication attempts after 5 failed attempts within 1 minute for the same normalized identifier.

#### Scenario: Threshold reached within one minute
- **WHEN** the same identifier accumulates 5 failed login attempts within 1 minute
- **THEN** the system blocks further login attempts for that identifier during the active protection window

#### Scenario: Successful login after protection window
- **WHEN** the protection window has expired and the user submits valid credentials
- **THEN** the system allows authentication normally

### Requirement: Logout ends authenticated access
The system SHALL provide a logout action that invalidates the current authenticated session and removes access to protected routes until the user signs in again. The logout flow MUST clear the shared frontend session query so no browser-side authenticated snapshot keeps protected access alive.

#### Scenario: User logs out
- **WHEN** an authenticated user triggers the logout action
- **THEN** the system invalidates the active session
- **AND** clears the shared frontend session query
- **AND** redirects the user to `/login`

#### Scenario: Logged-out user revisits protected page
- **WHEN** the user tries to open a protected route after logout
- **THEN** the system requires a new authenticated session

#### Scenario: Expired protected session clears browser-side authenticated state
- **WHEN** a protected session can no longer be resolved by the required authenticated-session path
- **THEN** the system clears the shared frontend session query
- **AND** redirects the user to `/login`

### Requirement: Public authentication screens use the shared product UI language
The system SHALL render the `/login` and `/recuperar-senha` screens with the repository's shared UI composition so the public authentication experience remains consistent with the rest of the product while preserving the existing authentication behavior.

#### Scenario: Login screen keeps the existing workflow with shared UI treatment
- **WHEN** an unauthenticated user opens `/login`
- **THEN** the system shows the same login fields, help text, remember-me control, password-reset link, and submit action
- **AND** the screen uses the shared product UI language instead of a one-off custom visual system

#### Scenario: Password-reset screen keeps the existing workflow with shared UI treatment
- **WHEN** an unauthenticated user opens `/recuperar-senha`
- **THEN** the system shows the same request and reset-completion flows, token-driven mode switching, and safe user feedback
- **AND** the screen uses the shared product UI language instead of a one-off custom visual system

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

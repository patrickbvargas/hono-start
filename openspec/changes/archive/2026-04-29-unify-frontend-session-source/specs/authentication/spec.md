## MODIFIED Requirements

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

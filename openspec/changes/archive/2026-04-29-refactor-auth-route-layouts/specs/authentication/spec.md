## MODIFIED Requirements

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

### Requirement: Protected routes require authenticated session
The system SHALL group authenticated product routes under a TanStack Router pathless layout route at `_app/route.tsx`, and that layout SHALL enforce the authenticated-session requirement before rendering child routes. The system SHALL continue to redirect authenticated users away from public login and password-reset screens to the dashboard.

#### Scenario: Unauthenticated user hits protected route
- **WHEN** an unauthenticated user navigates to `/clientes`
- **THEN** the `_app` authenticated layout blocks access before rendering the child route
- **AND** the system redirects the user to `/login`

#### Scenario: Authenticated user revisits login route
- **WHEN** an authenticated user navigates to `/login`
- **THEN** the system redirects the user to `/`

# authentication Specification

## Purpose
TBD - created by archiving change implement-authentication-feature. Update Purpose after archive.
## Requirements
### Requirement: Public authentication routes exist outside the authenticated shell
The system SHALL expose `/login` and `/recuperar-senha` as public routes that do not require an authenticated session and do not render the authenticated sidebar shell.

#### Scenario: Unauthenticated user opens login route
- **WHEN** an unauthenticated user navigates to `/login`
- **THEN** the system renders the login screen without the authenticated product sidebar

#### Scenario: Unauthenticated user opens password-reset route
- **WHEN** an unauthenticated user navigates to `/recuperar-senha`
- **THEN** the system renders the password-reset flow without requiring prior authentication

### Requirement: Users authenticate with email or OAB number plus password
The system SHALL allow a user to sign in by submitting one identifier field containing either email or OAB number together with a password, using the documented OAB semantics and safe pt-BR error feedback.

#### Scenario: User logs in with email
- **WHEN** a user submits a valid email and correct password
- **THEN** the system authenticates the user and redirects to `/`

#### Scenario: User logs in with OAB number
- **WHEN** a user submits a valid OAB identifier in the documented format and the correct password
- **THEN** the system authenticates the user and redirects to `/`

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
The system SHALL block unauthenticated access to authenticated product routes and SHALL redirect authenticated users away from public login and password-reset screens to the dashboard.

#### Scenario: Unauthenticated user hits protected route
- **WHEN** an unauthenticated user navigates to `/clientes`
- **THEN** the system redirects the user to `/login`

#### Scenario: Authenticated user revisits login route
- **WHEN** an authenticated user navigates to `/login`
- **THEN** the system redirects the user to `/`

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
The system SHALL provide a logout action that invalidates the current authenticated session and removes access to protected routes until the user signs in again.

#### Scenario: User logs out
- **WHEN** an authenticated user triggers the logout action
- **THEN** the system invalidates the active session and redirects the user to `/login`

#### Scenario: Logged-out user revisits protected page
- **WHEN** the user tries to open a protected route after logout
- **THEN** the system requires a new authenticated session

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


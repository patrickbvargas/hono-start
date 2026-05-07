## MODIFIED Requirements

### Requirement: Protected routes require authenticated session
The system SHALL group authenticated product routes under a TanStack Router pathless layout route at `_app/route.tsx`, and that layout SHALL enforce the authenticated-session requirement before rendering child routes. Protected frontend routes SHALL derive browser-side authenticated state from one synchronized session source so child routes do not observe a divergent unauthenticated snapshot after login. The system SHALL continue to redirect authenticated users away from public login and password-reset screens to the dashboard or to the forced-password-change screen when the authenticated account is flagged for mandatory password rotation.

#### Scenario: Authenticated user flagged for mandatory password rotation enters the protected shell
- **WHEN** a user authenticates successfully with a temporary administrator-issued password
- **THEN** the authenticated route guard redirects that user to the dedicated forced-password-change screen
- **AND** other protected child routes do not render until the password is changed

#### Scenario: Authenticated flagged user revisits public auth routes
- **WHEN** an authenticated user with `mustChangePassword = true` navigates to `/login` or `/recuperar-senha`
- **THEN** the system redirects the user to the forced-password-change screen instead of the dashboard

## ADDED Requirements

### Requirement: Administrator-issued temporary passwords force a password change on next login
The system SHALL support an authenticated forced password-change flow for users whose credential account was reset by an administrator. A flagged authenticated user MUST be required to choose a new password that satisfies policy before accessing the rest of the protected product.

#### Scenario: Flagged user reaches the forced-change screen after login
- **WHEN** a user signs in with a temporary password from an administrator reset
- **THEN** the system authenticates the session
- **AND** redirects the user to the dedicated forced-password-change screen
- **AND** prevents access to other protected routes until the password is changed

#### Scenario: Flagged user changes password successfully
- **WHEN** a flagged authenticated user submits a valid new password with matching confirmation on the forced-password-change screen
- **THEN** the system updates the credential password
- **AND** clears the `mustChangePassword` account flag
- **AND** keeps the current authenticated session usable
- **AND** redirects the user to the dashboard

#### Scenario: Forced-change validation still applies password policy
- **WHEN** a flagged authenticated user submits a new password that is too short or whose confirmation does not match
- **THEN** the system blocks submission with inline validation feedback
- **AND** does not clear the forced-change requirement

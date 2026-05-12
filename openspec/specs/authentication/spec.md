# authentication Specification

## Purpose
Define the authentication feature contract for public credential flows, protected session gating, password reset, remembered sessions, authenticated password change, forced password rotation, and logout behavior.
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
The system SHALL allow a user to sign in by submitting one identifier field containing either email or OAB number together with a password, using the documented OAB semantics and safe pt-BR error feedback. A successful login MUST keep the login submit action visibly busy until the client finishes clearing protected frontend query caches from any previous authenticated actor, refreshing the shared frontend session query with the resolved logged-user actor, and handing control to protected-route navigation.

#### Scenario: User logs in with email
- **WHEN** a user submits a valid email and correct password
- **THEN** the system authenticates the user
- **AND** keeps the login submit action visibly busy during the post-login client transition
- **AND** clears protected frontend query caches from any previous authenticated actor
- **AND** refreshes the shared frontend session query with the resolved logged-user actor
- **AND** redirects the user to `/`

#### Scenario: User logs in with OAB number
- **WHEN** a user submits a valid OAB identifier in the documented format and the correct password
- **THEN** the system authenticates the user
- **AND** keeps the login submit action visibly busy during the post-login client transition
- **AND** clears protected frontend query caches from any previous authenticated actor
- **AND** refreshes the shared frontend session query with the resolved logged-user actor
- **AND** redirects the user to `/`

#### Scenario: Invalid credentials fail safely
- **WHEN** a user submits an unknown identifier or incorrect password
- **THEN** the system denies access and shows a safe pt-BR authentication error without exposing whether the identifier exists

### Requirement: Credential login requires granted access and an active linked employee
The system SHALL allow credential login only when the submitted email or OAB resolves to an employee that is active, not soft-deleted, linked to a BetterAuth user, and currently marked with administrator-granted access. The system MUST continue to return the same safe pt-BR invalid-credentials response when any of those conditions fail.

#### Scenario: Employee with granted access logs in successfully
- **WHEN** a collaborator whose employee is active, not deleted, linked to a BetterAuth user, has `isAccessEnabled = true`, and has a credential account submits valid credentials
- **THEN** the system authenticates the collaborator normally

#### Scenario: Revoked collaborator access is denied safely
- **WHEN** a collaborator whose linked BetterAuth user has `isAccessEnabled = false` submits the correct password
- **THEN** the system denies login
- **AND** shows the same safe invalid-credentials feedback used for unknown identifiers or wrong passwords

#### Scenario: Inactive or deleted employee cannot authenticate
- **WHEN** a collaborator submits valid credentials for a linked employee that is inactive or soft-deleted
- **THEN** the system denies login
- **AND** shows the same safe invalid-credentials feedback

#### Scenario: Linked auth user without credential account cannot authenticate
- **WHEN** a collaborator has a linked BetterAuth user but no credential account
- **THEN** the system denies credential login
- **AND** shows the same safe invalid-credentials feedback

### Requirement: Remembered sessions follow documented duration rules
The system SHALL create authenticated sessions with a default duration of 24 hours and SHALL extend the session duration to 7 days when the user explicitly selects the remember-me flow.

#### Scenario: Default session duration is used
- **WHEN** a user logs in successfully without selecting remember-me
- **THEN** the system issues an authenticated session with the default 24-hour duration

#### Scenario: Remember-me extends session duration
- **WHEN** a user logs in successfully with remember-me selected
- **THEN** the system issues an authenticated session with a 7-day duration

### Requirement: Protected routes require authenticated session
The system SHALL group authenticated product routes under a TanStack Router pathless layout route at `_app/route.tsx`, and that layout SHALL enforce the authenticated-session requirement before rendering child routes. Protected frontend routes SHALL derive browser-side authenticated state from one synchronized session source so child routes do not observe a divergent unauthenticated snapshot after login. The system SHALL continue to redirect authenticated users away from public login and password-reset screens to the dashboard or to the forced-password-change screen when the authenticated account is flagged for mandatory password rotation.

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

#### Scenario: Authenticated user flagged for mandatory password rotation enters the protected shell
- **WHEN** a user authenticates successfully with a temporary administrator-issued password
- **THEN** the authenticated route guard redirects that user to the dedicated forced-password-change screen
- **AND** other protected child routes do not render until the password is changed

#### Scenario: Authenticated flagged user revisits public auth routes
- **WHEN** an authenticated user with `mustChangePassword = true` navigates to `/login` or `/recuperar-senha`
- **THEN** the system redirects the user to the forced-password-change screen instead of the dashboard

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

### Requirement: Password reset is supported
The system SHALL support password-reset request and reset-completion behavior for valid accounts using safe, non-enumerating user feedback.

#### Scenario: User requests password reset
- **WHEN** a user submits a valid account identifier on `/recuperar-senha`
- **THEN** the system starts a password-reset flow and shows a safe confirmation message without revealing account existence

#### Scenario: User completes password reset
- **WHEN** a user opens a valid password-reset verification link and submits a new password that satisfies policy
- **THEN** the system updates the password and allows the user to authenticate with the new credential

### Requirement: Authenticated users can change their password from the product shell
The system SHALL allow any authenticated user with a credential-based account to change their password from the authenticated product shell by submitting the current password, a new password that satisfies policy, and a matching confirmation value. The flow MUST keep user-facing feedback in safe pt-BR copy and MUST rely on the authenticated session context rather than any client-submitted user identity.

#### Scenario: Authenticated user changes password successfully
- **WHEN** an authenticated user opens the account password-change flow, submits the correct current password, and provides a valid new password with matching confirmation
- **THEN** the system updates the credential password
- **AND** shows a success confirmation in pt-BR
- **AND** keeps the current authenticated session usable

#### Scenario: Current password is invalid
- **WHEN** an authenticated user submits the password-change form with an incorrect current password
- **THEN** the system denies the password change
- **AND** shows a safe pt-BR error for invalid current password
- **AND** does not reveal internal auth-provider details

#### Scenario: New password confirmation does not match
- **WHEN** an authenticated user submits a new password and confirmation with different values
- **THEN** the system blocks submission with inline validation feedback
- **AND** does not call the authenticated password-change operation

#### Scenario: User revokes other sessions during password change
- **WHEN** an authenticated user opts to revoke other sessions while changing the password successfully
- **THEN** the system invalidates the user's other active sessions
- **AND** preserves the current session so the user remains in the authenticated shell

### Requirement: Public credential forms keep secrets out of the browser URL
The system SHALL ensure that public authentication forms containing password-bearing fields submit through a transport that does not serialize those credential values into the browser URL, including when native browser submission occurs before client hydration or when JavaScript is unavailable.

#### Scenario: Login submission does not place password in URL
- **WHEN** a user submits the `/login` form with an identifier and password
- **THEN** the browser URL does not gain the submitted password value
- **AND** the form fallback behavior remains compatible with the existing login mutation flow

#### Scenario: Password reset completion does not place new password in URL
- **WHEN** a user submits the password reset completion form on `/recuperar-senha` with a reset token and new password values
- **THEN** the browser URL does not gain the submitted password values
- **AND** the reset-completion flow remains compatible with the existing reset mutation flow

### Requirement: Failed-login protection enforces documented threshold
The system SHALL temporarily block additional authentication attempts after 5 failed attempts within 1 minute for the same normalized identifier.

#### Scenario: Threshold reached within one minute
- **WHEN** the same identifier accumulates 5 failed login attempts within 1 minute
- **THEN** the system blocks further login attempts for that identifier during the active protection window

#### Scenario: Successful login after protection window
- **WHEN** the protection window has expired and the user submits valid credentials
- **THEN** the system allows authentication normally

### Requirement: Logout ends authenticated access
The system SHALL provide a logout action that invalidates the current authenticated session and removes access to protected routes until the user signs in again. The logout flow MUST clear the shared frontend session query and all protected frontend query caches so no browser-side snapshot from the previous actor keeps protected access or protected data alive.

#### Scenario: User logs out
- **WHEN** an authenticated user triggers the logout action
- **THEN** the system invalidates the active session
- **AND** clears the shared frontend session query
- **AND** clears protected frontend query caches
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

## MODIFIED Requirements

### Requirement: Credential login requires granted access and an active linked employee
The system SHALL allow credential login only when the submitted email or OAB resolves to an employee that is active, not soft-deleted, linked to a Supabase Auth user, and currently marked with administrator-granted access in domain-owned employee access state. The system MUST continue to return the same safe pt-BR invalid-credentials response when any of those conditions fail.

#### Scenario: Employee with granted access logs in successfully
- **WHEN** a collaborator whose employee is active, not deleted, linked to a Supabase Auth user, has `isAccessEnabled = true`, and has a valid credential submits valid credentials
- **THEN** the system authenticates the collaborator normally

#### Scenario: Revoked collaborator access is denied safely
- **WHEN** a collaborator whose linked employee access state has `isAccessEnabled = false` submits the correct password
- **THEN** the system denies login
- **AND** shows the same safe invalid-credentials feedback used for unknown identifiers or wrong passwords

#### Scenario: Inactive or deleted employee cannot authenticate
- **WHEN** a collaborator submits valid credentials for a linked employee that is inactive or soft-deleted
- **THEN** the system denies login
- **AND** shows the same safe invalid-credentials feedback

#### Scenario: Linked auth user without current employee access cannot authenticate
- **WHEN** a collaborator has a linked Supabase Auth user but no valid employee access linkage or granted-access state
- **THEN** the system denies credential login
- **AND** shows the same safe invalid-credentials feedback

### Requirement: Remembered sessions follow the configured Supabase Auth session policy
The system SHALL issue authenticated sessions through Supabase Auth and SHALL apply the repository's configured standard or remembered-session policy based on whether the user explicitly selects the remember-me flow.

#### Scenario: Standard session policy is used
- **WHEN** a user logs in successfully without selecting remember-me
- **THEN** the system issues an authenticated session using the configured standard session policy

#### Scenario: Remember-me uses the extended session policy
- **WHEN** a user logs in successfully with remember-me selected
- **THEN** the system issues an authenticated session using the configured remembered-session policy

### Requirement: Protected routes require authenticated session
The system SHALL group authenticated product routes under a TanStack Router pathless layout route at `_app/route.tsx`, and that layout SHALL enforce the authenticated-session requirement before rendering child routes. Protected frontend routes SHALL derive browser-side authenticated state from one synchronized Supabase-backed session source so child routes do not observe a divergent unauthenticated snapshot after login. The system SHALL continue to redirect authenticated users away from public login and password-reset screens to the dashboard or to the forced-password-change screen when the linked employee access state is flagged for mandatory password rotation.

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
The system SHALL support an authenticated forced password-change flow for users whose Supabase Auth credential was reset by an administrator. A flagged authenticated user MUST be required to choose a new password that satisfies policy before accessing the rest of the protected product.

#### Scenario: Flagged user reaches the forced-change screen after login
- **WHEN** a user signs in with a temporary password from an administrator reset
- **THEN** the system authenticates the session
- **AND** redirects the user to the dedicated forced-password-change screen
- **AND** prevents access to other protected routes until the password is changed

#### Scenario: Flagged user changes password successfully
- **WHEN** a flagged authenticated user submits a valid new password with matching confirmation on the forced-password-change screen
- **THEN** the system updates the credential password
- **AND** clears the `mustChangePassword` access flag
- **AND** keeps the current authenticated session usable
- **AND** redirects the user to the dashboard

#### Scenario: Forced-change validation still applies password policy
- **WHEN** a flagged authenticated user submits a new password that is too short or whose confirmation does not match
- **THEN** the system blocks submission with inline validation feedback
- **AND** does not clear the forced-change requirement

### Requirement: Authenticated users can change their password from the product shell
The system SHALL allow any authenticated user with a credential-based Supabase Auth account to change their password from the authenticated product shell by submitting the current password, a new password that satisfies policy, and a matching confirmation value. The flow MUST keep user-facing feedback in safe pt-BR copy and MUST rely on the authenticated session context rather than any client-submitted user identity.

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

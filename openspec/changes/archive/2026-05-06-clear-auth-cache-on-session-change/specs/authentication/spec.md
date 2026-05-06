## MODIFIED Requirements

### Requirement: Users authenticate with email or OAB number plus password
The system SHALL allow a user to sign in by submitting one identifier field containing either email or OAB number together with a password, using the documented OAB semantics and safe pt-BR error feedback. A successful login MUST clear protected frontend query caches from any previous authenticated actor, refresh the shared frontend session query with the resolved logged-user actor, and only then allow the user to enter protected product routes.

#### Scenario: User logs in with email
- **WHEN** a user submits a valid email and correct password
- **THEN** the system authenticates the user
- **AND** clears protected frontend query caches from any previous authenticated actor
- **AND** refreshes the shared frontend session query with the resolved logged-user actor
- **AND** redirects the user to `/`

#### Scenario: User logs in with OAB number
- **WHEN** a user submits a valid OAB identifier in the documented format and the correct password
- **THEN** the system authenticates the user
- **AND** clears protected frontend query caches from any previous authenticated actor
- **AND** refreshes the shared frontend session query with the resolved logged-user actor
- **AND** redirects the user to `/`

#### Scenario: Invalid credentials fail safely
- **WHEN** a user submits an unknown identifier or incorrect password
- **THEN** the system denies access and shows a safe pt-BR authentication error without exposing whether the identifier exists

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

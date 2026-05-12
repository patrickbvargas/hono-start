## MODIFIED Requirements

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

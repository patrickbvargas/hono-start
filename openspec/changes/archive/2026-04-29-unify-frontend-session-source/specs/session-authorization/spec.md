## MODIFIED Requirements

### Requirement: Shared logged-user session contract
The system SHALL expose a shared session contract that represents the authenticated actor consistently across client and server session consumers, while allowing unauthenticated session reads to return no actor before route or server guards assert access. On the frontend, the authenticated actor MUST have exactly one browser-side source of truth so protected consumers do not depend on divergent client session caches.

#### Scenario: Session actor shape is consistent
- **WHEN** the current authenticated session is read in a client consumer or in a server-side session helper
- **THEN** both consumers receive the same actor fields for user identity, employee identity, firm context, employee type, and role

#### Scenario: Session actor is safe to reuse across features
- **WHEN** a feature imports the shared session contract from `src/shared/session`
- **THEN** it can evaluate actor identity, role, and firm context without depending on feature-local session types

#### Scenario: Unauthenticated read returns no actor
- **WHEN** a public route or public server flow reads session state before authentication
- **THEN** the shared session reader returns an unauthenticated result instead of a fabricated logged-user actor

#### Scenario: Frontend protected consumers share one actor source
- **WHEN** multiple protected frontend consumers read the authenticated actor during the same browser session
- **THEN** they resolve from one shared frontend session query
- **AND** they do not diverge because different client caches hold conflicting session results

### Requirement: Management routes use shared authorization gating before rendering protected UI
The system SHALL evaluate administrator-only management route access through shared authorization helpers before rendering protected management screens. Protected management routes MUST resolve the authenticated actor from the required authenticated-session path rather than from an optional unauthenticated browser-session snapshot.

#### Scenario: Route blocks regular user before rendering employee management UI
- **WHEN** a regular user navigates directly to the employee-management route
- **THEN** the route evaluates the shared authorization helper before rendering the management screen
- **AND** the regular user does not receive the employee-management UI

#### Scenario: Route allows administrator to render employee management UI
- **WHEN** an administrator navigates to the employee-management route
- **THEN** the route evaluates the shared authorization helper
- **AND** the employee-management screen is rendered when access is allowed

#### Scenario: Admin route ignores stale optional unauthenticated browser session data
- **WHEN** an authenticated administrator opens an administrator-only management route after login
- **THEN** the route reads the authenticated actor from the required protected-session path
- **AND** it does not deny access because a separate optional browser-session cache still holds `null`

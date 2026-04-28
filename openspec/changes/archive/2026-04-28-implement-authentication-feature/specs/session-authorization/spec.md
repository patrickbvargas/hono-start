## MODIFIED Requirements

### Requirement: Shared logged-user session contract
The system SHALL expose a shared session contract that represents the authenticated actor consistently across client and server session consumers, while allowing unauthenticated session reads to return no actor before route or server guards assert access.

#### Scenario: Session actor shape is consistent
- **WHEN** the current authenticated session is read in a client consumer or in a server-side session helper
- **THEN** both consumers receive the same actor fields for user identity, employee identity, firm context, employee type, and role

#### Scenario: Session actor is safe to reuse across features
- **WHEN** a feature imports the shared session contract from `src/shared/session`
- **THEN** it can evaluate actor identity, role, and firm context without depending on feature-local session types

#### Scenario: Unauthenticated read returns no actor
- **WHEN** a public route or public server flow reads session state before authentication
- **THEN** the shared session reader returns an unauthenticated result instead of a fabricated logged-user actor

### Requirement: Server-side tenant and permission enforcement
The system SHALL evaluate tenant scope and protected-action permissions in server-side code using server-safe authenticated session helpers rather than browser state or mock session storage.

#### Scenario: Server function derives tenant scope from authenticated session
- **WHEN** a protected server function needs the current firm scope
- **THEN** it reads that scope from the authenticated server session helper
- **AND** it does not depend on client state or a fabricated in-memory actor

#### Scenario: Client-provided tenant scope is ignored
- **WHEN** a protected server function receives client input that could imply a tenant scope
- **THEN** the function derives the authoritative firm scope from the authenticated session actor instead
- **AND** any client-supplied tenant value is ignored

#### Scenario: Unauthenticated protected server access fails early
- **WHEN** an unauthenticated actor triggers a protected server function
- **THEN** the server-safe session helper fails before feature logic executes
- **AND** the function does not continue with a placeholder tenant or actor

## ADDED Requirements

### Requirement: Shared session helpers map authenticated identity to domain actor
The system SHALL map the authenticated identity to the existing domain session actor shape using the linked employee, firm, role, and employee-type records so downstream authorization and scope decisions remain consistent.

#### Scenario: Authenticated identity resolves to domain actor
- **WHEN** a protected route or server function resolves the current authenticated session
- **THEN** the shared session helper returns the linked employee id, firm id, role, and employee type needed by current feature authorization rules

#### Scenario: Missing employee link denies protected access
- **WHEN** an authenticated identity does not resolve to a valid employee record in the same tenant context
- **THEN** protected access is denied safely
- **AND** downstream feature logic does not receive a partial actor

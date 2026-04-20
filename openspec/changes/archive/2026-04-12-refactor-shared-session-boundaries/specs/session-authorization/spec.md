## ADDED Requirements

### Requirement: Shared logged-user session contract
The system SHALL expose a shared logged-user session contract that represents the authenticated actor consistently across client and server session consumers.

#### Scenario: Session actor shape is consistent
- **WHEN** the current logged user session is read in the client store or in a server-side session helper
- **THEN** both consumers receive the same actor fields for user identity, employee identity, firm context, employee type, and role

#### Scenario: Session actor is safe to reuse across features
- **WHEN** a feature imports the shared session contract from `src/shared/session`
- **THEN** it can evaluate actor identity, role, and firm context without depending on feature-local session types

### Requirement: Shared authorization helpers
The system SHALL evaluate permission decisions through shared authorization helpers that accept the logged-user actor and optional resource context as explicit inputs.

#### Scenario: Admin access is decided centrally
- **WHEN** an authorization check is performed for an administrator-only action such as employee management
- **THEN** the decision is derived from the shared authorization helper
- **AND** consumers do not need to duplicate inline role comparisons

#### Scenario: Resource-scoped access is decided centrally
- **WHEN** an authorization check is performed for a resource-scoped action such as contract or fee visibility
- **THEN** the decision considers both the logged-user actor and the provided resource context
- **AND** the helper returns a consistent allow or deny result for the same inputs

### Requirement: Server-side tenant and permission enforcement
The system SHALL evaluate tenant scope and protected-action permissions in server-side code using server-safe session helpers rather than browser state.

#### Scenario: Server function derives tenant scope from session
- **WHEN** a server function needs the current firm scope
- **THEN** it reads that scope from the server session helper
- **AND** it does not depend on the client Zustand store

#### Scenario: Client-provided tenant scope is ignored
- **WHEN** a protected server function receives client input that could imply a tenant scope
- **THEN** the function derives the authoritative firm scope from the authenticated session actor instead
- **AND** any client-supplied tenant value is ignored

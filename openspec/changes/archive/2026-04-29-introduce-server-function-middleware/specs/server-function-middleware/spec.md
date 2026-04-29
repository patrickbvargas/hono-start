## ADDED Requirements

### Requirement: Protected server functions use shared middleware for authenticated context
The system SHALL provide a shared TanStack Start middleware path for protected server functions so authenticated context is resolved before feature-specific handler logic executes. The middleware MUST derive authenticated actor and tenant context from the canonical shared session helpers rather than from feature-local session wiring.

#### Scenario: Protected server function receives authenticated context from middleware
- **WHEN** a protected server function is invoked by an authenticated actor
- **THEN** the shared middleware resolves the authenticated context before the feature handler runs
- **AND** the feature handler can consume that shared context without duplicating session-plumbing code

#### Scenario: Unauthenticated protected call fails before feature logic
- **WHEN** an unauthenticated actor invokes a protected server function that uses the shared middleware path
- **THEN** the middleware fails the request before feature-specific business logic executes

#### Scenario: Middleware does not replace feature-local business errors
- **WHEN** a protected server function reaches feature-specific validation or business-rule failures after middleware succeeds
- **THEN** the feature still returns its documented safe pt-BR error behavior
- **AND** the middleware does not replace feature-local domain rules with generic shared failures

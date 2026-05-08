# server-function-middleware

## Purpose

Define the shared middleware contract for protected TanStack Start server
functions.

## Requirements

### Requirement: Protected server functions use shared middleware for authenticated context
The system SHALL provide a shared TanStack Start middleware path for protected
server functions so authenticated context is resolved before feature-specific
handler logic executes. The middleware MUST derive authenticated actor and
tenant context from the canonical shared session helpers rather than from
feature-local session wiring.

#### Scenario: Protected server function receives authenticated context from middleware
- **WHEN** a protected server function is invoked by an authenticated actor
- **THEN** the shared middleware resolves the authenticated context before the
  feature handler runs
- **AND** the feature handler can consume that shared context without
  duplicating session-plumbing code

#### Scenario: Unauthenticated protected call fails before feature logic
- **WHEN** an unauthenticated actor invokes a protected server function that
  uses the shared middleware path
- **THEN** the middleware fails the request before feature-specific business
  logic executes

#### Scenario: Middleware does not replace feature-local business errors
- **WHEN** a protected server function reaches feature-specific validation or
  business-rule failures after middleware succeeds
- **THEN** the feature still returns its documented safe pt-BR error behavior
- **AND** the middleware does not replace feature-local domain rules with
  generic shared failures

### Requirement: Shared middleware entrypoint remains explicit inside the shared session surface
The system SHALL expose the protected server-function middleware through a dedicated shared session module entrypoint whose responsibility is authenticated-context injection only. The middleware module MUST remain separate from authorization policy rules and React provider concerns so the server trust boundary is easy to audit.

#### Scenario: Protected middleware is discoverable without unrelated exports
- **WHEN** a contributor needs the authenticated TanStack Start middleware for a protected server function
- **THEN** the middleware is available from a dedicated shared session module boundary
- **AND** the contributor does not need to traverse a mixed session-policy barrel to find it

#### Scenario: Middleware refactor preserves authenticated context behavior
- **WHEN** the middleware entrypoint is reorganized inside `src/shared/session`
- **THEN** protected server functions still receive the authenticated session context before feature-specific logic runs
- **AND** unauthenticated calls still fail before feature logic executes

## ADDED Requirements

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

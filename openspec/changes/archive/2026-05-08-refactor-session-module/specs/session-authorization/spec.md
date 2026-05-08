## MODIFIED Requirements

### Requirement: Shared authorization helpers
The system SHALL evaluate permission decisions through shared authorization helpers that accept the logged-user actor and optional resource context as explicit inputs. The shared authorization surface MUST keep `can(session, action, resource)` and `assertCan(session, action, resource)` as the canonical action API, MUST derive the exported permission type from canonical action and entity catalogs rather than a manually maintained string union, and MUST avoid duplicative feature-specific permission wrappers unless a wrapper has a clear route-facing purpose.

#### Scenario: Admin access is decided centrally
- **WHEN** an authorization check is performed for an administrator-only action such as employee management
- **THEN** the decision is derived from the shared authorization helper
- **AND** consumers do not need to duplicate inline role comparisons

#### Scenario: Resource-scoped access is decided centrally
- **WHEN** an authorization check is performed for a resource-scoped action such as contract or fee visibility
- **THEN** the decision considers both the logged-user actor and the provided resource context
- **AND** the helper returns a consistent allow or deny result for the same inputs

#### Scenario: Canonical action API is used directly
- **WHEN** a consumer needs to evaluate a protected action that is already represented by a shared permission type
- **THEN** the consumer can call the canonical shared authorization helper directly with the action and resource context
- **AND** the consumer does not require a feature-specific wrapper with duplicate permission semantics

#### Scenario: Authorization refactor preserves existing decisions
- **WHEN** the shared authorization implementation is simplified
- **THEN** existing role, tenant, assignment, own-resource, remuneration, attachment, audit-log, and contract-writability decisions remain unchanged
- **AND** denied actions still produce safe pt-BR errors through the assertion helper

#### Scenario: Permission coverage is derived from canonical catalogs
- **WHEN** a contributor adds or removes a shared permission entity or action
- **THEN** the exported permission type updates from the canonical catalogs rather than from a manually rewritten string union
- **AND** the authorization policy map remains the single source of truth for non-admin permission coverage

## ADDED Requirements

### Requirement: Shared session module exposes one explicit public surface
The system SHALL expose the shared session contract through one explicit public barrel in `src/shared/session` and SHALL organize its internal modules by responsibility so consumers can find authorization, scope, middleware, query, and provider concerns without traversing redundant re-export layers.

#### Scenario: Feature consumer imports shared session API from one barrel
- **WHEN** a feature or route imports shared session helpers, selectors, types, or provider hooks
- **THEN** it can do so from the canonical `src/shared/session` public surface when using the shared route-facing contract
- **AND** it does not depend on a second overlapping barrel that re-exports the same concerns

#### Scenario: Internal module ownership is explicit
- **WHEN** a contributor navigates the shared session implementation
- **THEN** permission catalogs, access rules, selectors, scope helpers, middleware, query helpers, and React provider helpers live in modules with distinct responsibility
- **AND** actor types are not mixed into the same file as policy-rule grouping unless that grouping is itself part of the type contract

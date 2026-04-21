## MODIFIED Requirements

### Requirement: Shared authorization helpers
The system SHALL evaluate permission decisions through shared authorization helpers that accept the logged-user actor and optional resource context as explicit inputs. The shared authorization surface MUST keep `can(session, action, resource)` and `assertCan(session, action, resource)` as the canonical action API, and MUST avoid duplicative feature-specific permission wrappers unless a wrapper has a clear route-facing purpose.

#### Scenario: Admin access is decided centrally
- **WHEN** an authorization check is performed for an administrator-only action such as employee management
- **THEN** the decision is derived from the shared authorization helper
- **AND** consumers do not need to duplicate inline role comparisons

#### Scenario: Resource-scoped access is decided centrally
- **WHEN** an authorization check is performed for a resource-scoped action such as contract or fee visibility
- **THEN** the decision considers both the logged-user actor and the provided resource context
- **AND** the helper returns a consistent allow or deny result for the same inputs

#### Scenario: Canonical action API is used directly
- **WHEN** a consumer needs to evaluate a protected action that is already represented by a `SessionAction`
- **THEN** the consumer can call the canonical shared authorization helper directly with the action and resource context
- **AND** the consumer does not require a feature-specific wrapper with duplicate permission semantics

#### Scenario: Authorization refactor preserves existing decisions
- **WHEN** the shared authorization implementation is simplified
- **THEN** existing role, tenant, assignment, own-resource, remuneration, attachment, audit-log, and contract-writability decisions remain unchanged
- **AND** denied actions still produce safe pt-BR errors through the assertion helper

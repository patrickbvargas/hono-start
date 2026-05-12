# session-authorization Specification

## Purpose
Define the shared session and authorization contract so authenticated actor shape, permission evaluation, tenant scope enforcement, and protected route gating remain consistent across client and server boundaries.
## Requirements
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

#### Scenario: Contract visibility uses assignment-role-aware resource context
- **WHEN** a resource-scoped authorization check is performed for contract visibility or contract-derived visibility
- **THEN** the decision considers active assignment summaries for the logged-in user, including assignment role and employee type
- **AND** assignment presence alone is not sufficient

#### Scenario: Recommending assignment does not grant regular-user contract access
- **WHEN** a regular authenticated lawyer is present on a contract only through an active `RECOMMENDING` assignment
- **THEN** the shared authorization helper denies contract visibility for that user

#### Scenario: Responsible or recommended lawyer grants regular-user contract access
- **WHEN** a regular authenticated lawyer is present on a contract through an active `RESPONSIBLE` or `RECOMMENDED` assignment
- **THEN** the shared authorization helper allows contract visibility for that user

#### Scenario: Admin assistant assignment grants regular-user contract access
- **WHEN** a regular authenticated administrative assistant is present on a contract through an active `ADMIN_ASSISTANT` assignment
- **THEN** the shared authorization helper allows contract visibility for that user

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

### Requirement: Shared session helpers map authenticated identity to domain actor
The system SHALL map the authenticated identity to the existing domain session actor shape using the linked employee, firm, role, and employee-type records so downstream authorization and scope decisions remain consistent.

#### Scenario: Authenticated identity resolves to domain actor
- **WHEN** a protected route or server function resolves the current authenticated session
- **THEN** the shared session helper returns the linked employee id, firm id, role, and employee type needed by current feature authorization rules

#### Scenario: Missing employee link denies protected access
- **WHEN** an authenticated identity does not resolve to a valid employee record in the same tenant context
- **THEN** protected access is denied safely
- **AND** downstream feature logic does not receive a partial actor

### Requirement: Protected route session enforcement happens before child route loading
The system SHALL require authenticated session access for protected TanStack Router layout routes in `beforeLoad` so protected child routes are blocked before their loaders and render paths continue. Shared session helpers used by route gating MUST remain the canonical source for route-level session decisions.

#### Scenario: Protected child route loader does not become the first auth gate
- **WHEN** a protected child route is entered through the authenticated layout
- **THEN** the layout-level `beforeLoad` check runs before child route data loading continues
- **AND** protected access does not depend on each child route repeating the same session redirect logic

#### Scenario: Shared session helper remains authoritative for route gating
- **WHEN** the router evaluates whether a protected layout route may continue
- **THEN** it uses the shared session helper contract from `src/shared/session`
- **AND** it does not introduce a separate route-local authentication source

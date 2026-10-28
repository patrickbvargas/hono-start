# session-authorization Specification

## Purpose
Define the shared session and authorization contract so authenticated actor shape, permission evaluation, tenant scope enforcement, and protected route gating remain consistent across client and server boundaries.
## Requirements

### Requirement: Shared logged-user session contract
The system SHALL expose one Zod-validated domain projection of verified Clerk identity, active organization, Employee, Firm, employee type and safe capability results. Clerk SHALL remain the provider-session authority, and browser capability data SHALL be advisory rather than trusted server authority.

#### Scenario: Consistent actor
- **WHEN** client and server consumers resolve the same active context
- **THEN** they receive consistent employee and firm identities without maintaining another authentication store

#### Scenario: Signed-out reader
- **WHEN** a public consumer reads the session without an active Clerk identity
- **THEN** the optional session projection returns no actor

#### Scenario: Session actor shape is consistent
- **WHEN** the current authenticated session is read in a client consumer or in a server-side session helper
- **THEN** both consumers receive the same actor fields for Clerk user identity, employee identity, active organization, firm context, employee type, and permissions

#### Scenario: Session actor is safe to reuse across features
- **WHEN** a feature imports the shared session contract from `src/shared/session`
- **THEN** it can evaluate actor identity, Clerk permissions, and firm context without depending on feature-local session types

#### Scenario: Unauthenticated read returns no actor
- **WHEN** a public route or public server flow reads session state before authentication
- **THEN** the shared session reader returns an unauthenticated result instead of a fabricated logged-user actor

#### Scenario: Frontend protected consumers share one actor source
- **WHEN** multiple protected frontend consumers read the authenticated actor during the same browser session
- **THEN** they resolve from one shared frontend session query
- **AND** they do not diverge because different client caches hold conflicting session results

### Requirement: Shared authorization helpers
The system SHALL check an exact native Clerk permission key with `hasPermission(session, key)`, returning `session?.permissions.includes(key) ?? false`. Call sites SHALL use typed `org:<feature>:<permission>` keys directly without local action aliases or an operation-to-permission mapping table. `can(session, permission, resource)` and `assertCan(session, permission, resource)` SHALL combine explicit Clerk grants with resource scope and business assertions only. Local UserRole records, employee type and hard-coded Administrator bypasses MUST NOT grant capabilities. Scope and resource checks SHALL enforce provider-granted all/assigned/own access against persisted business facts.

#### Scenario: Exact permission check is easy to inspect
- **WHEN** a consumer checks `org:clients:read`
- **THEN** `hasPermission` returns true only when that exact key is present in the Clerk-backed permissions array
- **AND** a missing session or missing key returns false without deriving grants from another action

#### Scenario: Custom role receives a permission
- **WHEN** an operator grants an existing application permission to a new role in Clerk
- **THEN** a refreshed/current server check allows the corresponding operation without deploying a role-matrix change

#### Scenario: Admin label without permission
- **WHEN** a membership role has an administrative label but lacks the required Custom Permission
- **THEN** the operation is denied without a local role-name bypass

#### Scenario: Assigned scope respects assignment semantics
- **WHEN** a lawyer has assigned-contract read permission and only a RECOMMENDING assignment
- **THEN** the contract is excluded
- **AND** active RESPONSIBLE/RECOMMENDED lawyer assignments or qualifying ADMIN_ASSISTANT assignments are admitted only with the matching provider-granted scope

#### Scenario: Ownership does not grant permission
- **WHEN** a user owns a remuneration but lacks both own-read and all-read permissions
- **THEN** ownership alone does not grant visibility

#### Scenario: Resource-scoped access is decided centrally
- **WHEN** an authorization check is performed for a resource-scoped action such as contract or fee visibility
- **THEN** the decision considers both the logged-user actor and the provided resource context
- **AND** the helper returns a consistent allow or deny result for the same inputs

#### Scenario: Contract visibility uses assignment-role-aware resource context
- **WHEN** a resource-scoped authorization check is performed for contract visibility or contract-derived visibility
- **THEN** the decision considers active assignment summaries for the logged-in user, including assignment role and employee type
- **AND** assignment presence alone is not sufficient

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
The system SHALL enforce verified Clerk authentication, current organization membership, required Custom Permissions and domain scope before protected operations execute. Tenant IDs, role claims and capability projections submitted by clients SHALL NOT grant authority. Queries, counts, options, details, exports, dashboard totals and attachment owner access SHALL apply consistent scopes; absence of a valid scope SHALL deny access.

#### Scenario: Cross-firm resource
- **WHEN** a permitted actor targets an operational record belonging to another firm
- **THEN** access is denied even if the actor has an all-records permission in the active firm

#### Scenario: Read permission does not imply other actions
- **WHEN** a user has all-records read permission without update, export or delete grants
- **THEN** those operations remain denied

#### Scenario: Sensitive data aggregation
- **WHEN** a dashboard or export is requested with only own/assigned scope
- **THEN** its returned records, counts and derived totals exclude unpermitted firm-wide financial data

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
The system SHALL gate restricted routes and actions using the required Clerk Custom Permissions through shared session helpers before loading/rendering protected content. Server operations SHALL repeat authoritative enforcement regardless of UI gating.

#### Scenario: Direct management request without grant
- **WHEN** a user without the employee-management permission navigates directly to its route or invokes its server operation
- **THEN** protected employee content is not returned

#### Scenario: Admin route ignores stale optional unauthenticated browser session data
- **WHEN** an authenticated actor with the required Clerk permission opens a restricted management route after login
- **THEN** the route reads the authenticated actor from the required protected-session path
- **AND** it does not deny access because a separate optional browser-session cache still holds `null`

### Requirement: Shared session helpers map authenticated identity to domain actor
The system SHALL map verified Clerk user and active organization IDs to an existing Firm through Organization privateMetadata.firmId and an optional global Employee through User privateMetadata.employeeId. Employee SHALL NOT carry firmId. Current Organization membership supplies grants; the active global Employee supplies business actor ID and type. Missing Employee binding SHALL omit own/assigned grants; an invalid, inactive or deleted explicit binding SHALL deny session resolution.

#### Scenario: Identity mapping fails
- **WHEN** the active Organization lacks a valid existing Firm mapping, or an explicit Employee identity anchor does not exist
- **THEN** required session resolution denies access and returns no domain actor

#### Scenario: Authenticated identity resolves to domain actor
- **WHEN** a protected route or server function resolves a verified session with valid Firm metadata and a matching Employee
- **THEN** the shared session helper returns the linked employee id, firm id, Clerk permissions, and employee type needed by current feature authorization rules

#### Scenario: Missing employee link limits actor-scoped access
- **WHEN** a member has a valid Firm mapping but no Employee binding
- **THEN** general capabilities remain available according to current Clerk grants
- **AND** employee and employeeType are null and own/assigned capabilities are excluded

#### Scenario: Global employee acts in another branch
- **WHEN** a member switches to another authorized Organization with a valid Firm mapping
- **THEN** the same active Employee ID and type remain bound
- **AND** operational reads and writes still enforce the selected Firm and current Organization grants

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

### Requirement: Permission keys follow Clerk feature and action namespaces
The system SHALL name application Custom Permissions using Clerk's `org:<feature>:<permission>` format, with stable English lowercase feature/action identifiers and underscores for compound identifiers. Native `org:sys_domains:read`, `org:sys_domains:manage`, `org:sys_billing:read`, and `org:sys_billing:manage` SHALL retain their Clerk System Permission semantics. Business capabilities SHALL use custom feature names without pretending to be Clerk System Permissions. A custom `manage` permission SHALL grant only operations explicitly mapped to it, not an automatic wildcard.

The feature SHALL identify the resource (`clients`, `contracts`, `fees`, `expenses`, `remunerations`, `attachments`, `employees`, `accounts`, `audit_logs`, `dashboard`), and the permission SHALL identify its action. The approved native-key catalog in `src/shared/session/catalog.ts` SHALL govern provisioning and checks. Employee CRUD SHALL use independent `read`, `create`, `update`, `delete`, `restore` permissions; account administration SHALL use `org:accounts:manage`. No permission SHALL repeat the resource name, such as `org:client_read:clients_read`.

#### Scenario: Resource groups multiple actions
- **WHEN** operators configure client read and update grants
- **THEN** both permissions belong to feature `clients`, producing `org:clients:read` and `org:clients:update`
- **AND** granting read does not grant update

#### Scenario: Employee read does not grant account administration
- **WHEN** a user has `org:employees:read` without `org:accounts:manage`
- **THEN** permitted employee data may be read but access provisioning and role changes remain denied

#### Scenario: Business permission is configured
- **WHEN** the application configures employee management or scoped contract reading
- **THEN** it uses keys such as `org:employees:update` or `org:contracts:read_assigned`
- **AND** the same exact keys are used in Clerk configuration and application checks

#### Scenario: System permission is encountered
- **WHEN** an integration uses Clerk domain or billing System Permissions
- **THEN** those permissions keep their native provider purpose
- **AND** server-side Custom Permission checks do not assume those System Permissions exist in session claims

### Requirement: Revocation does not depend on webhook delivery
The system SHALL validate current membership for protected requests and current Clerk grants for mutations and sensitive reads/exports. Removed membership or missing permission SHALL deny the relevant operation without waiting for webhook synchronization. Provider verification failures SHALL deny protected execution instead of falling back to local roles or indefinitely cached grants.

#### Scenario: Old session remains after membership removal
- **WHEN** a previously signed-in user calls a protected operation after current provider membership is removed
- **THEN** the server rejects the operation despite the old browser capability snapshot

#### Scenario: Permission removed before a mutation
- **WHEN** the provider's current permission configuration no longer grants the requested mutation
- **THEN** the mutation is denied even if an earlier session token carried the grant

#### Scenario: Provider unavailable during current-state verification
- **WHEN** current membership or required sensitive-operation grants cannot be verified
- **THEN** the operation fails safely without performing the protected read or write

### Requirement: Business-state assertions remain distinct from permission grants
The system SHALL preserve firm isolation, ownership, persisted assignment semantics and lifecycle assertions while obtaining capability grants exclusively from Clerk. It SHALL NOT represent arbitrary contract ACLs as growing token metadata or one organization per contract.

#### Scenario: Permitted write targets a closed contract
- **WHEN** a user with the relevant write permission targets a completed or cancelled contract
- **THEN** the existing business read-only rule still rejects the write

### Requirement: Active Organization private metadata defines Firm scope
The system SHALL resolve the authorized Firm exclusively from the currently active Clerk Organization privateMetadata.firmId fetched server-side on each request. The value MUST be a positive integer identifying an existing Firm. Missing, malformed or nonexistent mappings MUST deny access before business operations run. The system MUST NOT use names, fixed IDs, first-Firm fallback, public metadata, unsafe metadata or client inputs to establish Firm scope. Request-local verified state MAY be reused within the same request only.

#### Scenario: Configured Organization selects its Firm
- **WHEN** an active Organization has valid privateMetadata.firmId
- **THEN** the domain session uses precisely that existing Firm
- **AND** operational queries, mutations and exports use that Firm; global masters remain shared and attachment scopes follow their owners

#### Scenario: Organization has no valid mapping
- **WHEN** firmId is absent, null, a string, zero, negative, fractional or references no Firm
- **THEN** no domain session is returned and protected operations do not execute
- **AND** the first Firm is never selected as a fallback

#### Scenario: Mapping changes in Clerk
- **WHEN** the operator changes or removes the active Organization privateMetadata.firmId
- **THEN** the next server request resolves the new mapping or denies access
- **AND** no database update, deployment or webhook delivery is needed

#### Scenario: Browser metadata cannot grant Firm access
- **WHEN** browser input or Organization public/unsafe metadata supplies a firmId without a valid private mapping
- **THEN** access remains denied

#### Scenario: Employee binding survives authorized unit switching
- **WHEN** a User has a valid global active employeeId and switches to another authorized Organization
- **THEN** employee ID and type remain bound while grants and operational scope come from the selected Organization

#### Scenario: General account has no Employee binding
- **WHEN** a member has valid Firm metadata and no employeeId
- **THEN** general capabilities remain available and own/assigned capabilities remain excluded

#### Scenario: Provider unavailable
- **WHEN** the live Organization lookup fails
- **THEN** protected execution fails closed without using cached or default Firm authority

### Requirement: Shared session helpers map authenticated identity to domain actor
The system SHALL map verified Clerk user and active organization IDs to an existing Firm through Organization privateMetadata.firmId and a required global Employee through User privateMetadata.employeeId. Employee SHALL NOT carry firmId. Current Organization membership supplies grants; the active global Employee supplies business actor ID and type. Missing, invalid, inactive or deleted Employee binding SHALL deny session resolution for every role. Both metadata IDs MUST be positive integers referencing existing records.

#### Scenario: Identity mapping fails
- **WHEN** the active Organization lacks a valid existing Firm mapping, or a required Employee identity anchor is missing or does not exist
- **THEN** required session resolution denies access and returns no domain actor

#### Scenario: Authenticated identity resolves to domain actor
- **WHEN** a protected route or server function resolves a verified session with valid Firm metadata and a matching Employee
- **THEN** the shared session helper returns the linked employee id, firm id, Clerk permissions, and employee type needed by current feature authorization rules

#### Scenario: Missing employee link blocks access
- **WHEN** a member has a valid Firm mapping but no Employee binding
- **THEN** protected access is denied even with administrative or general grants
- **AND** no domain session is returned

#### Scenario: Global employee acts in another branch
- **WHEN** a member switches to another authorized Organization with a valid Firm mapping
- **THEN** the same active Employee ID and type remain bound
- **AND** operational reads and writes still enforce the selected Firm and current Organization grants

## ADDED Requirements

### Requirement: Required configuration failures provide actionable recovery
The system SHALL distinguish missing or invalid business bindings from unauthenticated state. For a verified active member it SHALL report all malformed or missing metadata fields together, without exposing private values. Login SHALL show a persistent pt-BR configuration notice identifying the affected user or Organization mapping and instructing administrator correction in Clerk. It SHALL offer retry and sign-out. Organization selection SHALL be hidden whenever any Employee or Firm binding issue exists, including combined issues; these mappings require correction in Clerk. Provider outages SHALL NOT be reported as metadata problems.

#### Scenario: Both metadata fields are missing
- **WHEN** an active verified member lacks employeeId and firmId in private metadata
- **THEN** protected execution is denied and the notice identifies both required mappings

#### Scenario: Invalid reference
- **WHEN** a positive numeric mapping references a nonexistent Firm or nonexistent, inactive or deleted Employee
- **THEN** protected execution is denied and the notice identifies the affected mapping

#### Scenario: Administrator corrects configuration
- **WHEN** mappings are corrected in Clerk and the user retries
- **THEN** current server verification resumes access at the safe original destination without requiring sign-out

#### Scenario: Provider cannot be verified
- **WHEN** provider verification fails or membership is revoked
- **THEN** access remains denied without claiming metadata is missing

#### Scenario: Employee binding requires correction in Clerk
- **WHEN** any employeeId issue is present, alone or with a firmId issue
- **THEN** login hides Organization selection and retains administrator guidance, retry and sign-out

#### Scenario: Only Firm configuration is invalid
- **WHEN** the verified Employee binding has no issue and the Firm mapping is missing or invalid
- **THEN** login hides Organization selection and retains administrator guidance, retry and sign-out

## MODIFIED Requirements

### Requirement: Active Organization private metadata defines Firm scope
The system SHALL resolve the authorized Firm exclusively from the currently active Clerk Organization privateMetadata.firmId fetched server-side on each request. The value MUST be a positive integer identifying an existing Firm. Missing, malformed or nonexistent mappings MUST deny access before business operations run. The system MUST NOT use names, fixed IDs, first-Firm fallback, public metadata, unsafe metadata or client inputs to establish Firm scope. Request-local verified state MAY be reused within the same request only.

#### Scenario: Configured Organization selects its Firm
- **WHEN** an active Organization has valid privateMetadata.firmId
- **THEN** the domain session uses precisely that existing Firm
- **AND** operational queries, mutations and exports use that Firm; global masters remain shared and attachment scopes follow their owners

#### Scenario: Organization has no valid mapping
- **WHEN** firmId is absent, null, a string, zero, negative, fractional or references no Firm
- **THEN** no domain session is returned and protected operations do not execute
- **AND** the first Firm is never selected as a fallback

#### Scenario: Mapping changes in Clerk
- **WHEN** the operator changes or removes the active Organization privateMetadata.firmId
- **THEN** the next server request resolves the new mapping or denies access
- **AND** no database update, deployment or webhook delivery is needed

#### Scenario: Browser metadata cannot grant Firm access
- **WHEN** browser input or Organization public/unsafe metadata supplies a firmId without a valid private mapping
- **THEN** access remains denied

#### Scenario: Employee binding survives authorized unit switching
- **WHEN** a User has a valid global active employeeId and switches to another authorized Organization
- **THEN** employee ID and type remain bound while grants and operational scope come from the selected Organization

#### Scenario: General account has no Employee binding
- **WHEN** a member has valid Firm metadata and no employeeId
- **THEN** all protected access is denied and login shows required Employee configuration guidance without Organization selection

#### Scenario: Provider unavailable
- **WHEN** the live Organization lookup fails
- **THEN** protected execution fails closed without using cached or default Firm authority

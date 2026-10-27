## MODIFIED Requirements

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

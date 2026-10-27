## MODIFIED Requirements

### Requirement: Shared session helpers map authenticated identity to domain actor
The system SHALL map verified Clerk user and active organization IDs to an existing Firm through Organization privateMetadata.firmId and an optional business Employee through User privateMetadata.employeeId. Local role lookups SHALL NOT determine grants, while employee type and assignment data SHALL remain business context for scope enforcement. A valid Employee from another Firm SHALL be omitted from the active unit session together with own/assigned grants; explicitly authorized general grants SHALL remain available.

#### Scenario: Identity mapping fails
- **WHEN** the active Organization lacks a valid existing Firm mapping, or an explicit Employee binding is invalid, inactive or deleted
- **THEN** required session resolution denies access and returns no domain actor

#### Scenario: Authenticated identity resolves to domain actor
- **WHEN** a protected route or server function resolves a verified session with valid Firm metadata and a matching Employee
- **THEN** the shared session helper returns the linked employee id, firm id, Clerk permissions, and employee type needed by current feature authorization rules

#### Scenario: Missing employee link limits actor-scoped access
- **WHEN** a member has a valid Firm mapping but no Employee binding
- **THEN** general capabilities remain available according to current Clerk grants
- **AND** employee and employeeType are null and own/assigned capabilities are excluded

#### Scenario: Employee belongs to another unit
- **WHEN** an active valid Employee binding belongs to a Firm other than the selected Organization's Firm
- **THEN** that Employee is not carried into the selected unit context
- **AND** general capabilities remain available while own/assigned capabilities are excluded

## ADDED Requirements

### Requirement: Active Organization private metadata defines Firm scope
The system SHALL resolve the authorized Firm exclusively from the currently active Clerk Organization privateMetadata.firmId fetched server-side on each request. The value MUST be a positive integer identifying an existing Firm. Missing, malformed or nonexistent mappings MUST deny access before business operations run. The system MUST NOT use names, fixed IDs, first-Firm fallback, public metadata, unsafe metadata or client inputs to establish Firm scope. Request-local verified state MAY be reused within the same request only.

#### Scenario: Configured Organization selects its Firm
- **WHEN** an active Organization has valid privateMetadata.firmId
- **THEN** the domain session uses precisely that existing Firm
- **AND** all existing queries, mutations, exports and attachment scopes use that Firm

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

#### Scenario: Employee binding belongs to another Firm
- **WHEN** a User has a valid active employeeId whose Employee is outside the configured active Firm
- **THEN** the Firm session retains only authorized general grants, with employee and employeeType null and own/assigned grants removed

#### Scenario: General account has no Employee binding
- **WHEN** a member has valid Firm metadata and no employeeId
- **THEN** general capabilities remain available and own/assigned capabilities remain excluded

#### Scenario: Provider unavailable
- **WHEN** the live Organization lookup fails
- **THEN** protected execution fails closed without using cached or default Firm authority

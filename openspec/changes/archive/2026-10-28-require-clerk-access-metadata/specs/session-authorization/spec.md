## MODIFIED Requirements

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

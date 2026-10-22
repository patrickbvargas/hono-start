## MODIFIED Requirements

### Requirement: Shared logged-user session contract
The system SHALL expose one Zod-validated domain projection of verified Clerk identity, active organization, Employee, Firm, employee type and safe capability results. Clerk SHALL remain the provider-session authority, and browser capability data SHALL be advisory rather than trusted server authority.

#### Scenario: Consistent actor
- **WHEN** client and server consumers resolve the same active context
- **THEN** they receive consistent employee and firm identities without maintaining another authentication store

#### Scenario: Signed-out reader
- **WHEN** a public consumer reads the session without an active Clerk identity
- **THEN** the optional session projection returns no actor

### Requirement: Shared authorization helpers
The system SHALL retain a shared canonical action-check surface backed by Clerk Custom Permissions. A typed operation-to-permission catalog SHALL define required checks without assigning permissions to role names. Local UserRole records, employee type and hard-coded Administrator bypasses MUST NOT grant capabilities. Scope and resource checks SHALL enforce provider-granted all/assigned/own access against persisted business facts.

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

### Requirement: Server-side tenant and permission enforcement
The system SHALL enforce verified Clerk authentication, current organization membership, required Custom Permissions and domain scope before protected operations execute. Tenant IDs, role claims and capability projections submitted by clients SHALL NOT grant authority. Queries, counts, options, details, exports, dashboard totals and attachment owner access SHALL apply consistent scopes; absence of a valid scope SHALL deny access.

#### Scenario: Cross-firm resource
- **WHEN** a permitted actor targets a record belonging to another firm
- **THEN** access is denied even if the actor has an all-records permission in the active firm

#### Scenario: Read permission does not imply other actions
- **WHEN** a user has all-records read permission without update, export or delete grants
- **THEN** those operations remain denied

#### Scenario: Sensitive data aggregation
- **WHEN** a dashboard or export is requested with only own/assigned scope
- **THEN** its returned records, counts and derived totals exclude unpermitted firm-wide financial data

### Requirement: Management routes use shared authorization gating before rendering protected UI
The system SHALL gate restricted routes and actions using the required Clerk Custom Permissions through shared session helpers before loading/rendering protected content. Server operations SHALL repeat authoritative enforcement regardless of UI gating.

#### Scenario: Direct management request without grant
- **WHEN** a user without the employee-management permission navigates directly to its route or invokes its server operation
- **THEN** protected employee content is not returned

### Requirement: Shared session helpers map authenticated identity to domain actor
The system SHALL map verified Clerk user and active organization IDs to explicit Employee/Firm links. Local role lookups SHALL NOT determine grants, while employee type and assignment data SHALL remain business context for scope enforcement.

#### Scenario: Identity mapping fails
- **WHEN** no active, non-deleted Employee exists for the current user in the mapped organization
- **THEN** required session resolution denies access and returns no partial actor

## ADDED Requirements

### Requirement: Permission keys follow Clerk feature and action namespaces
The system SHALL name application Custom Permissions using Clerk's `org:<feature>:<permission>` format, with stable English lowercase feature/action identifiers and underscores for compound identifiers. Native `org:sys_domains:read`, `org:sys_domains:manage`, `org:sys_billing:read`, and `org:sys_billing:manage` SHALL retain their Clerk System Permission semantics. Business capabilities SHALL use custom feature names without pretending to be Clerk System Permissions. A custom `manage` permission SHALL grant only operations explicitly mapped to it, not an automatic wildcard.

The feature SHALL identify the resource (`clients`, `contracts`, `fees`, `expenses`, `remunerations`, `attachments`, `employees`, `accounts`, `audit_logs`, `dashboard`), and the permission SHALL identify its action. The approved catalog in design.md SHALL govern provisioning and checks. Employee CRUD SHALL use independent `read`, `create`, `update`, `delete`, `restore` permissions; account administration SHALL use `org:accounts:manage`. No permission SHALL repeat the resource name, such as `org:client_read:clients_read`.

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

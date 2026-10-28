# clerk-identity-lifecycle Specification

## Purpose
Define Clerk identity mapping, lifecycle synchronization, migration and retained Supabase responsibilities.

## Requirements

### Requirement: Clerk identity maps explicitly to firm-scoped business actors
The system SHALL use Clerk as the only runtime authentication, permission-grant and identity-link authority. The active Organization privateMetadata.firmId SHALL identify the existing business Firm; optional User privateMetadata.employeeId SHALL resolve an active, non-deleted Employee, which SHALL remain the same global business actor across authorized Organizations. Employee SHALL NOT carry firmId, and current Organization membership SHALL supply permissions independently of global employee identity. Existing integer business IDs and audit references SHALL remain unchanged, with no provider identity links copied into business tables. Protected access MUST require active membership and a valid Firm mapping. Multiple Organizations MAY intentionally map to the same Firm.

#### Scenario: Organization and employee match
- **WHEN** a verified Clerk session has an active Organization with a valid private Firm mapping and matching active Employee
- **THEN** the system resolves that Employee and Firm as the business actor
- **AND** it derives permission grants from Clerk rather than local role lookups

#### Scenario: Invalid mapping or membership
- **WHEN** membership or Firm metadata is absent, or an explicit Employee mapping is invalid, inactive or deleted
- **THEN** protected access is denied without creating a default Firm or granting default permissions

#### Scenario: Valid member without Employee mapping
- **WHEN** an active member has a valid Firm mapping and no employeeId
- **THEN** general grants are available while own/assigned grants are excluded

### Requirement: Lifecycle synchronization is verified and repeatable
The system SHALL verify webhook signatures, deduplicate deliveries, reconcile out-of-order events against current Clerk state, and support repeatable provisioning/reconciliation without duplicated users or memberships. Webhook delivery MUST NOT be the synchronous prerequisite that decides authorization.

#### Scenario: Forged event
- **WHEN** a webhook has an invalid signature
- **THEN** the system rejects the request without changing domain or identity mappings

#### Scenario: Duplicate or delayed event
- **WHEN** an already processed event or an old membership event arrives
- **THEN** reconciliation does not duplicate links or restore access removed in current provider state

#### Scenario: Provider operation succeeds before local write fails
- **WHEN** provisioning creates an identity but persistence of its mapping fails
- **THEN** the operation reports a safe pending/error result and supports reconciliation without creating another identity
- **AND** the unmatched identity has no protected application access

### Requirement: Migration preserves business history and restrictive access state
The system SHALL provide a dry-run and repeatable migration mapping old identities to Clerk, preserve business/audit IDs, preserve revoked/inactive/deleted restrictions, and require fresh sessions after cutover. Password import SHALL require verified provider-supported hashes; otherwise users SHALL complete Clerk account setup or recovery. No plaintext credentials SHALL enter logs, audits or repository artifacts.

#### Scenario: Revoked user is migrated
- **WHEN** a revoked or inactive employee is included in a migration
- **THEN** migration does not grant that employee active product membership/access

#### Scenario: Password hash cannot be imported
- **WHEN** a source password digest is unavailable or unsupported
- **THEN** the account follows Clerk-supported setup/recovery rather than an application credential fallback

### Requirement: Clerk setup and residual Supabase responsibilities are explicit
The system SHALL document development/production keys, role grants, permission limits, session settings, account restrictions, migration and recovery. Supabase Auth dependencies SHALL be removed after cutover while DB hosting and attachment Storage remain operational in this change.

#### Scenario: Production prerequisite unavailable
- **WHEN** required Custom Permissions or session configuration is not available in the selected Clerk production configuration
- **THEN** cutover is blocked with a documented prerequisite rather than silently substituting local authorization grants

### Requirement: Denied organization access preserves organization selection
A signed-in user without application access SHALL retain access to the login organization-selection surface. When an Organization is active the surface SHALL explain that the selected unit could not be loaded and direct the user to check its configuration with an administrator or select another Organization, without implying missing membership or exposing private mapping details. Selecting another valid Organization SHALL recover application access through normal verification and preserve the safe destination.

#### Scenario: Unmapped branch is selected
- **WHEN** a signed-in user selects an Organization without a valid Firm mapping
- **THEN** the protected route redirects to login and shows safe access guidance plus OrganizationList
- **AND** no business data from the previously active Organization remains available through the protected route

#### Scenario: User selects an available branch
- **WHEN** the denied user selects another Organization with valid mapping and grants
- **THEN** normal verified access resumes using that Organization's configured Firm

### Requirement: Clerk identity maps explicitly to firm-scoped business actors
The system SHALL use Clerk as the only runtime authentication, permission-grant and identity-link authority. The active Organization privateMetadata.firmId SHALL identify the existing business Firm; required User privateMetadata.employeeId SHALL resolve an active, non-deleted Employee, which SHALL remain the same global business actor across authorized Organizations. Employee SHALL NOT carry firmId, and current Organization membership SHALL supply permissions independently of global employee identity. Existing integer business IDs and audit references SHALL remain unchanged, with no provider identity links copied into business tables. Protected access MUST require active membership and valid Firm and Employee mappings. Multiple Organizations MAY intentionally map to the same Firm.

#### Scenario: Organization and employee match
- **WHEN** a verified Clerk session has an active Organization with a valid private Firm mapping and matching active Employee
- **THEN** the system resolves that Employee and Firm as the business actor
- **AND** it derives permission grants from Clerk rather than local role lookups

#### Scenario: Invalid mapping or membership
- **WHEN** membership or Firm metadata is absent, or an Employee mapping is absent, invalid, inactive or deleted
- **THEN** protected access is denied without creating a default Firm or granting default permissions

#### Scenario: Valid member without Employee mapping
- **WHEN** an active member has a valid Firm mapping and no employeeId
- **THEN** all protected access is denied, including administrative and general grants

### Requirement: Denied organization access preserves organization selection
A signed-in user without application access SHALL retain access to the login recovery surface. Organization selection SHALL remain available unless an Employee or Firm binding issue requires correction in Clerk. When configuration issues exist the surface SHALL direct correction in Clerk and offer retry and sign-out without Organization selection. Other access denials SHALL retain safe guidance and Organization selection without implying missing membership or exposing private mapping values. Selecting another valid Organization SHALL recover application access through normal verification and preserve the safe destination.

#### Scenario: Unmapped branch is selected
- **WHEN** a signed-in user selects an Organization without a valid Firm mapping
- **THEN** the protected route redirects to login and shows configuration guidance, retry and sign-out without OrganizationList
- **AND** no business data from the previously active Organization remains available through the protected route

#### Scenario: User selects an available branch
- **WHEN** the denied user selects another Organization with valid mapping and grants
- **THEN** normal verified access resumes using that Organization's configured Firm

# clerk-identity-lifecycle Specification

## Purpose
Define Clerk identity mapping, lifecycle synchronization, migration and retained Supabase responsibilities.

## Requirements

### Requirement: Clerk identity maps explicitly to firm-scoped business actors
The system SHALL use Clerk as the only runtime authentication and permission-grant authority, map each Firm to a unique Clerk Organization and each enabled Employee to an explicit Clerk User link, and preserve existing integer business identifiers and audit references. Protected access MUST require an active membership and an active, non-deleted Employee belonging to the mapped active organization.

#### Scenario: Organization and employee match
- **WHEN** a verified Clerk session has an active organization with a matching active Employee
- **THEN** the system resolves that employee and firm as the business actor
- **AND** it derives permission grants from Clerk rather than local role lookups

#### Scenario: Invalid mapping or membership
- **WHEN** membership is absent or the employee/organization mapping is missing, mismatched, or ambiguous
- **THEN** the system denies protected access without creating a default firm or granting default permissions

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

## ADDED Requirements

### Requirement: Private server-mediated persistence
The system SHALL persist attachments in a private Supabase Storage bucket using server-only credentials and preserve existing Clerk and owner authorization for every operation.

#### Scenario: Authorized file delivery
- **WHEN** a user with existing owner read permission opens an attachment
- **THEN** the protected application endpoint returns its bytes with existing MIME, safe filename, private/no-store and nosniff headers

#### Scenario: Unauthorized access
- **WHEN** a user lacks access to the attachment owner or operational Firm scope
- **THEN** the request is denied before Storage bytes are read

#### Scenario: Missing storage configuration
- **WHEN** required Storage configuration is absent
- **THEN** attachment operations fail with controlled feedback while unrelated application features remain available

### Requirement: Stable identities and failure behavior
The system SHALL preserve existing storage keys, metadata, file and batch limits, audit behavior, overwrite prevention and compensating cleanup/restoration. It SHALL distinguish missing files from authorization and service failures.

#### Scenario: Existing key collision
- **WHEN** an upload targets an existing object key
- **THEN** existing bytes remain unchanged and upload fails

#### Scenario: Metadata failure after upload
- **WHEN** metadata persistence fails after storing a new object
- **THEN** the system attempts staged-object cleanup and records any cleanup failure for reconciliation

#### Scenario: Metadata failure after deletion
- **WHEN** metadata deletion fails after object removal
- **THEN** the system attempts restoration of captured bytes at the original key and records any restoration failure

#### Scenario: Missing file versus unavailable provider
- **WHEN** Storage reports a genuinely missing file during read
- **THEN** the application returns its existing not-found response
- **AND** denied access and provider outages are not reported as missing files

#### Scenario: Delete already missing object
- **WHEN** an authorized permanent deletion targets metadata whose object is already missing
- **THEN** missing bytes do not prevent metadata deletion under existing rules

### Requirement: Verified provider cutover
The rollout SHALL inventory existing references and preserve exact keys and bytes for objects designated for retention before switching providers. An explicit owner decision MAY waive migration of disposable legacy data; that decision SHALL be recorded and SHALL NOT itself execute a reset or deletion. It SHALL retain source objects and document rollback reconciliation after target writes.

#### Scenario: Retained objects exist
- **WHEN** R2 contains attachment objects designated for retention
- **THEN** referenced objects are copied under identical keys and downloaded size and SHA-256 are verified before cutover

#### Scenario: No retained objects
- **WHEN** inventory finds no objects requiring preservation
- **THEN** that result is recorded without a production reset or fabricated copy verification

#### Scenario: Rollback after target writes
- **WHEN** rollback is required after Supabase attachment mutations
- **THEN** writes are paused and affected objects and metadata are reconciled before restoring the previous provider

#### Scenario: Disposable legacy data migration waived
- **WHEN** the owner explicitly waives migration because existing data will be reset separately
- **THEN** the decision and unavailable legacy references are recorded
- **AND** no reset or deletion is executed as part of that waiver

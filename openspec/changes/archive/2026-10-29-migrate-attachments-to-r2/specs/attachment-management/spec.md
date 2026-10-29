## MODIFIED Requirements

### Requirement: Private local attachment persistence
The system SHALL persist new attachment binaries in a private Cloudflare R2 bucket rather than the application host filesystem. Metadata SHALL retain relative opaque object identities. Existing file formats, size limits, owner binding, batch capacity and audit rules SHALL remain enforced.

#### Scenario: Upload with R2 configured
- **WHEN** an authorized user uploads a valid attachment with server-side R2 configuration
- **THEN** the object and metadata are persisted without requiring a local attachment directory or Supabase storage credentials

#### Scenario: Application host is replaced
- **WHEN** the application is deployed to another host with the same R2 configuration and database
- **THEN** existing attachments remain accessible without copying a local directory

#### Scenario: Storage cannot accept a write
- **WHEN** R2 rejects or fails an upload
- **THEN** the system returns a safe pt-BR failure and does not persist successful metadata

#### Scenario: Metadata persistence fails
- **WHEN** object upload succeeds but metadata persistence fails
- **THEN** the system attempts staged-object cleanup, logs cleanup failure for repair and reports failure

#### Scenario: Invalid object identity
- **WHEN** an operation supplies an absolute path, traversal or an invalid object identity
- **THEN** the system rejects it without accessing an unintended object

### Requirement: Authorized local file delivery
The system SHALL deliver R2 attachment bytes through a protected application endpoint. Each request MUST enforce current session and owner-resource access, including Firm scope for operational owners and company-wide access for shared owners, before retrieving the object. Files MUST NOT be exposed as public static assets or publicly cached responses.

#### Scenario: Authorized view
- **WHEN** a user with current access to the attachment owner requests its file
- **THEN** the system returns the binary with recorded content type and safe original filename

#### Scenario: Unauthorized access
- **WHEN** a request lacks a valid session or required owner access
- **THEN** the system denies binary delivery before retrieving the object

#### Scenario: Missing object
- **WHEN** an authorized request references metadata whose R2 object is absent
- **THEN** the system returns controlled not-found behavior without filesystem fallback or internal configuration disclosure

#### Scenario: Shared evidence from another upload branch
- **WHEN** an authorized user accesses a shared Client or Employee attachment uploaded in another branch
- **THEN** access follows the shared owner and is not rejected solely because of the object's origin prefix

### Requirement: Permanent local attachment deletion
Authorized attachment deletion SHALL permanently remove both the R2 object and database record, preserving audit behavior and existing capability checks. Failed metadata commits after object removal MUST trigger restoration attempts and diagnostics for any recovery failure.

#### Scenario: Successful deletion
- **WHEN** an authorized user confirms deletion
- **THEN** the object and metadata are removed and deletion is audited

#### Scenario: Object removal fails
- **WHEN** storage failure prevents removing an existing object
- **THEN** metadata is retained and the system reports a safe deletion failure

#### Scenario: Object already missing
- **WHEN** authorized deletion finds the object already absent
- **THEN** metadata deletion and auditing can complete

#### Scenario: Database commit fails after object removal
- **WHEN** deletion removes an object but the database mutation fails
- **THEN** the system retains metadata, attempts restoration of original bytes, reports failure and logs any failed restoration for repair

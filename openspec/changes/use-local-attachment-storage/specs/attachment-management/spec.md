## ADDED Requirements

### Requirement: Private local attachment persistence
The system SHALL store new attachment binaries under a configurable private persistent directory on the application host without Supabase access. Metadata SHALL retain relative file identities. Existing file formats, size limits, owner binding and audit rules SHALL remain enforced.

#### Scenario: Upload without Supabase configuration
- **WHEN** an authorized user uploads a valid attachment with writable local storage configured and no Supabase credentials
- **THEN** the binary and metadata are persisted successfully

#### Scenario: Persistent root is relocated
- **WHEN** an operator moves all files preserving relative paths and updates the configured root
- **THEN** existing local attachments remain accessible without metadata changes

#### Scenario: Storage cannot accept a write
- **WHEN** disk capacity or filesystem permissions prevent upload
- **THEN** the system returns a safe pt-BR failure and does not persist successful attachment metadata

#### Scenario: Metadata persistence fails
- **WHEN** a binary write succeeds but metadata persistence fails
- **THEN** the system attempts binary cleanup, logs any cleanup failure and reports failure

#### Scenario: Escaping storage path
- **WHEN** a file operation would escape the configured root through an absolute path, traversal or symlink
- **THEN** the system rejects the operation without accessing the external file

### Requirement: Authorized local file delivery
The system SHALL deliver attachment bytes through a protected application endpoint. Each request MUST enforce current session, firm and parent-resource access before reading the file. Files MUST NOT be exposed as public static assets or publicly cached responses.

#### Scenario: Authorized view
- **WHEN** a user with current access to the attachment owner requests its file
- **THEN** the system returns the binary with its recorded content type and safe original filename

#### Scenario: Unauthorized access
- **WHEN** a request lacks a valid session or current firm or parent access
- **THEN** the system denies binary delivery

#### Scenario: Missing local binary
- **WHEN** an authorized request references metadata whose local file is absent
- **THEN** the system returns controlled not-found behavior without Supabase fallback or internal path disclosure

### Requirement: Permanent local attachment deletion
Authorized attachment deletion SHALL permanently remove both local binary and database record, preserving audit behavior and existing capability checks.

#### Scenario: Successful deletion
- **WHEN** an authorized user confirms deletion
- **THEN** the local file and metadata are removed and deletion is audited

#### Scenario: File removal fails
- **WHEN** filesystem failure prevents removing an existing binary
- **THEN** the record is retained and the system reports a safe deletion failure

#### Scenario: Binary already missing
- **WHEN** authorized deletion finds the binary already absent
- **THEN** metadata deletion and auditing can complete

## ADDED Requirements

### Requirement: Attachment lists identify the original sender

The system SHALL display Enviado por followed by the original upload actor name from the immutable CREATE event. It MUST scope attribution to the authorized firm and listed attachments and MUST NOT expose audit payloads or email addresses.

#### Scenario: Single or batch upload
- **WHEN** an authenticated user submits one or several files
- **THEN** every file retains the session-derived actor in its atomic CREATE audit event and lists that sender

#### Scenario: Historical attribution
- **WHEN** an attachment has a verifiable CREATE actor
- **THEN** its original recorded name is shown regardless of subsequent actors or account changes

#### Scenario: Unknown sender
- **WHEN** no CREATE event exists or its actor is empty or Sistema
- **THEN** the list displays Autor não informado

### Requirement: Upload guidance communicates remaining capacity clearly

The upload form SHALL show actual remaining capacity, selection and drag instructions, supported PDF/JPG/PNG formats and the 10 MB per-file limit without repeating a fixed batch allowance.

#### Scenario: Partially occupied owner
- **WHEN** an owner has existing attachments
- **THEN** guidance states the number of additional files allowed and selection enforces that capacity

#### Scenario: Compact attachment metadata
- **WHEN** an attachment row is displayed
- **THEN** its filename title remains unchanged and size, date and sender share one metadata line
- **AND** long sender names truncate visually with full text available in a tooltip

## MODIFIED Requirements

### Requirement: Atomic attachment batch upload
The system SHALL accept between 1 and 10 files in one protected upload operation for exactly one authorized owner. Every file SHALL satisfy existing PDF, JPG, PNG, filename and 10 MB limits. The modal SHALL support multiple selection and drag and drop, display selected filenames and sizes, allow individual removal, and show preparation and submission feedback. The server SHALL validate the entire batch before staging files and commit all metadata and audit events in a single transaction. On staging or transaction failure, it SHALL attempt cleanup of all staged binaries, log cleanup failures, and report a safe error. No partial metadata SHALL be committed. The client SHALL retain the complete selection after a failed operation.

#### Scenario: Send a complete batch
- **WHEN** an authorized user submits 1 to 10 valid files within remaining capacity
- **THEN** all files are submitted in one request and their metadata and audit events are committed together

#### Scenario: Reject an invalid batch
- **WHEN** the request contains zero files, more than 10 files, or an invalid file
- **THEN** the server rejects the entire batch before storing binaries or metadata

#### Scenario: Failed staging or persistence
- **WHEN** any file cannot be staged or any metadata or audit write fails
- **THEN** no partial metadata is committed and all already staged binaries are scheduled for immediate cleanup
- **AND** cleanup failures are logged and the complete selection remains available for retry

#### Scenario: Review and remove selected files
- **WHEN** a user selects or drops multiple files
- **THEN** the modal shows their names and sizes and allows individual removal before submission
- **AND** selections beyond available capacity are visibly rejected without silent truncation

### Requirement: Maximum attachments per owner
Each client, employee, contract, expense, fee or remuneration SHALL accept at most 10 non-deleted attachments, including inactive attachments. The server SHALL serialize capacity checking and batch creation per firm and owner so concurrent uploads cannot exceed the limit. The modal SHALL show remaining capacity and limit selection to that capacity. At capacity, Anexar SHALL be disabled. Deletion SHALL free capacity. Existing records above the limit SHALL remain readable but SHALL reject further uploads.

#### Scenario: Remaining capacity limits the batch
- **WHEN** an owner already has 8 non-deleted attachments
- **THEN** at most two additional files can be selected and accepted

#### Scenario: Full owner
- **WHEN** an owner has 10 or more non-deleted attachments
- **THEN** additional uploads are rejected and the upload action is disabled

#### Scenario: Concurrent uploads
- **WHEN** concurrent batches together would exceed owner capacity
- **THEN** the server serializes count-and-create and rejects a batch that no longer fits without committing any part of that batch

#### Scenario: Deletion releases capacity
- **WHEN** an attachment is permanently deleted successfully
- **THEN** its slot becomes available for another upload


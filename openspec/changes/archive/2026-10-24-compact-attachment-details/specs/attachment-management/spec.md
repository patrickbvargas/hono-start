## MODIFIED Requirements

### Requirement: List attachments in supported owner contexts
The system SHALL display attachments inside client, employee, contract and expense detail drawers without leaving the parent context. A single shared-style heading SHALL align the count and authorized upload action. Files SHALL appear in compact divided rows with filename, type, file size and creation date visible without expansion. Download SHALL remain visible; authorized deletion SHALL be available through a secondary actions menu and retain explicit confirmation. Loading SHALL use matching skeletons. Empty and error states SHALL remain explicit. Tenant scope and existing permission checks SHALL remain enforced.

#### Scenario: Client details show client attachments
- **WHEN** a user opens an authorized client detail
- **THEN** only that client's attachments in the current firm are listed

#### Scenario: Employee details show employee attachments
- **WHEN** a user opens an authorized employee detail
- **THEN** only that employee's attachments in the current firm are listed

#### Scenario: Contract details show contract attachments
- **WHEN** a user opens an authorized contract detail
- **THEN** only that contract's attachments in the current firm are listed

#### Scenario: Expense details show expense attachments
- **WHEN** a user opens an authorized expense detail
- **THEN** only that expense's attachments in the current firm are listed

#### Scenario: Single compact header
- **WHEN** attachment data is available
- **THEN** one Anexos heading displays the count and permitted Anexar action on the same line

#### Scenario: Visible metadata and actions
- **WHEN** files exist
- **THEN** filename, type, size, date and download appear together without expanding
- **AND** deletion is offered in a keyboard-accessible menu only to authorized users

#### Scenario: Long filename and narrow viewport
- **WHEN** a filename exceeds the available line width
- **THEN** it wraps without pushing actions outside the drawer

#### Scenario: Loading and empty list
- **WHEN** data is loading
- **THEN** the header and row layout use skeleton placeholders
- **WHEN** the loaded list is empty
- **THEN** the section shows Nenhum anexo cadastrado and retains the permitted upload action

#### Scenario: Query failure
- **WHEN** attachment loading fails
- **THEN** the section displays a safe error and offers retry without leaving the drawer

#### Scenario: Download unavailable
- **WHEN** a file has no download URL
- **THEN** its download action is disabled

#### Scenario: Many attachments
- **WHEN** the file list exceeds approximately three compact rows
- **THEN** it scrolls inside a maximum height of 12rem while the heading and upload action remain outside the scroll area

## ADDED Requirements

### Requirement: Atomic attachment batch upload
The system SHALL accept between 1 and 25 files in one protected upload operation for exactly one authorized owner. Every file SHALL satisfy existing PDF, JPG, PNG, filename and 10 MB limits. The modal SHALL support multiple selection and drag and drop, display selected filenames and sizes, allow individual removal, and show preparation and submission feedback. The server SHALL validate the entire batch before staging files and commit all metadata and audit events in a single transaction. On staging or transaction failure, it SHALL attempt cleanup of all staged binaries, log cleanup failures, and report a safe error. No partial metadata SHALL be committed. The client SHALL retain the complete selection after a failed operation.

#### Scenario: Send a complete batch
- **WHEN** an authorized user submits 1 to 25 valid files within remaining capacity
- **THEN** all files are submitted in one request and their metadata and audit events are committed together

#### Scenario: Reject an invalid batch
- **WHEN** the request contains zero files, more than 25 files, or an invalid file
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
Each client, employee, contract or expense SHALL accept at most 25 non-deleted attachments, including inactive attachments. The server SHALL serialize capacity checking and batch creation per firm and owner so concurrent uploads cannot exceed the limit. The modal SHALL show remaining capacity and limit selection to that capacity. At capacity, Anexar SHALL be disabled. Deletion SHALL free capacity. Existing records above the limit SHALL remain readable but SHALL reject further uploads.

#### Scenario: Remaining capacity limits the batch
- **WHEN** an owner already has 23 non-deleted attachments
- **THEN** at most two additional files can be selected and accepted

#### Scenario: Full owner
- **WHEN** an owner has 25 or more non-deleted attachments
- **THEN** additional uploads are rejected and the upload action is disabled

#### Scenario: Concurrent uploads
- **WHEN** concurrent batches together would exceed owner capacity
- **THEN** the server serializes count-and-create and rejects a batch that no longer fits without committing any part of that batch

#### Scenario: Deletion releases capacity
- **WHEN** an attachment is permanently deleted successfully
- **THEN** its slot becomes available for another upload

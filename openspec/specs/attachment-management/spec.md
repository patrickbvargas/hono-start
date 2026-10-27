# Spec: attachment-management

## Purpose

Define attachment upload, listing, owner-context binding, storage persistence, and permission behavior for client, employee, contract, expense, fee, and remuneration contexts.

---
## Requirements
### Requirement: List attachments in supported owner contexts
The system SHALL display attachments inside client, employee, contract, expense, fee and remuneration detail drawers without leaving the parent context. A single shared-style heading SHALL align the count and authorized upload action. Files SHALL appear in compact divided rows with filename, type, file size and creation date visible without expansion. Download SHALL remain visible; authorized deletion SHALL be available through a secondary actions menu and retain explicit confirmation. Loading SHALL use matching skeletons. Empty and error states SHALL remain explicit. Tenant scope and existing permission checks SHALL remain enforced.

#### Scenario: Client details show client attachments
- **WHEN** a user opens an authorized client detail
- **THEN** only that global client's attachments are listed, independent of upload branch

#### Scenario: Employee details show employee attachments
- **WHEN** a user opens an authorized employee detail
- **THEN** only that global employee's attachments are listed, independent of upload branch

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


#### Scenario: Financial details and dedicated pages
- **WHEN** a user opens an authorized fee or remuneration drawer or its Anexos page tab
- **THEN** only that financial record's attachments appear with shared upload, list, download and confirmed deletion

### Requirement: Attachment writes bind to exactly one owner context
The system SHALL persist each attachment with exactly one owner context among client, employee, contract, expense, fee, or remuneration.

#### Scenario: Valid single owner context
- **WHEN** a user uploads an attachment with exactly one valid global Client/Employee owner or operational owner in the authenticated Firm
- **THEN** the system persists the attachment metadata linked to that owner

#### Scenario: Missing owner context is rejected
- **WHEN** an upload request does not provide any owner context
- **THEN** the system rejects the request before the attachment metadata is persisted

#### Scenario: Multiple owner contexts are rejected
- **WHEN** an upload request provides more than one owner context
- **THEN** the system rejects the request before the attachment metadata is persisted

#### Scenario: Expense upload uses expense as the only owner context
- **WHEN** an administrator uploads an attachment from an expense detail workflow
- **THEN** the system persists the attachment metadata linked to that expense
- **AND** no second owner context is accepted in the same request

### Requirement: Attachment uploads enforce file rules
The system SHALL accept only supported attachment types and sizes defined by the domain contract. The upload flow SHALL let the user select the file directly, and the system SHALL identify the attachment type from the selected file rather than requiring a separate manual type selection.

#### Scenario: Upload supported PDF
- **WHEN** a user selects a PDF file within the size limit
- **THEN** the system identifies the attachment as `PDF`
- **AND** the system accepts the upload if the parent context and permissions are valid

#### Scenario: Upload supported image
- **WHEN** a user selects a JPG or PNG file within the size limit
- **THEN** the system identifies the attachment as `JPG` or `PNG` from the selected file
- **AND** the system accepts the upload if the parent context and permissions are valid

#### Scenario: Reject unsupported type
- **WHEN** a user selects a file whose type is not `PDF`, `JPG`, or `PNG`
- **THEN** the system rejects the upload with a clear pt-BR error message

#### Scenario: Reject oversize file
- **WHEN** a user selects a file larger than `10 MB`
- **THEN** the system rejects the upload with a clear pt-BR error message

#### Scenario: No duplicate type chooser in upload flow
- **WHEN** a user starts the attachment upload flow from a supported owner context
- **THEN** the system presents a single file-selection control
- **AND** the system MUST NOT require a separate manual attachment-type selection before upload

### Requirement: Attachment metadata is stored separately from file storage identity
The system SHALL persist attachment metadata in the application database and store the binary file in the configured storage backend.

#### Scenario: Successful upload persists metadata and storage path
- **WHEN** a user uploads a valid attachment
- **THEN** the system stores the file in the configured storage backend
- **AND** the attachment record persists the original file name, storage path or URL, type, size, and owner context

#### Scenario: Persistence failure does not leave a successful write hidden
- **WHEN** the binary upload succeeds but metadata persistence fails
- **THEN** the system reports the failure to the user
- **AND** the implementation preserves a consistent attachment state rather than silently reporting success

### Requirement: Attachment permissions follow the documented role model
The system SHALL enforce authenticated upload and view permissions and administrator-only delete permissions for attachments.

#### Scenario: Authenticated user can upload in allowed context
- **WHEN** an authenticated user uploads an attachment in a parent context they are allowed to access
- **THEN** the server accepts the request if the file and owner validations pass

#### Scenario: Authenticated user can view attachment metadata in allowed context
- **WHEN** an authenticated user requests attachment data for a parent context they are allowed to access
- **THEN** the server returns only attachment records for that allowed context

#### Scenario: Administrator can upload and view attachments for expenses
- **WHEN** an administrator uploads or requests attachment data for an expense in the same firm
- **THEN** the server accepts the request if the expense exists and the file and owner validations pass

#### Scenario: Regular user cannot access expense attachments
- **WHEN** a regular authenticated user requests expense attachment data or attempts an expense attachment upload
- **THEN** the server rejects the request before attachment data is returned or persisted

#### Scenario: Regular user cannot delete attachment
- **WHEN** a regular user attempts to delete an attachment
- **THEN** the server rejects the action before the attachment lifecycle changes

#### Scenario: Administrator can delete attachment
- **WHEN** an administrator confirms deletion for an authorized shared-master attachment or current-Firm operational attachment
- **THEN** the system permanently deletes both the storage object and the attachment record
- **AND** the attachment is removed from the default attachment list

### Requirement: Attachment operations preserve tenant isolation
The system SHALL derive branch context from the authenticated session. Client/employee evidence SHALL be shared across this company under existing subject and attachment grants; operational evidence SHALL remain branch-scoped. Client-submitted authority claims SHALL NOT widen access.

#### Scenario: Cross-firm owner reference is rejected
- **WHEN** a user submits an attachment upload using an operational owner outside the authenticated firm
- **THEN** the system rejects the request before storage metadata is persisted

#### Scenario: Cross-firm attachment list is never returned
- **WHEN** an attachment list query is executed
- **THEN** the system returns attachments of the requested shared client/employee, or operational attachments belonging to the authenticated user's firm

#### Scenario: Shared master evidence
- **WHEN** a permitted branch user opens a shared client/employee from any branch
- **THEN** listing, upload, direct download and deletion follow the same shared client/employee ownership and existing action grants
- **AND** capacity is enforced once per global owner, independent of upload branch

### Requirement: Attachment sections preserve the current parent workflow
The system SHALL integrate attachment actions into the existing client, employee, contract, expense, fee, and remuneration detail flows using drawers and modals rather than standalone CRUD pages.

#### Scenario: Upload opens as an overlay from parent details
- **WHEN** a user starts the attachment upload flow from a supported parent detail context
- **THEN** the system opens the upload interaction as a modal or overlay
- **AND** the parent list and detail context remain preserved

#### Scenario: Delete requires explicit confirmation
- **WHEN** an administrator starts the attachment delete flow
- **THEN** the system requires explicit confirmation before the attachment is deleted

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
Each client, employee, contract, expense, fee or remuneration SHALL accept at most 10 non-deleted attachments, including inactive attachments. The server SHALL serialize capacity checking and batch creation per global Client/Employee owner, or per Firm and operational owner, so concurrent uploads cannot exceed the limit. The modal SHALL show remaining capacity and limit selection to that capacity. At capacity, Anexar SHALL be disabled. Deletion SHALL free capacity. Existing records above the limit SHALL remain readable but SHALL reject further uploads.

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

### Requirement: Financial evidence permissions and lifecycle
The system SHALL require the corresponding attachment upload/read/delete capability plus the financial owner's subject read capability. Fee access SHALL enforce read_all or eligible read_assigned scope. Remuneration access SHALL enforce read_all or read_own scope. Financial evidence uploads SHALL NOT require monetary update permission and SHALL remain possible after contract completion or cancellation. Uploads SHALL reject owners or financial ancestors that are soft-deleted. Existing evidence SHALL be retained across soft deletion and restoration. Existing file, capacity, batch atomicity, private storage and audit rules SHALL apply to both financial owners.

#### Scenario: Own remuneration without financial edit access
- **WHEN** a user with attachment upload and own remuneration read uploads a valid document to their remuneration
- **THEN** upload succeeds without granting financial edits or other collaborators' access

#### Scenario: Assigned fee scope on every operation
- **WHEN** a user with only assigned fee reads requests list, upload, download or deletion for an unassigned fee
- **THEN** the operation is denied before metadata, bytes or mutations are exposed

#### Scenario: Completed or cancelled contract
- **WHEN** a readable receipt belongs to a completed or cancelled contract and the actor can upload evidence
- **THEN** a valid proof can be attached without modifying financial values or contract status

#### Scenario: Deleted financial ancestry
- **WHEN** upload targets a deleted financial owner or ancestor
- **THEN** upload is denied and existing files remain retained for authorized reading and restoration

#### Scenario: Financial capacity and exclusivity
- **WHEN** an owner has 10 attachments or upload provides both feeId and remunerationId
- **THEN** the request is rejected without committing files or metadata

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

### Requirement: Attachment items expose equivalent action menus
Attachment items SHALL offer Baixar arquivo and permitted Excluir through right-click and visible overflow menus. The existing download shortcut SHALL remain. Existing authorization, download URL and deletion-confirmation behavior SHALL apply identically to all surfaces.

#### Scenario: Download
- **WHEN** the user selects Baixar arquivo from either menu
- **THEN** the same authorized file URL SHALL open as the existing download shortcut

#### Scenario: Restricted deletion
- **WHEN** the viewer cannot delete attachments
- **THEN** Excluir SHALL be absent from both menus while the download choice remains accessible

#### Scenario: Unavailable download
- **WHEN** an attachment has no download URL
- **THEN** Baixar arquivo SHALL be disabled in both menus and the shortcut

#### Scenario: Delete with confirmation
- **WHEN** the user selects Excluir
- **THEN** the existing delete confirmation SHALL open for the selected attachment ID

#### Scenario: Keyboard access
- **WHEN** a focused attachment item receives Shift+F10 or ContextMenu
- **THEN** its context menu SHALL open and Escape SHALL close it with focus returned to the item

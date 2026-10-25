## MODIFIED Requirements

### Requirement: List attachments in supported owner contexts
The system SHALL display attachments inside client, employee, contract, expense, fee and remuneration detail drawers without leaving the parent context. A single shared-style heading SHALL align the count and authorized upload action. Files SHALL appear in compact divided rows with filename, type, file size and creation date visible without expansion. Download SHALL remain visible; authorized deletion SHALL be available through a secondary actions menu and retain explicit confirmation. Loading SHALL use matching skeletons. Empty and error states SHALL remain explicit. Tenant scope and existing permission checks SHALL remain enforced.

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


#### Scenario: Financial details and dedicated pages
- **WHEN** a user opens an authorized fee or remuneration drawer or its Anexos page tab
- **THEN** only that financial record's attachments appear with shared upload, list, download and confirmed deletion

### Requirement: Attachment writes bind to exactly one owner context
The system SHALL persist each attachment with exactly one owner context among client, employee, contract, expense, fee, or remuneration.

#### Scenario: Valid single owner context
- **WHEN** a user uploads an attachment with exactly one valid owner reference in the authenticated firm
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

### Requirement: Attachment operations preserve tenant isolation
The system SHALL derive attachment tenant scope from the authenticated session rather than from client-submitted authority claims.

#### Scenario: Cross-firm owner reference is rejected
- **WHEN** a user submits an attachment upload for a client, employee, contract, expense, fee, or remuneration outside the authenticated firm
- **THEN** the system rejects the request before storage metadata is persisted

#### Scenario: Cross-firm attachment list is never returned
- **WHEN** an attachment list query is executed
- **THEN** the system returns only attachments belonging to the authenticated user's firm

### Requirement: Attachment sections preserve the current parent workflow
The system SHALL integrate attachment actions into the existing client, employee, contract, expense, fee, and remuneration detail flows using drawers and modals rather than standalone CRUD pages.

#### Scenario: Upload opens as an overlay from parent details
- **WHEN** a user starts the attachment upload flow from a supported parent detail context
- **THEN** the system opens the upload interaction as a modal or overlay
- **AND** the parent list and detail context remain preserved

#### Scenario: Delete requires explicit confirmation
- **WHEN** an administrator starts the attachment delete flow
- **THEN** the system requires explicit confirmation before the attachment is deleted

### Requirement: Maximum attachments per owner
Each client, employee, contract, expense, fee or remuneration SHALL accept at most 25 non-deleted attachments, including inactive attachments. The server SHALL serialize capacity checking and batch creation per firm and owner so concurrent uploads cannot exceed the limit. The modal SHALL show remaining capacity and limit selection to that capacity. At capacity, Anexar SHALL be disabled. Deletion SHALL free capacity. Existing records above the limit SHALL remain readable but SHALL reject further uploads.

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

## ADDED Requirements

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
- **WHEN** an owner has 25 attachments or upload provides both feeId and remunerationId
- **THEN** the request is rejected without committing files or metadata

## MODIFIED Requirements

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

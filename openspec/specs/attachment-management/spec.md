# Spec: attachment-management

## Purpose

Define attachment upload, listing, owner-context binding, storage persistence, and permission behavior for client, employee, and contract contexts.

---

## Requirements

### Requirement: List attachments in supported owner contexts
The system SHALL display attachments for a client, employee, or contract inside that entity's detail workflow without leaving the parent context. The attachment area SHALL render as a dedicated section aligned with the surrounding detail drawer sections, and its loading state SHALL use skeleton-style placeholders rather than spinner-only feedback. When attachments exist, the section SHALL render them through a shared accordion-style list so each item keeps a concise header and reveals metadata only when expanded.

#### Scenario: Client details show client attachments
- **WHEN** a user opens a client detail view with attachment access
- **THEN** the system lists attachments whose owner context is that client
- **AND** the list excludes attachments from other firms or other owner records

#### Scenario: Employee details show employee attachments
- **WHEN** an administrator opens an employee detail view
- **THEN** the system lists attachments whose owner context is that employee
- **AND** the list excludes attachments from other firms or other owner records

#### Scenario: Contract details show contract attachments
- **WHEN** a user opens a contract detail view with contract access
- **THEN** the system lists attachments whose owner context is that contract
- **AND** the list excludes attachments from other firms or other owner records

#### Scenario: Attachment section uses shared detail heading treatment
- **WHEN** the attachment area is rendered inside a supported detail drawer
- **THEN** the section title SHALL use the same shared heading treatment used by the surrounding detail sections
- **AND** the attachment area SHALL avoid duplicating a second visual section title inside the same detail section

#### Scenario: Attachment loading preserves drawer layout with skeletons
- **WHEN** attachment data for a supported detail drawer is still loading
- **THEN** the drawer SHALL show skeleton-style attachment placeholders within the attachment section
- **AND** the drawer SHALL preserve the same parent detail context while the attachment list resolves

#### Scenario: Attachment rows show only file name in header
- **WHEN** the attachment section renders an attachment item
- **THEN** the collapsed header SHALL display only the file name
- **AND** attachment type, file size, and creation date SHALL remain outside the collapsed header

#### Scenario: Attachment metadata appears on expand
- **WHEN** a user expands an attachment item
- **THEN** the expanded content SHALL show the attachment type, file size, and creation date
- **AND** the expanded content SHALL preserve the existing attachment actions allowed for that user

#### Scenario: Attachment delete action can remain visible in header
- **WHEN** an administrator views an attachment item in the section
- **THEN** the section MAY render the delete action in the item header actions area
- **AND** the delete action SHALL remain subject to the same administrator-only permission rule

### Requirement: Attachment writes bind to exactly one owner context
The system SHALL persist each attachment with exactly one owner context among client, employee, or contract.

#### Scenario: Valid single owner context
- **WHEN** a user uploads an attachment with exactly one valid owner reference in the authenticated firm
- **THEN** the system persists the attachment metadata linked to that owner

#### Scenario: Missing owner context is rejected
- **WHEN** an upload request does not provide any owner context
- **THEN** the system rejects the request before the attachment metadata is persisted

#### Scenario: Multiple owner contexts are rejected
- **WHEN** an upload request provides more than one owner context
- **THEN** the system rejects the request before the attachment metadata is persisted

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

#### Scenario: Regular user cannot delete attachment
- **WHEN** a regular user attempts to delete an attachment
- **THEN** the server rejects the action before the attachment lifecycle changes

#### Scenario: Administrator can delete attachment
- **WHEN** an administrator confirms deletion for an attachment in the same firm
- **THEN** the system soft-deletes the attachment record
- **AND** the attachment is removed from the default attachment list

### Requirement: Attachment operations preserve tenant isolation
The system SHALL derive attachment tenant scope from the authenticated session rather than from client-submitted authority claims.

#### Scenario: Cross-firm owner reference is rejected
- **WHEN** a user submits an attachment upload for a client, employee, or contract outside the authenticated firm
- **THEN** the system rejects the request before storage metadata is persisted

#### Scenario: Cross-firm attachment list is never returned
- **WHEN** an attachment list query is executed
- **THEN** the system returns only attachments belonging to the authenticated user's firm

### Requirement: Attachment sections preserve the current parent workflow
The system SHALL integrate attachment actions into the existing client, employee, and contract detail flows using drawers and modals rather than standalone CRUD pages.

#### Scenario: Upload opens as an overlay from parent details
- **WHEN** a user starts the attachment upload flow from a supported parent detail context
- **THEN** the system opens the upload interaction as a modal or overlay
- **AND** the parent list and detail context remain preserved

#### Scenario: Delete requires explicit confirmation
- **WHEN** an administrator starts the attachment delete flow
- **THEN** the system requires explicit confirmation before the attachment is deleted

## MODIFIED Requirements

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

## MODIFIED Requirements

### Requirement: List attachments in supported owner contexts
The system SHALL display attachments for a client, employee, contract, or expense inside that entity's detail workflow without leaving the parent context. The attachment area SHALL render as a dedicated section aligned with the surrounding detail drawer sections, and its loading state SHALL use skeleton-style placeholders rather than spinner-only feedback. When attachments exist, the section SHALL render them through a shared accordion-style list so each item keeps a concise header and reveals metadata only when expanded.

#### Scenario: Expense details show expense attachments
- **WHEN** an administrator opens an expense detail view
- **THEN** the system lists attachments whose owner context is that expense
- **AND** the list excludes attachments from other firms or other owner records

### Requirement: Attachment writes bind to exactly one owner context
The system SHALL persist each attachment with exactly one owner context among client, employee, contract, or expense.

#### Scenario: Expense upload uses expense as the only owner context
- **WHEN** an administrator uploads an attachment from an expense detail workflow
- **THEN** the system persists the attachment metadata linked to that expense
- **AND** no second owner context is accepted in the same request

### Requirement: Attachment permissions follow the documented role model
The system SHALL enforce authenticated upload and view permissions and administrator-only delete permissions for attachments.

#### Scenario: Administrator can upload and view attachments for expenses
- **WHEN** an administrator uploads or requests attachment data for an expense in the same firm
- **THEN** the server accepts the request if the expense exists and the file and owner validations pass

#### Scenario: Regular user cannot access expense attachments
- **WHEN** a regular authenticated user requests expense attachment data or attempts an expense attachment upload
- **THEN** the server rejects the request before attachment data is returned or persisted

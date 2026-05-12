## MODIFIED Requirements

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

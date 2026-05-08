## MODIFIED Requirements

### Requirement: View client details
The system SHALL allow authenticated users to inspect client details without leaving the list workflow.

#### Scenario: Open client details drawer
- **WHEN** a user selects the details action for a client row
- **THEN** the system opens a drawer showing the client's core fields and attachment section
- **AND** the list state remains preserved behind the drawer

#### Scenario: Details reflect persisted client data
- **WHEN** a client details drawer is opened
- **THEN** the system shows the persisted client type, full name, document, contact fields, and active status for that client

#### Scenario: Client details include attachment workflow context
- **WHEN** a client details drawer is opened
- **THEN** the drawer SHALL include the attachment section for that client
- **AND** the attachment section SHALL preserve the same detail-drawer section rhythm and skeleton treatment used by the rest of the drawer

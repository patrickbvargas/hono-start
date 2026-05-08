## MODIFIED Requirements

### Requirement: View contract details
The system SHALL allow authenticated users with access to a contract to inspect contract details without leaving the list workflow.

#### Scenario: Open contract details drawer
- **WHEN** a user selects the details action for a visible contract row
- **THEN** the system opens a drawer showing the contract's core fields, team summary, revenue summary, and attachment section
- **AND** the list state remains preserved behind the drawer

#### Scenario: Detail access respects assignment visibility
- **WHEN** a regular user requests details for a contract they are not assigned to
- **THEN** the server rejects the request before contract data is returned

#### Scenario: Contract details and edit hydration use feature-owned detail queries
- **WHEN** the contracts route opens details or edit flows for a contract
- **THEN** the route SHALL pass the contract id through the overlay state
- **AND** the details drawer and edit-default hydration SHALL load persisted contract detail through feature-owned query boundaries rather than list-row snapshots

#### Scenario: Contract details include attachment workflow context
- **WHEN** a contract details drawer is opened
- **THEN** the drawer SHALL include the attachment section for that contract
- **AND** the attachment section SHALL preserve the same detail-drawer section rhythm and skeleton treatment used by the rest of the drawer

## MODIFIED Requirements

### Requirement: Contract option and lookup queries support aggregate workflows
The system SHALL expose option queries needed by the contract form while preserving the repository's business-entity and lookup-query rules, integrating with the unified Person and profile architecture.

#### Scenario: Client options include selectable business entities with document
- **WHEN** the contract form or filter loads client options
- **THEN** the option query returns active ClientProfiles linked to active, non-deleted Person records in the authenticated user's firm
- **AND** the option value is the ClientProfile id
- **AND** the option label displays the person's full name and formatted document (CPF or CNPJ) when present

#### Scenario: Employee options include selectable collaborators with role label
- **WHEN** the contract form or filter loads employee options for team assignment
- **THEN** the option query returns active EmployeeProfiles linked to active, non-deleted Person records in the authenticated user's firm
- **AND** the option value is the EmployeeProfile id
- **AND** the option label displays the person's full name
- **AND** the employee type label is exposed for role badges or descriptions

#### Scenario: Edit form preserves current inactive business entity selections
- **WHEN** a user opens the contract edit form for a record that already references an inactive or otherwise no-longer-selectable client or collaborator
- **THEN** the edit form still shows each persisted current selection
- **AND** each preserved legacy selection is rendered as disabled rather than omitted
- **AND** the create flow continues to offer only selectable active business entities for new choices

#### Scenario: Lookup options bind by stable value
- **WHEN** the contract form or filters load legal area, contract status, assignment type, or revenue type options
- **THEN** the option query returns lookup rows ordered by `label`
- **AND** the fields bind selected values by lookup `value`
- **AND** inactive lookup rows remain visible as disabled options

### Requirement: View contract details
The system SHALL allow authenticated users with access to a contract to inspect contract details without leaving the list workflow, providing direct navigation to underlying Person records.

#### Scenario: Open contract details drawer
- **WHEN** a user selects the details action for a visible contract row
- **THEN** the system opens a drawer showing the contract's core fields, team summary, revenue summary, and attachment section
- **AND** the list state remains preserved behind the drawer

#### Scenario: Detail access respects assignment visibility
- **WHEN** a regular user requests details for a contract they are not assigned to
- **THEN** the server rejects the request before contract data is returned

#### Scenario: Referral-only lawyer cannot open hidden contract details
- **WHEN** a regular authenticated lawyer requests details for a contract where that user participates only as `RECOMMENDING`
- **THEN** the server rejects the request before contract data is returned

#### Scenario: Contract details and edit hydration use feature-owned detail queries
- **WHEN** the contracts route opens details or edit flows for a contract
- **THEN** the route SHALL pass the contract id through the overlay state
- **AND** the details drawer and edit-default hydration SHALL load persisted contract detail through feature-owned query boundaries rather than list-row snapshots

#### Scenario: Contract details include attachment workflow context
- **WHEN** a contract details drawer is opened
- **THEN** the drawer SHALL include the attachment section for that contract
- **AND** the attachment section SHALL preserve the same detail-drawer section rhythm and skeleton treatment used by the rest of the drawer

#### Scenario: Related record links route to Person records
- **WHEN** a user clicks on the client link or collaborator link in contract details or workspace
- **THEN** the link provides the underlying Person id to RelatedRecordLink
- **AND** activating the link opens the Person details overlay or navigates to the person page (`/pessoas/$personId`)


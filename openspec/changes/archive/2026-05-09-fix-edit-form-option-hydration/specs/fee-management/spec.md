## MODIFIED Requirements

### Requirement: Fee route and option queries derive scope from session
The system SHALL derive tenant scope and role-aware fee access from the authenticated session rather than from client-submitted authority claims.

#### Scenario: Authenticated users can access fees route
- **WHEN** an authenticated user navigates to the fees route
- **THEN** the route allows access to the fee-management screen

#### Scenario: Unauthenticated users cannot access fee management
- **WHEN** an unauthenticated actor navigates to the fees route or triggers a fee server function
- **THEN** access is denied before fee data is returned or modified

#### Scenario: Server derives firm scope from session
- **WHEN** any fee list query, detail query, option query, create, update, delete, or restore mutation is executed
- **THEN** the server derives the authoritative `firmId` from the authenticated session
- **AND** any client-supplied tenant scope is ignored

#### Scenario: Revenue options include only selectable parent records
- **WHEN** the fee form loads contract and revenue options
- **THEN** contract options follow the authenticated user's allowed contract boundaries
- **AND** revenue options return only active, non-deleted revenues in the authenticated user's firm whose parent contracts remain writable

#### Scenario: Edit form preserves current inactive parent selections
- **WHEN** a user opens the fee edit form for a record that already references an inactive or otherwise no-longer-selectable contract or revenue
- **THEN** the edit form still shows the persisted contract and revenue selections
- **AND** each preserved legacy selection is rendered as disabled rather than omitted
- **AND** the create flow continues to offer only selectable parent records for new choices

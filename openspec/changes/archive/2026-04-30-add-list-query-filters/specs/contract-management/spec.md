## MODIFIED Requirements

### Requirement: List contracts
The system SHALL display a paginated, sortable, filterable list of contracts available to the authenticated user, following the shared entity-management list contract and the contract visibility rules defined by role and assignment.

#### Scenario: Administrator sees firm-wide contracts
- **WHEN** an administrator navigates to the contracts route
- **THEN** the system displays contracts belonging to the administrator's firm
- **AND** the list includes contracts regardless of whether the administrator is assigned to them

#### Scenario: Regular user sees only assigned contracts
- **WHEN** a regular authenticated user navigates to the contracts route
- **THEN** the system displays only contracts in the same firm where that user is actively assigned

#### Scenario: Contract list columns reflect the aggregate summary
- **WHEN** the contracts list is loaded
- **THEN** the table shows columns for process number, client, legal area, contract status, fee percentage, active state, and created date

#### Scenario: Query by process number or client name
- **WHEN** a user enters a free-text query in the contracts list
- **THEN** the system matches contracts whose process number contains the query text
- **AND** the system also matches contracts whose client name contains the query text
- **AND** the existing firm scope and assignment visibility rules remain enforced

#### Scenario: Filter by client
- **WHEN** a user applies a client filter
- **THEN** the list shows only contracts linked to the selected client in the authenticated user's firm

#### Scenario: Filter by legal area
- **WHEN** a user applies one or more legal-area filters using lookup values
- **THEN** the list shows only contracts whose legal area matches the selected lookup values

#### Scenario: Filter by contract status
- **WHEN** a user applies one or more contract-status filters using lookup values
- **THEN** the list shows only contracts whose current status matches the selected lookup values

#### Scenario: Deleted-state and active-state filters remain independent
- **WHEN** a user changes the deleted-state filter or the active-state filter
- **THEN** the system applies the selected filter independently from the other state filter

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** a user changes sorting, filtering, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same contracts view

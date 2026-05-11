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

#### Scenario: Default desktop contracts view
- **WHEN** an authenticated user navigates to the contracts route on a desktop-width viewport
- **THEN** the system displays a table whose first column shows the internal contract id
- **AND** the table also shows columns for process number, client, legal area, contract status, fee percentage, active state, and created date

#### Scenario: Default mobile contracts view
- **WHEN** an authenticated user navigates to the contracts route on a mobile-width viewport
- **THEN** the system displays a paginated list of contract cards instead of the table
- **AND** each card shows the contract id, process number, client, legal area, contract status, fee percentage, active state, and created date
- **AND** the list uses the same URL-driven pagination state as the desktop table

#### Scenario: Card opens contract details
- **WHEN** a user activates a contract card in the list surface
- **THEN** the system opens the same contract details drawer used by the table actions
- **AND** the current filters, sorting, and pagination state remain preserved behind the drawer

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

#### Scenario: Sort by internal id
- **WHEN** a user clicks the sortable `#` header in the contracts list
- **THEN** the list reloads sorted by contract id in ascending order
- **AND** clicking again toggles to descending order

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** a user changes sorting, filtering, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same contracts view

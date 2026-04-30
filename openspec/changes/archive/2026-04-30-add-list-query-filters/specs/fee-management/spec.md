## MODIFIED Requirements

### Requirement: List fees
The system SHALL display a paginated, sortable, filterable list of fees available to the authenticated user, following the shared entity-management list contract and the fee visibility rules defined by role and allowed contract boundaries.

#### Scenario: Administrator sees firm-wide fees
- **WHEN** an administrator navigates to the fees route
- **THEN** the system displays fees belonging to the administrator's firm
- **AND** the list includes fees regardless of whether the administrator is assigned to the underlying contract

#### Scenario: Regular user sees only fees on allowed contracts
- **WHEN** a regular authenticated user navigates to the fees route
- **THEN** the system displays only fees in the same firm whose parent contracts are visible to that user through assignment-based access

#### Scenario: Fee list columns reflect the financial summary
- **WHEN** the fees list is loaded
- **THEN** the table shows columns for contract, revenue type, payment date, amount, installment number, remuneration-generation state, active state, and created date

#### Scenario: Query by parent contract number
- **WHEN** a user enters a free-text query in the fees list
- **THEN** the system matches fees whose parent contract process number contains the query text
- **AND** the existing firm scope and allowed-contract visibility rules remain enforced

#### Scenario: Filter by parent contract
- **WHEN** a user applies a contract filter
- **THEN** the list shows only fees linked to the selected contract in the authenticated user's scope

#### Scenario: Filter by parent revenue
- **WHEN** a user applies a revenue filter
- **THEN** the list shows only fees linked to the selected revenue in the authenticated user's scope

#### Scenario: Filter by payment date range
- **WHEN** a user applies `dateFrom` and `dateTo` filters
- **THEN** the list shows only fees whose payment date falls inside the selected range

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** a user changes sorting, filtering, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same fees view

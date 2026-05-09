## MODIFIED Requirements

### Requirement: List clients
The system SHALL display a paginated, sortable, filterable list of clients belonging to the authenticated user's firm, following the shared entity-management list contract.

#### Scenario: Default list view
- **WHEN** an authenticated user navigates to the clients route
- **THEN** the system displays a table whose first column shows the internal client id
- **AND** the table also shows columns for client name, document, type, active status, and created date
- **AND** the list is paginated with the default page size

#### Scenario: Filter by name or document
- **WHEN** a user types a value in the client search field
- **THEN** the table shows only clients whose full name or document contains the typed value

#### Scenario: Filter by client type
- **WHEN** a user applies one or more client type filters using lookup values
- **THEN** the table shows only clients whose type matches the selected lookup value set

#### Scenario: Filter by deletion visibility
- **WHEN** a user changes the client list to show deleted records or all records
- **THEN** the table updates soft-delete visibility without changing the current `isActive` filter

#### Scenario: Filter by active state
- **WHEN** a user applies an active or inactive client filter
- **THEN** the table applies the `isActive` constraint independently from the deleted-state filter

#### Scenario: Sort by internal id
- **WHEN** a user clicks the sortable `ID` header in the clients list
- **THEN** the list reloads sorted by client id in ascending order
- **AND** clicking again toggles to descending order

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** a user changes sorting, filters, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same client list view

#### Scenario: Firm isolation
- **WHEN** the client list is loaded
- **THEN** only clients belonging to the authenticated user's firm are returned

## MODIFIED Requirements

### Requirement: List clients
The system SHALL display a paginated, sortable, filterable list of clients belonging to the authenticated user's firm, following the shared entity-management list contract.

#### Scenario: Default desktop list view
- **WHEN** an authenticated user navigates to the clients route on a desktop-width viewport
- **THEN** the system displays a table whose first column shows the internal client id
- **AND** the table also shows columns for client name, document, type, contract count, and active status
- **AND** the list is paginated with the default page size

#### Scenario: Default mobile list view
- **WHEN** an authenticated user navigates to the clients route on a mobile-width viewport
- **THEN** the system displays a paginated list of client cards instead of the table
- **AND** each card shows the client id, name, document, type, contract count, and active status
- **AND** the list uses the same default page size and URL-driven pagination state as the desktop table

#### Scenario: Mobile card opens client details
- **WHEN** a user activates a client card in the mobile list
- **THEN** the system opens the same client details drawer used by the desktop list actions
- **AND** the current filters, sorting, and pagination state remain preserved behind the drawer

#### Scenario: Filter by name or document
- **WHEN** a user types a value in the client search field
- **THEN** the visible client list shows only clients whose full name or document contains the typed value

#### Scenario: Filter by client type
- **WHEN** a user applies one or more client type filters using lookup values
- **THEN** the visible client list shows only clients whose type matches the selected lookup value set

#### Scenario: Filter by deletion visibility
- **WHEN** a user changes the client list to show deleted records or all records
- **THEN** the visible client list updates soft-delete visibility without changing the current `isActive` filter

#### Scenario: Filter by active state
- **WHEN** a user applies an active or inactive client filter
- **THEN** the visible client list applies the `isActive` constraint independently from the deleted-state filter

#### Scenario: Sort by internal id
- **WHEN** a user clicks the sortable `#` header in the desktop clients table
- **THEN** the list reloads sorted by client id in ascending order
- **AND** clicking again toggles to descending order

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** a user changes sorting, filters, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same client list view for the active viewport surface

#### Scenario: Firm isolation
- **WHEN** the client list is loaded
- **THEN** only clients belonging to the authenticated user's firm are returned

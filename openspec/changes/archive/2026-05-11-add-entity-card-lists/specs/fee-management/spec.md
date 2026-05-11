## MODIFIED Requirements

### Requirement: List fees
The system SHALL display a paginated, sortable, filterable list of fees available to the authenticated user, following the shared entity-management list contract and the fee visibility rules defined by role and contract scope.

#### Scenario: Default desktop fees view
- **WHEN** an authenticated user navigates to the fees route on a desktop-width viewport
- **THEN** the system displays a table whose first column shows the internal fee id
- **AND** the table also shows the remaining fee summary columns defined by the route

#### Scenario: Default mobile fees view
- **WHEN** an authenticated user navigates to the fees route on a mobile-width viewport
- **THEN** the system displays a paginated list of fee cards instead of the table
- **AND** each card shows the fee summary fields surfaced by the route list
- **AND** the list uses the same URL-driven pagination state as the desktop table

#### Scenario: Card opens fee details
- **WHEN** a user activates a fee card in the list surface
- **THEN** the system opens the same fee details drawer used by the table actions
- **AND** the current filters, sorting, and pagination state remain preserved behind the drawer

#### Scenario: Query, filters, sort, and pagination remain URL-driven
- **WHEN** a user changes supported fee query, filters, sorting, or page
- **THEN** the URL search params remain authoritative for the active list surface
- **AND** refreshing the page preserves the same fees view

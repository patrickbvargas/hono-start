## MODIFIED Requirements

### Requirement: List remunerations
The system SHALL display a paginated, sortable, filterable list of remunerations available to the authenticated user, following the shared entity-management list contract and the remuneration visibility rules defined by role and employee scope.

#### Scenario: Administrator sees firm-wide remunerations
- **WHEN** an administrator navigates to the remunerations route
- **THEN** the system displays remunerations belonging to the administrator's firm

#### Scenario: Regular user sees only own remunerations
- **WHEN** a regular authenticated user navigates to the remunerations route
- **THEN** the system displays only remunerations in the same firm that belong to that user's employee identity

#### Scenario: Default desktop remunerations view
- **WHEN** an authenticated user navigates to the remunerations route on a desktop-width viewport
- **THEN** the system displays a table whose first column shows the internal remuneration id
- **AND** the table also shows the remaining remuneration summary columns defined by the route

#### Scenario: Default mobile remunerations view
- **WHEN** an authenticated user navigates to the remunerations route on a mobile-width viewport
- **THEN** the system displays a paginated list of remuneration cards instead of the table
- **AND** each card shows the remuneration id plus the same remuneration summary fields surfaced by the route list
- **AND** the list uses the same URL-driven pagination state as the desktop table

#### Scenario: Card opens remuneration details
- **WHEN** a user activates a remuneration card in the list surface
- **THEN** the system opens the same remuneration details drawer used by the table actions
- **AND** the current filters, sorting, and pagination state remain preserved behind the drawer

#### Scenario: Query by parent contract number or collaborator name
- **WHEN** a user enters a free-text query in the remunerations list
- **THEN** the system matches remunerations whose parent contract process number contains the query text
- **AND** the system also matches remunerations whose collaborator name contains the query text
- **AND** the existing firm scope and employee visibility rules remain enforced

#### Scenario: Filter by employee, contract, and payment date
- **WHEN** a user applies supported structured filters such as employee, contract, or payment date range
- **THEN** the system combines those filters with the free-text query deterministically

#### Scenario: Sort by internal id
- **WHEN** a user clicks the sortable `#` header in the remunerations list
- **THEN** the list reloads sorted by remuneration id in ascending order
- **AND** clicking again toggles to descending order

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** a user changes sorting, filtering, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same remunerations view

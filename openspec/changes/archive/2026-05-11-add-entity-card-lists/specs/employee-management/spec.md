## MODIFIED Requirements

### Requirement: List employees
The system SHALL display a paginated, sortable, filterable list of employees belonging to the authenticated administrator's firm, following the shared entity-management list contract.

#### Scenario: Default desktop employees view
- **WHEN** an administrator navigates to the employees route on a desktop-width viewport
- **THEN** the system displays a table whose first column shows the internal employee id
- **AND** the table also shows columns: full name, OAB number, type (Função), remuneration percentage, contract count, role (Perfil), and status
- **AND** the list is paginated with a default page size of 25

#### Scenario: Default mobile employees view
- **WHEN** an administrator navigates to the employees route on a mobile-width viewport
- **THEN** the system displays a paginated list of employee cards instead of the table
- **AND** each card shows the employee id, full name, OAB number, type (Função), remuneration percentage, contract count, role (Perfil), and status
- **AND** the list uses the same URL-driven pagination state as the desktop table

#### Scenario: Card opens employee details
- **WHEN** an administrator activates an employee card in the list surface
- **THEN** the system opens the same employee details drawer used by the table actions
- **AND** the current filters, sorting, and pagination state remain preserved behind the drawer

#### Scenario: Filter by name or OAB number
- **WHEN** a user types a value in the name/OAB search field
- **THEN** the table shows only employees whose full name OR OAB number contains the typed value (case-insensitive)

#### Scenario: Filter by employee type
- **WHEN** a user applies a type filter using one or more employee type lookup values
- **THEN** the table shows only employees whose type matches the selected lookup value set

#### Scenario: Filter by role
- **WHEN** a user applies a role filter using one or more user role lookup values
- **THEN** the table shows only employees whose role matches the selected lookup value set

#### Scenario: Filter by deletion visibility
- **WHEN** a user changes the employee list to show deleted records or all records
- **THEN** the table updates soft-delete visibility without changing the current `isActive` filter

#### Scenario: Sort by column
- **WHEN** a user clicks a sortable column header
- **THEN** the list reloads sorted by that column in ascending order
- **AND** clicking again toggles to descending order

#### Scenario: Sort by internal id
- **WHEN** a user clicks the sortable `#` header in the employees list
- **THEN** the list reloads sorted by employee id in ascending order
- **AND** clicking again toggles to descending order

#### Scenario: Pagination
- **WHEN** a user navigates to page 2
- **THEN** the table shows the next set of employees without reloading the page

#### Scenario: Filter and sort state persisted in URL
- **WHEN** a user applies filters, changes sort, or changes page
- **THEN** the URL search params are updated to reflect the current state
- **AND** lookup-backed filter params use stable lookup values rather than database ids
- **AND** refreshing the page or sharing the URL preserves the same view

#### Scenario: Firm isolation
- **WHEN** the list is loaded
- **THEN** only employees belonging to the authenticated user's firm are returned

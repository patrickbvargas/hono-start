## MODIFIED Requirements

### Requirement: List employees
The system SHALL display a paginated, sortable, filterable list of employees belonging to the authenticated user's firm.

#### Scenario: Default list view
- **WHEN** an authenticated user navigates to the employees route
- **THEN** the system displays a table with columns: full name, OAB number, type (Função), remuneration percentage, contract count, role (Perfil), and status
- **AND** the list is paginated with a default page size of 25

#### Scenario: Filter by name or OAB number
- **WHEN** a user types a value in the name/OAB search field
- **THEN** the table shows only employees whose full name OR OAB number contains the typed value (case-insensitive)

#### Scenario: Filter by employee type
- **WHEN** a user applies a type filter (e.g., Advogado)
- **THEN** the table shows only employees whose type matches the selected value(s)

#### Scenario: Filter by role
- **WHEN** a user applies a role filter (e.g., Administrador)
- **THEN** the table shows only employees whose role matches the selected value(s)

#### Scenario: Filter by status
- **WHEN** a user applies a status filter (Active or Inactive)
- **THEN** the table shows only employees in that status
- **AND** inactive (soft-deleted) employees are hidden by default unless the filter is set to inactive or all

#### Scenario: Sort by column
- **WHEN** a user clicks a sortable column header
- **THEN** the list reloads sorted by that column in ascending order
- **AND** clicking again toggles to descending order

#### Scenario: Pagination
- **WHEN** a user navigates to page 2
- **THEN** the table shows the next set of employees without reloading the page

#### Scenario: Filter and sort state persisted in URL
- **WHEN** a user applies filters, changes sort, or changes page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page or sharing the URL preserves the same view

#### Scenario: Firm isolation
- **WHEN** the list is loaded
- **THEN** only employees belonging to the authenticated user's firm are returned

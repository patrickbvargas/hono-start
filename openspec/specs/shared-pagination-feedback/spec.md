## ADDED Requirements

### Requirement: Shared pagination feedback reflects the visible record range
The system SHALL render a shared pagination summary that reflects the current visible record range for URL-driven paginated lists.

#### Scenario: Summary updates on full pages
- **WHEN** a paginated list has `totalRecords = 100`, `limit = 25`, and the user navigates from page 1 to page 2
- **THEN** the pagination summary SHALL change from `Exibindo 1-25 de 100 registros` to `Exibindo 26-50 de 100 registros`

#### Scenario: Summary updates on the last partial page
- **WHEN** a paginated list has `totalRecords = 63`, `limit = 25`, and the user navigates to page 3
- **THEN** the pagination summary SHALL display `Exibindo 51-63 de 63 registros`

#### Scenario: Summary follows page-size changes
- **WHEN** a user changes the shared pagination page size from 25 to 50 while viewing a paginated list
- **THEN** the pagination summary SHALL recompute the visible range from the current URL-driven pagination state

#### Scenario: Empty lists do not show shared pagination feedback
- **WHEN** a paginated list has `totalRecords = 0`
- **THEN** the shared pagination component SHALL NOT render the pagination summary or controls

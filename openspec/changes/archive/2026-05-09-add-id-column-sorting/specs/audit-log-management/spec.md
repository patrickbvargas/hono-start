## MODIFIED Requirements

### Requirement: List audit logs
The system SHALL display a paginated, sortable, filterable audit-log list for administrators, following the shared entity-management list contract and preserving authenticated firm scope.

#### Scenario: Administrator sees firm audit logs only
- **WHEN** an administrator navigates to the audit-log route
- **THEN** the system displays audit records belonging to the administrator's firm

#### Scenario: Audit-log list exposes internal id first
- **WHEN** the audit-log list is loaded
- **THEN** the table shows the internal audit-record id in the first column
- **AND** the remaining audit columns preserve the current audit summary behavior

#### Scenario: Query by acting user name or record name
- **WHEN** an administrator enters a free-text query in the audit-log list
- **THEN** the system matches audit records whose acting user name contains the query text
- **AND** the system also matches audit records whose record name contains the query text
- **AND** the audit list remains scoped to the authenticated administrator's firm

#### Scenario: Query combines with existing categorical filters
- **WHEN** an administrator applies action, entity-type, or actor filters together with a free-text query
- **THEN** the system returns only records that satisfy both the categorical filters and the text query

#### Scenario: Sort by internal id
- **WHEN** an administrator clicks the sortable `ID` header in the audit-log list
- **THEN** the list reloads sorted by audit-record id in ascending order
- **AND** clicking again toggles to descending order

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** an administrator changes sorting, filtering, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same audit-log view

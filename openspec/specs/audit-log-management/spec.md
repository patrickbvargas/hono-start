## Purpose

Define the audit-log management capability for administrator-scoped audit listing, filtering, and deterministic route state.

## Requirements

### Requirement: List audit logs
The system SHALL display a paginated, sortable, filterable audit-log list for administrators, following the shared entity-management list contract and preserving authenticated firm scope.

#### Scenario: Administrator sees firm audit logs only
- **WHEN** an administrator navigates to the audit-log route
- **THEN** the system displays audit records belonging to the administrator's firm

#### Scenario: Query by acting user name or record name
- **WHEN** an administrator enters a free-text query in the audit-log list
- **THEN** the system matches audit records whose acting user name contains the query text
- **AND** the system also matches audit records whose record name contains the query text
- **AND** the audit list remains scoped to the authenticated administrator's firm

#### Scenario: Query combines with existing categorical filters
- **WHEN** an administrator applies action, entity-type, or actor filters together with a free-text query
- **THEN** the system returns only records that satisfy both the categorical filters and the text query

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** an administrator changes sorting, filtering, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same audit-log view

### Requirement: Audit-log advanced filters indicate active non-default state
The system SHALL visually indicate on the advanced filters trigger when one or more audit-log filters rendered inside the popover differ from the validated default route search state.

#### Scenario: Audit-log popover trigger shows active indicator
- **WHEN** an administrator applies actor, action, entity-type, or date-range filters through the audit-log advanced filters popover
- **THEN** the advanced filters trigger shows an active indicator

#### Scenario: Inline query does not activate popover indicator
- **WHEN** an administrator changes only the inline free-text audit-log query
- **THEN** the advanced filters trigger remains in its default visual state

#### Scenario: Resetting popover filters removes active indicator
- **WHEN** all audit-log filters controlled by the popover return to their validated default values
- **THEN** the advanced filters trigger removes the active indicator

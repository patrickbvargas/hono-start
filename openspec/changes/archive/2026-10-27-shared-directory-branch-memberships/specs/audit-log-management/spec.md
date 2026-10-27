## MODIFIED Requirements

### Requirement: List audit logs
The system SHALL display a paginated, sortable, filterable audit-log list for administrators, following the shared entity-management list contract and preserving local operational scope while including explicitly shared company registration and master-evidence events. All reads SHALL retain the current audit read grant.

#### Scenario: Administrator sees local and shared audit logs
- **WHEN** an administrator navigates to the audit-log route
- **THEN** the system displays local audit records plus explicitly shared registration/settings/evidence events while preserving origin firm metadata

#### Scenario: Query by acting user name or record name
- **WHEN** an administrator enters a free-text query in the audit-log list
- **THEN** the system matches audit records whose acting user name contains the query text
- **AND** the system also matches audit records whose record name contains the query text
- **AND** the audit list remains scoped to local operational events and shared company registration/evidence events

#### Scenario: Query combines with existing categorical filters
- **WHEN** an administrator applies action, entity-type, or actor filters together with a free-text query
- **THEN** the system returns only records that satisfy both the categorical filters and the text query

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** an administrator changes sorting, filtering, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same audit-log view

#### Scenario: Audit log route uses pt-BR URL naming
- **WHEN** an administrator opens the audit log list from the authenticated application shell
- **THEN** the route is available under `/auditoria`
- **AND** the file route remains nested under `/_app`

#### Scenario: Audit log follows shared list and table view contract
- **WHEN** an administrator opens the audit log list
- **THEN** the page provides the same shared view toggle contract used by the other entity management routes
- **AND** the administrator can switch between table and card list presentations without losing current list state

#### Scenario: Shared event detail
- **WHEN** a user opens a shared audit event from another branch
- **THEN** the detail applies the same visibility rule as the list and retains origin branch metadata
- **AND** global employee percentages and configuration are included in shared change payloads, while unrelated operational payloads remain branch scoped

#### Scenario: Administrator sees firm audit logs only
- **WHEN** an administrator navigates to the audit-log route
- **THEN** the system displays current-Firm operational audit records plus shared company registration/settings/evidence events

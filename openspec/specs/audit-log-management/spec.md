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

#### Scenario: Audit log route uses pt-BR URL naming
- **WHEN** an administrator opens the audit log list from the authenticated application shell
- **THEN** the route is available under `/auditoria`
- **AND** the file route remains nested under `/_app`

#### Scenario: Audit log follows shared list and table view contract
- **WHEN** an administrator opens the audit log list
- **THEN** the page provides the same shared view toggle contract used by the other entity management routes
- **AND** the administrator can switch between table and card list presentations without losing current list state

### Requirement: Audit-log advanced filters indicate active non-default state
The system SHALL render the audit-log list filter surface with the shared list-filters pattern so advanced filters remain visually discoverable, responsive, and clearly summarize non-default state.

#### Scenario: Desktop route uses shared advanced filter popovers
- **WHEN** an administrator opens the audit-log route on a desktop-width viewport
- **THEN** the audit-log filter surface renders the inline query field beside shared advanced-filter popovers
- **AND** the popovers expose actor, action, entity-type, and any supported date-range filters

#### Scenario: Mobile route uses shared filter drawer
- **WHEN** an administrator opens the audit-log route on a mobile-width viewport
- **THEN** the audit-log filter surface renders the inline query field beside a shared filter drawer trigger
- **AND** the drawer exposes actor, action, entity-type, and any supported date-range filters

#### Scenario: Non-default audit-log filters appear as removable chips
- **WHEN** an administrator applies actor, action, entity-type, or date-range filters through the audit-log filter surface
- **THEN** each non-default filter is summarized as a removable chip below the filter bar
- **AND** removing a chip reapplies the remaining filter state without mutating unrelated sort fields

#### Scenario: Inline query appears as removable chip
- **WHEN** an administrator enters a non-empty query in the inline audit-log search field
- **THEN** the query appears as a removable chip in the active-filters area
- **AND** removing that chip restores the query field to its validated default value

#### Scenario: Clear action appears only when filters differ from defaults
- **WHEN** one or more audit-log filter fields differ from the validated default route search state
- **THEN** the active-filters area exposes a clear action
- **AND** when every field matches the default route search state the clear action is hidden

### Requirement: Reset audit-log list filters
The system SHALL provide a clear-filters action on the audit-log filter surface that restores all audit-log filter fields to the validated default route search state without changing the current sorting fields.

#### Scenario: Clear action becomes available for non-default audit-log filters
- **WHEN** an administrator changes the inline audit-log query field or any supported advanced audit-log filter away from its validated default value
- **THEN** the audit-log filter surface exposes an enabled `Limpar filtros` action

#### Scenario: Clear action resets audit-log filters and first page
- **WHEN** an administrator activates `Limpar filtros` on the audit-log list
- **THEN** the audit-log query, actor, action, entity-type, and any supported date-range filters return to their validated default values
- **AND** the list reloads from page `1`
- **AND** the current audit-log sorting fields remain unchanged

#### Scenario: Clear action is inactive at default state
- **WHEN** all audit-log filters already match their validated default route values
- **THEN** the `Limpar filtros` action does not trigger a list-state change

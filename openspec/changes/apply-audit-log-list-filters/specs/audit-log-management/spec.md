## MODIFIED Requirements

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

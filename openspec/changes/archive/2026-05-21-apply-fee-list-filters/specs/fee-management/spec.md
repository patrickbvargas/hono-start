## MODIFIED Requirements

### Requirement: Fee advanced filters indicate active non-default state
The system SHALL render the fee list filter surface with the shared list-filters pattern so advanced filters remain visually discoverable, responsive, and clearly summarize non-default state.

#### Scenario: Desktop route uses shared advanced filter surfaces
- **WHEN** an authenticated user opens the fees route on a desktop-width viewport
- **THEN** the fee filter surface renders the inline query field beside shared advanced-filter controls
- **AND** the advanced surface exposes contract, revenue, payment-date, active-state, and deletion-visibility filters

#### Scenario: Mobile route uses shared filter drawer
- **WHEN** an authenticated user opens the fees route on a mobile-width viewport
- **THEN** the fee filter surface renders the inline query field beside a shared filter drawer trigger
- **AND** the drawer exposes contract, revenue, payment-date, active-state, and deletion-visibility filters

#### Scenario: Non-default fee filters appear as removable chips
- **WHEN** a user applies contract, revenue, payment-date, active-state, or deletion-visibility filters through the fee filter surface
- **THEN** each non-default filter is summarized as a removable chip below the filter bar
- **AND** removing a chip reapplies the remaining filter state without mutating unrelated sort fields

#### Scenario: Inline query appears as removable chip
- **WHEN** a user enters a non-empty query in the inline fee search field
- **THEN** the query appears as a removable chip in the active-filters area
- **AND** removing that chip restores the query field to its validated default value

#### Scenario: Clear action appears only when filters differ from defaults
- **WHEN** one or more fee filter fields differ from the validated default route search state
- **THEN** the active-filters area exposes a clear action
- **AND** when every field matches the default route search state the clear action is hidden

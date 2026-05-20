## MODIFIED Requirements

### Requirement: Remuneration advanced filters indicate active non-default state
The system SHALL render the remuneration list filter surface with the shared list-filters pattern so advanced filters remain visually discoverable, responsive, and clearly summarize non-default state for both administrators and regular users.

#### Scenario: Desktop route uses shared advanced filter surfaces
- **WHEN** an authenticated user opens the remunerations route on a desktop-width viewport
- **THEN** the remuneration filter surface renders the inline query field beside shared advanced-filter controls
- **AND** the advanced surface exposes contract and payment-date filters
- **AND** for administrators, the advanced surface also exposes the employee filter

#### Scenario: Mobile route uses shared filter drawer
- **WHEN** an authenticated user opens the remunerations route on a mobile-width viewport
- **THEN** the remuneration filter surface renders the inline query field beside a shared filter drawer trigger
- **AND** the drawer exposes every filter available to that actor, including the administrator-only employee filter when applicable

#### Scenario: Non-default remuneration filters appear as removable chips
- **WHEN** a user applies employee, contract, or payment-date filters through the remuneration filter surface
- **THEN** each non-default filter is summarized as a removable chip below the filter bar
- **AND** removing a chip reapplies the remaining filter state without mutating unrelated sort fields

#### Scenario: Inline query appears as removable chip
- **WHEN** a user enters a non-empty query in the inline remuneration search field
- **THEN** the query appears as a removable chip in the active-filters area
- **AND** removing that chip restores the query field to its validated default value

#### Scenario: Clear action appears only when filters differ from defaults
- **WHEN** one or more remuneration filter fields differ from the validated default route search state
- **THEN** the active-filters area exposes a clear action
- **AND** when every field matches the default route search state the clear action is hidden

## MODIFIED Requirements

### Requirement: Dashboard Filters

The system SHALL provide URL-driven dashboard filters for period, employee scope, contract legal area, and revenue type while preserving Matrix OS permissions. For administrators, the employee filter SHALL stay visible inline in the dashboard header next to the advanced filters trigger, while secondary dashboard filters remain grouped in the popover.

#### Scenario: Current-year shortcut is the default state
- **WHEN** an authenticated user opens the dashboard without overriding `dateFrom` or `dateTo`
- **THEN** the system loads the current-year period by default
- **AND** the active current-year range starts on `01/01` of the current environment year
- **AND** the active current-year range ends on the current environment date instead of `31/12`
- **AND** the `2026` shortcut appears active in the current environment year

#### Scenario: User returns to current year shortcut
- **WHEN** an authenticated user clicks the `2026` shortcut
- **THEN** the system updates `dateFrom` to the first day of the current year
- **AND** the system updates `dateTo` to the current environment date for the current year
- **AND** the dashboard reloads data for that selected period

### Requirement: Dashboard Summaries

The dashboard SHALL show revenue totals, remuneration totals, monthly comparison information, revenue grouping by legal area and revenue type, a monthly financial evolution chart, and a monthly remuneration table by collaborator, with supported summaries reflecting the active dashboard period and employee filters. The main dashboard content SHALL scroll inside a shared scroll container without clipping card borders, and the breakdown legend SHALL present concise participation percentages without redundant phrasing. The dashboard SHALL NOT render the "Visão da firma" badge. The root dashboard component SHALL compose dedicated analytical surface components for metric cards, charts, and remuneration tables instead of concentrating all surface implementations inline.

#### Scenario: Current-year dashboard omits future months
- **WHEN** an authenticated user applies the current-year shortcut during an in-progress calendar year
- **THEN** the dashboard summaries, monthly financial evolution, and monthly remuneration table use only months from January through the current month
- **AND** the system does not append future months from the same year as zero-value buckets

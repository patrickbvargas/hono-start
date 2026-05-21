# dashboard Specification

## Purpose
Dashboard defines the authenticated landing experience and summary data shown to firm users after sign-in.

## Requirements
### Requirement: Authenticated Dashboard Landing
The system SHALL render the dashboard on the authenticated home route instead of demo-only content.

#### Scenario: User opens home route
- **WHEN** an authenticated user opens `/`
- **THEN** the system displays dashboard content and does not display the demo form or fake demo pagination

### Requirement: Dashboard quick create menu
The system SHALL provide a quick-create action in the dashboard header so authenticated users can start supported creation overlays without navigating to the corresponding list routes first.

#### Scenario: Authenticated user opens dashboard quick-create menu
- **WHEN** an authenticated user opens the dashboard header on `/`
- **THEN** the system shows a `Novo` action
- **AND** activating that action opens a dropdown menu with the creation entries allowed for that session

#### Scenario: User creates client from dashboard
- **WHEN** an authenticated user selects `Cliente` from the dashboard quick-create menu
- **THEN** the system opens the existing client create overlay from the dashboard route
- **AND** successful submission closes the overlay and keeps the user on the dashboard

#### Scenario: User creates contract from dashboard
- **WHEN** an authenticated user selects `Contrato` from the dashboard quick-create menu
- **THEN** the system opens the existing contract create overlay from the dashboard route
- **AND** successful submission closes the overlay and keeps the user on the dashboard

#### Scenario: User creates fee from dashboard
- **WHEN** an authenticated user selects `Honorário` from the dashboard quick-create menu
- **THEN** the system opens the existing fee create overlay from the dashboard route
- **AND** successful submission closes the overlay and keeps the user on the dashboard

#### Scenario: Administrator creates collaborator from dashboard
- **WHEN** an administrator selects `Colaborador` from the dashboard quick-create menu
- **THEN** the system opens the existing collaborator create overlay from the dashboard route
- **AND** successful submission closes the overlay and keeps the user on the dashboard

#### Scenario: Regular user opens dashboard quick-create menu
- **WHEN** a regular user opens the dashboard quick-create menu
- **THEN** the menu does not expose the collaborator creation entry
- **AND** the available entries remain limited to behaviors already permitted for that session

#### Scenario: Unsupported direct-create entities stay absent
- **WHEN** an authenticated user opens the dashboard quick-create menu
- **THEN** the menu does not expose direct-create entries for remuneration, attachment, or standalone revenue creation

### Requirement: Dashboard Filters
The system SHALL provide URL-driven dashboard filters for period, employee scope, contract legal area, and revenue type while preserving Matrix OS permissions. For administrators, the employee filter SHALL stay visible inline in the dashboard header next to the period shortcut area, while period shortcuts SHALL remain visible inline exactly as they are today and secondary dashboard filters SHALL move to the shared list-filters advanced surface.

#### Scenario: Administrator filters dashboard by period
- **WHEN** an administrator opens the dashboard with `dateFrom` and/or `dateTo`
- **THEN** the system filters date-sensitive dashboard summaries, recent financial activity, and monthly financial evolution to the selected payment-date period within the administrator's firm

#### Scenario: Dashboard header shows period shortcut buttons
- **WHEN** an authenticated user opens the dashboard header
- **THEN** the system shows period shortcut buttons next to the inline collaborator filter area
- **AND** the available shortcuts are `6 meses`, `12 meses`, and `2026`

#### Scenario: Current-year shortcut is the default state
- **WHEN** an authenticated user opens the dashboard without overriding `dateFrom` or `dateTo`
- **THEN** the system loads the current-year period by default
- **AND** the active current-year range starts on `01/01` of the current environment year
- **AND** the active current-year range ends on the current environment date instead of `31/12`
- **AND** the `2026` shortcut appears active in the current environment year

#### Scenario: User applies last 6 months shortcut
- **WHEN** an authenticated user clicks the `6 meses` shortcut
- **THEN** the system updates the URL-driven dashboard period to the canonical last-6-month range
- **AND** the dashboard reloads data for that selected period

#### Scenario: User applies last 12 months shortcut
- **WHEN** an authenticated user clicks the `12 meses` shortcut
- **THEN** the system updates the URL-driven dashboard period to the canonical last-12-month range
- **AND** the dashboard reloads data for that selected period

#### Scenario: User returns to current year shortcut
- **WHEN** an authenticated user clicks the `2026` shortcut
- **THEN** the system updates `dateFrom` to the first day of the current year
- **AND** the system updates `dateTo` to the current environment date for the current year
- **AND** the dashboard reloads data for that selected period

#### Scenario: Period shortcuts remain inline after filter-surface migration
- **WHEN** the dashboard advanced filters adopt the shared list-filters pattern
- **THEN** the period shortcut buttons remain inline in the dashboard header
- **AND** the shortcuts do not move into popovers or drawers
- **AND** their current click behavior and active-state semantics remain unchanged

#### Scenario: Manual period edit remains available in the advanced filter surface
- **WHEN** an authenticated user opens the dashboard advanced filters surface
- **THEN** the manual `Período de` and `Período até` inputs remain available for free date selection
- **AND** legal-area and revenue-type filters remain available in that same advanced surface

#### Scenario: Manual period edit clears unmatched shortcut state
- **WHEN** an authenticated user changes the dashboard period manually to a range that does not exactly match any shortcut
- **THEN** the system keeps the selected manual dates in the URL
- **AND** the dashboard does not show any shortcut as active

#### Scenario: Administrator employee filter remains inline
- **WHEN** an administrator opens the dashboard header
- **THEN** the collaborator filter remains visible inline outside the advanced filters surface
- **AND** changing only the collaborator filter does not move the control into popovers or drawers

#### Scenario: Administrator filters dashboard by employee
- **WHEN** an administrator selects an active employee from the visible inline dashboard employee filter
- **THEN** the system narrows employee-sensitive dashboard summaries and monthly financial evolution to data associated with that employee inside the administrator's firm

#### Scenario: Authenticated user filters dashboard by one or more legal areas
- **WHEN** an authenticated user selects one or more valid contract legal areas in the dashboard advanced filters
- **THEN** the system limits dashboard revenue-sensitive summaries and monthly financial evolution to matching contracts within the user's allowed firm and role scope

#### Scenario: Authenticated user filters dashboard by one or more revenue types
- **WHEN** an authenticated user selects one or more valid revenue types in the dashboard advanced filters
- **THEN** the system limits dashboard revenue-sensitive summaries and monthly financial evolution to matching revenues within the user's allowed firm and role scope

#### Scenario: Regular user opens dashboard filters
- **WHEN** a regular user opens the dashboard
- **THEN** the system does not allow the user to expand dashboard data beyond their assigned-contract and own-remuneration visibility

#### Scenario: Regular user submits employee search parameter
- **WHEN** a regular user reaches the dashboard with an `employeeId` search parameter for another employee
- **THEN** the system still returns only dashboard data scoped to the authenticated user's allowed visibility

#### Scenario: Shared filtered dashboard URL is restored
- **WHEN** an authenticated user opens a dashboard URL containing valid filter search parameters for period, employee, legal area, or revenue type
- **THEN** the system restores those filters from the URL and loads dashboard data for the validated filter state
- **AND** the matching period shortcut is highlighted only when the restored `dateFrom` and `dateTo` exactly match a supported shortcut range

#### Scenario: Invalid dashboard lookup filters are submitted
- **WHEN** a dashboard request includes unknown or cross-firm filter values for employee, legal area, or revenue type
- **THEN** the system does not expose cross-firm or invalid data outside the authenticated session scope

### Requirement: Role-Scoped Dashboard Data
Dashboard data MUST respect firm isolation, the session role visibility model, and validated dashboard filters.

#### Scenario: Administrator views dashboard
- **WHEN** an administrator opens the dashboard without an employee filter
- **THEN** the system shows firm-wide operational and financial summaries for the administrator's firm

#### Scenario: Administrator views filtered employee dashboard
- **WHEN** an administrator opens the dashboard with an employee filter for an employee in the same firm
- **THEN** the system shows summaries narrowed to that employee while keeping all data inside the administrator's firm

#### Scenario: Regular user views dashboard
- **WHEN** a regular user opens the dashboard
- **THEN** the system shows only summaries from contracts, fees, revenues, and remunerations visible to that user

#### Scenario: Cross-firm employee filter is submitted
- **WHEN** a dashboard request includes an employee filter for an employee outside the authenticated user's firm
- **THEN** the system does not expose cross-firm data

### Requirement: Dashboard Summaries
The dashboard SHALL show revenue totals, remuneration totals, monthly comparison information, revenue grouping by legal area and revenue type, a monthly financial evolution chart, and a monthly remuneration table by collaborator, with supported summaries reflecting the active dashboard period and employee filters. The monthly remuneration table SHALL also expose a subtotal row for the visible monthly buckets, derived from the same filtered and role-scoped remuneration set shown in the table. The main dashboard content SHALL scroll inside a shared scroll container without clipping card borders, and the breakdown legend SHALL present concise participation percentages without redundant phrasing. The dashboard SHALL NOT render the "Visão da firma" badge. The root dashboard component SHALL compose dedicated analytical surface components for metric cards, charts, and remuneration tables instead of concentrating all surface implementations inline.

#### Scenario: Dashboard loads summaries
- **WHEN** dashboard data is available
- **THEN** the system displays high-level totals, current month values, previous month comparisons, legal-area revenue grouping, revenue-type grouping, monthly financial evolution for receitas and remuneracoes, and a monthly remuneration table by collaborator
- **AND** the dashboard does not display the recent activity list

#### Scenario: Dashboard loads filtered summaries
- **WHEN** dashboard filters are active
- **THEN** the system applies the filters consistently to dashboard datasets whose dates, contract areas, revenue types, or employee relationships are relevant to the selected filter

#### Scenario: Dashboard loads filtered remuneration table
- **WHEN** dashboard filters are active
- **THEN** the system applies the filters consistently to the monthly remuneration table wherever dates or employee relationships are relevant to the selected filter

#### Scenario: Dashboard chart spans monthly buckets
- **WHEN** dashboard data is loaded for a period spanning multiple months
- **THEN** the system groups the financial evolution chart by ano e mes
- **AND** the chart exposes separate monthly values for receitas and remuneracoes

#### Scenario: Dashboard remuneration table spans monthly buckets
- **WHEN** dashboard data is loaded for a period spanning multiple months
- **THEN** the system groups remuneration values by collaborator and by ano e mes
- **AND** the table exposes one row per collaborator and one column per month in the selected range
- **AND** each month column label uses the short `Mes/aa` format, such as `Jan/26`

#### Scenario: Filtered period contains months without movement
- **WHEN** the selected dashboard period includes one or more months without matching receitas or remuneracoes
- **THEN** the system keeps those months in the financial evolution series with zero values

#### Scenario: Filtered period contains months without collaborator movement
- **WHEN** the selected dashboard period includes one or more months without matching remunerations for a collaborator already present in the result
- **THEN** the system keeps those month columns in the table
- **AND** the collaborator row shows zero values for those months

#### Scenario: Dashboard remuneration table includes period total
- **WHEN** the monthly remuneration table is displayed
- **THEN** the system shows a total-in-period value for each collaborator based on the visible monthly buckets

#### Scenario: Dashboard remuneration table includes monthly subtotals
- **WHEN** the monthly remuneration table is displayed with one or more visible collaborator rows
- **THEN** the system shows one subtotal value for each visible month column
- **AND** each subtotal equals the sum of that month's visible collaborator values after role and filter scoping
- **AND** the subtotal row also shows a total-in-period equal to the sum of the visible monthly subtotals

#### Scenario: Breakdown charts preserve values
- **WHEN** the dashboard renders legal-area or revenue-type breakdowns
- **THEN** each visualization reflects the same formatted totals and participation percentages returned by the active dashboard summary payload
- **AND** the supporting legend shows each participation value as a concise percentage label

#### Scenario: Dashboard analytical surfaces use shared card wrapper
- **WHEN** the dashboard renders metric cards, charts, or the monthly remuneration table
- **THEN** each analytical surface uses the shared shadcn/ui `Card` component as its outer visual wrapper

#### Scenario: Dashboard analytical surfaces stay componentized
- **WHEN** the dashboard renders metric cards, charts, and the monthly remuneration table
- **THEN** the root dashboard component composes dedicated child components for those analytical surfaces
- **AND** metric-card rendering details remain inside the metric-cards component

#### Scenario: Dashboard scroll stays inside content region
- **WHEN** dashboard content exceeds the available wrapper body height
- **THEN** the dashboard scrolls within a shared scroll container inside the wrapper body
- **AND** chart and card borders remain fully visible while scrolling

#### Scenario: Regular user opens dashboard
- **WHEN** a regular user opens the dashboard
- **THEN** the monthly remuneration table shows only the authenticated user's own scoped remuneration data
- **AND** the subtotal row reflects only that same scoped data

#### Scenario: No business records match filters
- **WHEN** the dashboard has no matching business records for the active filters
- **THEN** the system displays zero-value summaries, zeroed chart buckets, and empty-state copy in pt-BR

#### Scenario: No remuneration records match filters
- **WHEN** the dashboard has no matching remuneration records for the active filters
- **THEN** the system displays zero-value summaries as applicable
- **AND** the monthly remuneration table shows an empty-state message in pt-BR
- **AND** the system does not render a subtotal row without visible collaborator rows

#### Scenario: No breakdown values exist
- **WHEN** the dashboard summary contains no received revenue for legal-area and revenue-type breakdowns
- **THEN** the system shows pt-BR empty-state copy in both breakdown cards instead of rendering misleading chart segments or bars

#### Scenario: No business records exist
- **WHEN** the dashboard has no matching business records
- **THEN** the system displays zero-value summaries, zeroed chart buckets, and empty-state copy in pt-BR

#### Scenario: Current-year dashboard omits future months
- **WHEN** an authenticated user applies the current-year shortcut during an in-progress calendar year
- **THEN** the dashboard summaries, monthly financial evolution, and monthly remuneration table use only months from January through the current month
- **AND** the system does not append future months from the same year as zero-value buckets

### Requirement: Dashboard pending skeleton
The system SHALL render a dedicated structural skeleton while the authenticated dashboard route is pending before summary data finishes loading.

#### Scenario: User opens dashboard during initial loader pending
- **WHEN** an authenticated user opens `/` and the dashboard loader is still pending
- **THEN** the system renders a dashboard-specific skeleton instead of a standalone spinner
- **AND** the skeleton preserves the visible page structure of dashboard header, metric cards, financial evolution surface, remuneration table, and breakdown surfaces

#### Scenario: Dashboard skeleton mirrors analytical wrappers
- **WHEN** the dashboard pending skeleton is visible
- **THEN** each analytical placeholder uses the same outer `Card` visual wrapper pattern as the loaded dashboard surfaces
- **AND** the main dashboard pending content stays inside the shared wrapper body with internal scroll behavior preserved

#### Scenario: Dashboard skeleton avoids visual jump on hydration
- **WHEN** the dashboard loader resolves and replaces the pending skeleton with loaded content
- **THEN** the visible block order, spacing rhythm, and responsive grouping stay aligned with the loaded dashboard layout
- **AND** the transition does not introduce placeholder borders or decorative shapes absent from the final UI

#### Scenario: Dashboard pending skeleton stays role-agnostic
- **WHEN** administrators and regular users load the dashboard
- **THEN** both roles see the same structural dashboard skeleton during initial pending
- **AND** role-scoped data differences only appear after the real dashboard data resolves

### Requirement: Dashboard advanced filters indicate active non-default state
The system SHALL use the shared list-filters active-filters pattern for dashboard advanced filters while preserving the documented distinction between inline controls and advanced filters.

#### Scenario: Advanced dashboard filters appear as removable chips
- **WHEN** an authenticated user applies a manual period, legal-area, or revenue-type filter through the dashboard advanced filters surface
- **THEN** each non-default advanced filter is summarized as a removable chip below the filter bar

#### Scenario: Inline controls do not become active chips by default
- **WHEN** the authenticated user changes only inline dashboard controls outside the advanced filters surface, such as employee scope or period shortcut buttons
- **THEN** the dashboard does not summarize those inline controls as advanced-filter chips unless a popover- or drawer-controlled filter is also non-default

#### Scenario: Clearing advanced dashboard chips does not alter period shortcuts
- **WHEN** a user removes advanced dashboard filter chips or clears the advanced filter surface
- **THEN** only manual advanced-filter values return to their validated default state
- **AND** the inline shortcut controls remain available in their current position and behavior model

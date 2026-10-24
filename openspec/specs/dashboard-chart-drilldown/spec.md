# dashboard-chart-drilldown Specification

## Purpose
TBD - created by archiving change add-dashboard-chart-drilldown. Update Purpose after archive.
## Requirements
### Requirement: Inspect dashboard metric cards
The system SHALL reuse the standalone detail modal when an authorized user activates a financial metric card. The selection SHALL identify its financial source explicitly and use the card's complete effective period and filters.

#### Scenario: Select received revenue, remuneration or expenses
- **WHEN** a user activates one of these cards
- **THEN** the modal shows all contributing receipts, generated remunerations or expenses respectively
- **AND** the full-result total matches the card calculation

#### Scenario: Select planned revenue
- **WHEN** a user activates planned revenue
- **THEN** the modal includes initial down payments and full scheduled installment amounts within the effective period
- **AND** paid installments remain included without duplicating their fee receipts
- **AND** the calculation does not substitute outstanding forecast amounts

#### Scenario: Select period Result
- **WHEN** a user activates the Result card
- **THEN** the modal shows signed receipt, remuneration and expense contributions for the entire effective period
- **AND** the consolidated-result permission and allocation-filter restrictions apply

#### Scenario: Expense-only card access
- **WHEN** a user with only expense financial access activates the expense card
- **THEN** expense details are available without requiring revenue or remuneration grants
- **AND** direct requests for other financial card sources are denied before querying forbidden records

#### Scenario: Card keyboard and tooltip use
- **WHEN** a user activates a card with mouse, Enter or Space
- **THEN** the corresponding details open and closing restores focus to the card trigger
- **AND** activating its help or comparison tooltip does not open details

### Requirement: Inspect every dashboard bar and monthly Result
The system SHALL open a read-only record-details modal when a user activates any rendered dashboard bar or a monthly Result point. Activation SHALL identify the exact series and group/month without changing dashboard filters or navigating away.

#### Scenario: Select a financial evolution series
- **WHEN** a user activates the remuneration bar for a specific month
- **THEN** the modal displays only generated remunerations contributing to that series and month
- **AND** the modal identifies the month and series in pt-BR

#### Scenario: Select each breakdown
- **WHEN** a user activates revenue by area, revenue by type, remuneration by function, future receipts, overdue debt, revenue by client or expenses by category
- **THEN** the modal displays the contributing records for that selected group
- **AND** other groups and unauthorized subjects are excluded

#### Scenario: Select monthly balance or Result
- **WHEN** a user activates a monthly balance bar or a monthly Result point
- **THEN** the modal shows receipt, remuneration and expense contributions for that month
- **AND** receipts are positive and remuneration/expenses are deductions
- **AND** the modal summary shows only the signed Total without representing bank balance or remuneration settlement

### Requirement: Reconcile records with chart calculations
The system SHALL use the same effective scope, lifecycle rules, periods and reference date as the selected chart. Its total SHALL cover every matching row across all pages, with monetary precision preserved.

#### Scenario: Inspect received revenue
- **WHEN** a selected receipt bar contains initial down payments and fees
- **THEN** both contribution types appear exactly once with their full received amounts
- **AND** their total matches the unrounded aggregate used by the bar

#### Scenario: Inspect a partial boundary month
- **WHEN** the selected month lies at a dashboard period boundary
- **THEN** detail rows follow the chart's actual effective month boundaries
- **AND** the modal does not silently substitute the KPI date rules

#### Scenario: Inspect debt or forecast
- **WHEN** a user activates an aging or forecast bucket
- **THEN** rows show only installments with positive outstanding balance in that bucket at the chart's reference date
- **AND** payments after that date do not reduce the historical outstanding amount
- **AND** partial payments, bucket boundaries and debt predating dateFrom follow the chart rules
- **AND** the total is the sum of outstanding balances

#### Scenario: Inspect a zero or negative net balance
- **WHEN** the selected monthly net balance is zero or negative
- **THEN** contributing rows remain available and their signed total equals the net balance
- **AND** zero net does not imply an empty table

#### Scenario: Records changed after chart load
- **WHEN** current contributing records no longer reconcile with the loaded chart due to an intervening data change
- **THEN** the affected chart and details are refreshed with a concise update notice
- **AND** the UI does not silently compare current rows with the old displayed bar

### Requirement: Enforce financial detail access at the server
Every detail request SHALL require current dashboard access and the applicable financial-subject grant, derive business scope from the verified session and enforce the same eligibility as the chart. Client parameters SHALL NOT widen tenant, ownership, assignment or consolidated-result access.

#### Scenario: Expense-only user requests revenue
- **WHEN** a user with only expense financial access submits a revenue detail request directly
- **THEN** the server denies the request without returning revenue rows, totals or counts
- **AND** forbidden financial records are not queried

#### Scenario: Own or assigned access
- **WHEN** a scoped user submits another collaborator's ID or an unrelated entity selector
- **THEN** the request cannot return records outside the verified own/assigned scope
- **AND** an absent Employee binding never grants broader access

#### Scenario: Cross-firm or invalid selection
- **WHEN** a request references another firm's client or an unsupported chart/series/group combination
- **THEN** it is rejected without revealing restricted record existence

#### Scenario: Consolidated result restriction
- **WHEN** a user lacks any grant required for consolidated balance/Result or uses an unsupported allocation filter
- **THEN** balance and Result details are denied even if the endpoint is called directly

#### Scenario: Permission revoked while modal is open
- **WHEN** a financial grant is revoked before the next source request
- **THEN** the next request rechecks current grants and denies restricted details
- **AND** restricted rows are cleared from the modal

### Requirement: Use stable financial group identities
The system SHALL identify selected entities and categories by stable keys rather than display names. Distinct clients with identical names SHALL remain separate in both chart aggregates and detail selection.

#### Scenario: Clients share the same name
- **WHEN** two authorized clients have identical display names
- **THEN** each client's bar and detail selection uses its own identity
- **AND** selecting one never includes the other's receipts

### Requirement: Accessible lazy-loaded detail modal
The system SHALL load details on demand, provide keyboard-equivalent activation, preserve dashboard context and display explicit loading, empty and safe error states. The table SHALL be paginated with deterministic ordering and full monetary values.

#### Scenario: Initial dashboard load
- **WHEN** a user opens the dashboard without selecting a chart value
- **THEN** detail rows are not fetched or included in the initial summary payload

#### Scenario: Pagination
- **WHEN** a selection has multiple pages
- **THEN** pages contain a stable ordering with a unique tie breaker
- **AND** total count and monetary total cover all matching rows rather than the visible page

#### Scenario: Keyboard use and closing
- **WHEN** a keyboard user activates an accessible chart value and later closes the modal
- **THEN** the same corresponding detail view opens
- **AND** closing restores focus and preserves dashboard filters and scroll position

#### Scenario: Selection changes during a pending request
- **WHEN** a user selects another value while a previous detail request is pending
- **THEN** pagination resets and previous rows are cleared
- **AND** the old response cannot replace the new selection's contents

#### Scenario: Dashboard filters change
- **WHEN** dashboard filters change while details are open
- **THEN** the modal closes and pending obsolete responses cannot reopen it or display old rows

#### Scenario: Empty selection or failed request
- **WHEN** no contributing rows exist or the detail request fails
- **THEN** the modal shows the appropriate pt-BR empty or safe error state with retry where applicable
- **AND** records from a previous selection are not displayed


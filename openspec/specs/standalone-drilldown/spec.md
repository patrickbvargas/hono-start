# standalone-drilldown Specification

## Purpose
TBD - created by archiving change add-dashboard-chart-drilldown. Update Purpose after archive.
## Requirements
### Requirement: Independent props-configured drilldown
The system SHALL provide an isolated drilldown feature with a public API configured through typed props for open state, presentation, context, filters, columns, row identity, validated query response and optional summaries. It SHALL NOT depend on dashboard-specific chart types, entities or financial semantics.

#### Scenario: New chart consumer
- **WHEN** a consumer adds a new chart and supplies its selection, context, filters, columns and authorized query options
- **THEN** activating the chart opens the configured drilldown
- **AND** no core drilldown modification or central chart registration is required

#### Scenario: Registration-page card consumer
- **WHEN** a card on a registration page opens the drilldown with a non-financial row schema and its own query factory
- **THEN** the same modal displays its configured table
- **AND** financial totals, month selectors and dashboard permissions are not required by the standalone feature

### Requirement: Consumer-owned data and authorization
Consumers SHALL own domain queries, schemas, selectors, permissions and cache identity. The drilldown SHALL execute lazily using supplied query options and SHALL NOT grant access from props or interpret arbitrary database instructions.

#### Scenario: Restricted data source
- **WHEN** consumer filters request unauthorized records
- **THEN** the source server operation denies access under its own verified session rules
- **AND** passing display configuration never grants additional authority

#### Scenario: Different source and context
- **WHEN** a consumer changes the query context or filter selection
- **THEN** the drilldown resets its local pagination and clears obsolete records
- **AND** an old request cannot populate the new selection

### Requirement: Reusable declarative columns
The drilldown SHALL accept compatible declarative table columns supplied by the consumer. Entity-specific columns SHALL remain owned by their entity feature and may be reused through its public API without importing entity internals into the drilldown.

#### Scenario: Reuse existing listing columns
- **WHEN** a consumer supplies compatible read-only columns also used by its listing
- **THEN** the modal preserves column labels and formatting
- **AND** it does not require embedding the listing screen, lifecycle action controls or unrelated domain fields

#### Scenario: Different record grain
- **WHEN** drilldown rows differ from a listing's schema
- **THEN** the consumer supplies appropriate columns for that row schema
- **AND** the core does not impose an entity-specific or universal financial row model

### Requirement: Isolated table state
The drilldown SHALL delegate frontend pagination to the existing shared DataTable through pageSize. It SHALL NOT own a separate paginator or page state. Source queries SHALL return the complete authorized selected dataset on demand. Pagination and supported sorting SHALL remain independent of source-page route search state.

#### Scenario: Paginate from a registration page
- **WHEN** a user changes page or supported sort inside a card's drilldown
- **THEN** the existing DataTable changes its displayed page without issuing a new request
- **AND** the source listing URL, filters, sort and pagination remain unchanged

#### Scenario: Optional summaries
- **WHEN** a consumer supplies no monetary summary
- **THEN** the table remains usable with its record count and pagination
- **AND** the standalone modal does not calculate or assume a financial total


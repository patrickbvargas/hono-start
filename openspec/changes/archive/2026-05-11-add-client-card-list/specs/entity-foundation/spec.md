## ADDED Requirements

### Requirement: Shared entity card lists remain independent from shared entity tables
The system SHALL provide card-based entity list surfaces through shared components that do not depend on `TanStack Table` columns or table internals.

#### Scenario: Shared card list uses an explicit card contract
- **WHEN** contributors implement a shared entity card-list surface
- **THEN** the surface SHALL accept explicit card-rendering inputs such as title, field items, and actions
- **AND** it SHALL NOT require `ColumnDef`, table headers, or row models from `TanStack Table`

#### Scenario: Shared card list preserves list footer composition
- **WHEN** a feature composes a shared card-list surface for a paginated entity route
- **THEN** the shared card list SHALL allow the same shared pagination footer composition used by `DataTable`
- **AND** the route's URL-driven pagination state SHALL remain authoritative

### Requirement: Shared entity fields are reusable across detail and list surfaces
The system SHALL expose one shared field-pair presentation contract that can be reused by entity detail drawers and entity card lists without duplicating layout logic.

#### Scenario: Shared detail drawer uses extracted entity fields
- **WHEN** a detail drawer renders labeled entity data
- **THEN** it SHALL consume the shared entity-fields contract rather than a private drawer-only implementation

#### Scenario: Shared card list uses the same entity fields contract
- **WHEN** a card-based entity list renders labeled entity data
- **THEN** it SHALL consume the same shared entity-fields contract used by detail drawers
- **AND** labels and values SHALL keep a consistent visual rhythm between list and detail surfaces

## ADDED Requirements

### Requirement: Entity-management screens follow a shared list contract
The system SHALL treat entity-management list screens as a shared interaction pattern so future entities can reuse the same behavioral contract established by the employees feature.

#### Scenario: Canonical list state lives in the URL
- **WHEN** a user interacts with an entity-management list screen
- **THEN** the active search, filter, sort, and pagination state SHALL be represented in the URL
- **AND** reloading or sharing the URL SHALL preserve the same list view

#### Scenario: Canonical list state resets pagination on filter changes
- **WHEN** a user changes search text or filter values on an entity-management list screen
- **THEN** the list reloads using the new criteria
- **AND** the current page resets to the first page

#### Scenario: Canonical list state supports deterministic sorting
- **WHEN** an entity-management list screen applies server-side sorting
- **THEN** the result ordering SHALL be deterministic for pagination
- **AND** repeated requests with the same search state SHALL return rows in the same order

### Requirement: Entity-management filters separate active state from deletion visibility
The system SHALL model `isActive` filtering and soft-delete visibility as separate list concerns for entity-management screens that support both states.

#### Scenario: Active-state filter does not imply deleted-state changes
- **WHEN** a user filters an entity-management list by active or inactive records
- **THEN** the list applies that `isActive` constraint
- **AND** the deleted-state visibility remains controlled independently

#### Scenario: Deleted-state filter does not imply active-state changes
- **WHEN** a user changes an entity-management list from non-deleted records to deleted or all records
- **THEN** the list changes soft-delete visibility accordingly
- **AND** any active-state filter continues to apply independently

### Requirement: Entity form option queries return only selectable options
The system SHALL use a shared selectable-options rule for data returned to dropdowns, selects, autocompletes, and other entity form pickers.

#### Scenario: Lookup-table option query returns only active rows
- **WHEN** a form option query loads lookup-table records
- **THEN** only rows with `isActive = true` are returned

#### Scenario: Business-entity option query returns only active non-deleted rows
- **WHEN** a form option query loads business-entity records
- **THEN** only rows with `deletedAt = null` and `isActive = true` are returned

#### Scenario: Historical references remain valid outside generic option queries
- **WHEN** an existing record references an inactive or soft-deleted related row
- **THEN** the persisted reference remains valid for display or edit context
- **AND** the generic option query still excludes that row from new selections

### Requirement: Reference entity slice defines the baseline structure for new entities
The system SHALL use one stabilized entity slice as the reference implementation before new business entities are introduced.

#### Scenario: Employees serves as the reference slice
- **WHEN** the application prepares to implement the next entity-management feature
- **THEN** the employees slice SHALL be treated as the baseline example for route structure, feature boundaries, list behavior, option-query behavior, and protected mutation flows

#### Scenario: New entities inherit the same management workflow shape
- **WHEN** a new entity-management feature is proposed after this change
- **THEN** its route and feature structure SHALL follow the same high-level workflow shape established by the reference slice
- **AND** deviations SHALL be justified by entity-specific behavior rather than ad hoc implementation preference

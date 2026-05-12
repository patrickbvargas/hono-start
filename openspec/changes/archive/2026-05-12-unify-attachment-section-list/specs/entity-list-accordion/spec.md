## ADDED Requirements

### Requirement: Shared entity list accordion supports header actions
The system SHALL provide a shared accordion wrapper for compact entity lists that renders a per-item header, expandable content, and optional header actions controlled by the consumer.

#### Scenario: Consumer renders header actions
- **WHEN** a consumer passes header actions for an accordion item
- **THEN** the shared wrapper renders those actions at the end of the item header
- **AND** the consumer remains responsible for choosing which actions appear for that item

#### Scenario: Consumer omits header actions
- **WHEN** a consumer does not pass header actions for an accordion item
- **THEN** the shared wrapper renders the item header without an actions area

### Requirement: Shared entity list accordion preserves summary and expanded content separation
The system SHALL allow a consumer to keep the header label concise while rendering additional metadata only inside the expanded content area.

#### Scenario: Header remains concise
- **WHEN** a consumer configures an item header with a concise label
- **THEN** the header shows that label without forcing additional metadata into the collapsed state

#### Scenario: Expanded content renders item details
- **WHEN** a user opens an accordion item
- **THEN** the shared wrapper renders the consumer-provided detailed content for that item inside the expanded area

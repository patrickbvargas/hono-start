## MODIFIED Requirements

### Requirement: Contract option and lookup queries support aggregate workflows
The system SHALL expose option queries needed by the contract form while preserving the repository's business-entity and lookup-query rules.

#### Scenario: Client options include selectable business entities only
- **WHEN** the contract form loads client options
- **THEN** the option query returns only clients in the authenticated user's firm where `deletedAt = null` and `isActive = true`

#### Scenario: Employee options include selectable collaborators only
- **WHEN** the contract form loads employee options for team assignment
- **THEN** the option query returns only employees in the authenticated user's firm where `deletedAt = null` and `isActive = true`

#### Scenario: Edit form preserves current inactive business entity selections
- **WHEN** a user opens the contract edit form for a record that already references an inactive or otherwise no-longer-selectable client or collaborator
- **THEN** the edit form still shows each persisted current selection
- **AND** each preserved legacy selection is rendered as disabled rather than omitted
- **AND** the create flow continues to offer only selectable active business entities for new choices

#### Scenario: Lookup options bind by stable value
- **WHEN** the contract form or filters load legal area, contract status, assignment type, or revenue type options
- **THEN** the option query returns lookup rows ordered by `label`
- **AND** the fields bind selected values by lookup `value`
- **AND** inactive lookup rows remain visible as disabled options

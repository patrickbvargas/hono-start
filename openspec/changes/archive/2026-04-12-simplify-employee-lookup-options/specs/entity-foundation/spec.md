## MODIFIED Requirements

### Requirement: Entity form option queries return selectable state with complete context
The system SHALL use a shared option-loading rule for data returned to dropdowns, selects, autocompletes, and other entity form pickers. Lookup-table option queries SHALL return all rows and mark inactive rows as non-selectable in the form control. Business-entity option queries SHALL continue to return only active non-deleted rows.

#### Scenario: Lookup-table option query returns all rows with inactive items disabled
- **WHEN** a form option query loads lookup-table records
- **THEN** rows with `isActive = true` and `isActive = false` are both returned
- **AND** inactive rows are rendered as disabled options in the form UI

#### Scenario: Business-entity option query returns only active non-deleted rows
- **WHEN** a form option query loads business-entity records
- **THEN** only rows with `deletedAt = null` and `isActive = true` are returned

#### Scenario: Historical references render without feature-local merge helpers
- **WHEN** an existing record references an inactive related lookup row
- **THEN** the persisted reference remains available in the form option dataset
- **AND** the feature does not need to inject a synthetic option in the UI layer

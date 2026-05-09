## ADDED Requirements

### Requirement: Contract advanced filters indicate active non-default state
The system SHALL visually indicate on the advanced filters trigger when one or more contract filters rendered inside the popover differ from the validated default route search state.

#### Scenario: Contract popover trigger shows active indicator
- **WHEN** a user applies client, legal-area, contract-status, active-state, or deletion-visibility filters through the advanced filters popover
- **THEN** the advanced filters trigger shows an active indicator

#### Scenario: Inline query does not activate popover indicator
- **WHEN** a user changes only the inline contract query field
- **THEN** the advanced filters trigger remains in its default visual state

#### Scenario: Clearing contract popover filters removes active indicator
- **WHEN** all contract filters controlled by the popover return to their validated default values
- **THEN** the advanced filters trigger removes the active indicator

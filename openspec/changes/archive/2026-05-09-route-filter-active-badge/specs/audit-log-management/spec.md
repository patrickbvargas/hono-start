## ADDED Requirements

### Requirement: Audit-log advanced filters indicate active non-default state
The system SHALL visually indicate on the advanced filters trigger when one or more audit-log filters rendered inside the popover differ from the validated default route search state.

#### Scenario: Audit-log popover trigger shows active indicator
- **WHEN** an administrator applies actor, action, entity-type, or date-range filters through the audit-log advanced filters popover
- **THEN** the advanced filters trigger shows an active indicator

#### Scenario: Inline query does not activate popover indicator
- **WHEN** an administrator changes only the inline free-text audit-log query
- **THEN** the advanced filters trigger remains in its default visual state

#### Scenario: Resetting popover filters removes active indicator
- **WHEN** all audit-log filters controlled by the popover return to their validated default values
- **THEN** the advanced filters trigger removes the active indicator

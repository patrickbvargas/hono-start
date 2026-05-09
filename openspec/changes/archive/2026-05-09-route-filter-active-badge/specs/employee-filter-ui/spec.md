## ADDED Requirements

### Requirement: Employee advanced filters indicate active non-default state
The system SHALL visually indicate on the advanced filters trigger when one or more employee filters rendered inside the popover differ from the validated default route search state.

#### Scenario: Employee popover trigger shows active indicator
- **WHEN** an administrator applies type, role, active-state, or deletion-visibility filters through the employee advanced filters popover
- **THEN** the advanced filters trigger shows an active indicator

#### Scenario: Inline search does not activate popover indicator
- **WHEN** an administrator changes only the inline employee search field
- **THEN** the advanced filters trigger remains in its default visual state

#### Scenario: Clearing employee popover filters removes active indicator
- **WHEN** all employee filters controlled by the popover return to their validated default values
- **THEN** the advanced filters trigger removes the active indicator

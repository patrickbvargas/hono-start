## ADDED Requirements

### Requirement: Reset client list filters
The system SHALL provide a clear-filters action on the client list filter surface that restores all client filter fields to the validated default route search state without changing the current sorting fields.

#### Scenario: Clear action becomes available for non-default client filters
- **WHEN** a user changes the inline client search field or any advanced client filter away from its validated default value
- **THEN** the client filter surface exposes an enabled `Limpar filtros` action

#### Scenario: Clear action resets client filters and first page
- **WHEN** a user activates `Limpar filtros` on the client list
- **THEN** the client query, type, active-state, and deletion-visibility filters return to their validated default values
- **AND** the list reloads from page `1`
- **AND** the current client sorting fields remain unchanged

#### Scenario: Clear action is inactive at default state
- **WHEN** all client filters already match their validated default route values
- **THEN** the `Limpar filtros` action does not trigger a list-state change

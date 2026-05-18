## ADDED Requirements

### Requirement: Reset contract list filters
The system SHALL provide a clear-filters action on the contracts list filter surface that restores all contract filter fields to the validated default route search state without changing the current sorting fields.

#### Scenario: Clear action becomes available for non-default contract filters
- **WHEN** a user changes the inline contract query field or any advanced contract filter away from its validated default value
- **THEN** the contracts filter surface exposes an enabled `Limpar filtros` action

#### Scenario: Clear action resets contract filters and first page
- **WHEN** a user activates `Limpar filtros` on the contracts list
- **THEN** the contract query, client, legal-area, contract-status, active-state, and deletion-visibility filters return to their validated default values
- **AND** the list reloads from page `1`
- **AND** the current contract sorting fields remain unchanged

#### Scenario: Clear action is inactive at default state
- **WHEN** all contract filters already match their validated default route values
- **THEN** the `Limpar filtros` action does not trigger a list-state change

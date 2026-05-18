## ADDED Requirements

### Requirement: Reset fee list filters
The system SHALL provide a clear-filters action on the fees list filter surface that restores all fee filter fields to the validated default route search state without changing the current sorting fields.

#### Scenario: Clear action becomes available for non-default fee filters
- **WHEN** a user changes the inline fee query field or any advanced fee filter away from its validated default value
- **THEN** the fees filter surface exposes an enabled `Limpar filtros` action

#### Scenario: Clear action resets fee filters and first page
- **WHEN** a user activates `Limpar filtros` on the fees list
- **THEN** the fee query, contract, revenue, payment-date, active-state, and deletion-visibility filters return to their validated default values
- **AND** the list reloads from page `1`
- **AND** the current fee sorting fields remain unchanged

#### Scenario: Clear action is inactive at default state
- **WHEN** all fee filters already match their validated default route values
- **THEN** the `Limpar filtros` action does not trigger a list-state change

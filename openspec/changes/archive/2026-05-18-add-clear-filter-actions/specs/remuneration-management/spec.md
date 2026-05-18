## ADDED Requirements

### Requirement: Reset remuneration list filters
The system SHALL provide a clear-filters action on the remunerations list filter surface that restores all remuneration filter fields to the validated default route search state without changing the current sorting fields.

#### Scenario: Clear action becomes available for non-default remuneration filters
- **WHEN** a user changes the inline remuneration query field or any supported advanced remuneration filter away from its validated default value
- **THEN** the remunerations filter surface exposes an enabled `Limpar filtros` action

#### Scenario: Clear action resets remuneration filters and first page
- **WHEN** a user activates `Limpar filtros` on the remunerations list
- **THEN** the remuneration query, contract, payment-date, active-state, and deletion-visibility filters return to their validated default values
- **AND** for administrators, the employee filter also returns to its validated default value
- **AND** the list reloads from page `1`
- **AND** the current remuneration sorting fields remain unchanged

#### Scenario: Clear action is inactive at default state
- **WHEN** all remuneration filters already match their validated default route values
- **THEN** the `Limpar filtros` action does not trigger a list-state change

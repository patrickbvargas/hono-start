## ADDED Requirements

### Requirement: Reset employee list filters
The system SHALL provide a clear-filters action on the employee filter surface that restores all employee filter fields to the validated default route search state without changing the current sorting fields.

#### Scenario: Clear action becomes available for non-default employee filters
- **WHEN** an administrator changes the inline employee search field or any advanced employee filter away from its validated default value
- **THEN** the employee filter surface exposes an enabled `Limpar filtros` action

#### Scenario: Clear action resets employee filters and first page
- **WHEN** an administrator activates `Limpar filtros` on the employees list
- **THEN** the employee query, type, role, active-state, and deletion-visibility filters return to their validated default values
- **AND** the list reloads from page `1`
- **AND** the current employee sorting fields remain unchanged

#### Scenario: Clear action is inactive at default state
- **WHEN** all employee filters already match their validated default route values
- **THEN** the `Limpar filtros` action does not trigger a list-state change

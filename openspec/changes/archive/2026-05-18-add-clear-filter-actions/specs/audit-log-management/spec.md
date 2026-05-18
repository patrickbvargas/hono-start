## ADDED Requirements

### Requirement: Reset audit-log list filters
The system SHALL provide a clear-filters action on the audit-log filter surface that restores all audit-log filter fields to the validated default route search state without changing the current sorting fields.

#### Scenario: Clear action becomes available for non-default audit-log filters
- **WHEN** an administrator changes the inline audit-log query field or any supported advanced audit-log filter away from its validated default value
- **THEN** the audit-log filter surface exposes an enabled `Limpar filtros` action

#### Scenario: Clear action resets audit-log filters and first page
- **WHEN** an administrator activates `Limpar filtros` on the audit-log list
- **THEN** the audit-log query, actor, action, entity-type, and any supported date-range filters return to their validated default values
- **AND** the list reloads from page `1`
- **AND** the current audit-log sorting fields remain unchanged

#### Scenario: Clear action is inactive at default state
- **WHEN** all audit-log filters already match their validated default route values
- **THEN** the `Limpar filtros` action does not trigger a list-state change

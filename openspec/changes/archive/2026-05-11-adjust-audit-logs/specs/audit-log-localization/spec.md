## ADDED Requirements

### Requirement: Audit log content is localized to pt-BR
The system SHALL present audit-log entity labels and descriptions in pt-BR while preserving the operational action codes used by the product.

#### Scenario: Entity type is localized for display
- **WHEN** an administrator views an audit-log record for a supported business entity
- **THEN** the entity type label is shown in pt-BR in the table, card list, and filter labels

#### Scenario: Audit description is localized for display
- **WHEN** an administrator views an audit-log record
- **THEN** the displayed description is shown in pt-BR
- **AND** the displayed description preserves the referenced record name when available

#### Scenario: Action code remains operational
- **WHEN** an administrator views or filters audit-log actions
- **THEN** the action values remain `CREATE`, `UPDATE`, `DELETE`, or `RESTORE` when those codes are present
- **AND** the localization change does not replace those operational action codes with translated values

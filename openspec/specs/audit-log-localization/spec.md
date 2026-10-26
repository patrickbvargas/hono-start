## Purpose

Define how audit-log content is localized for pt-BR display while preserving operational action codes.

## Requirements

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

### Requirement: New audit observations are persisted in pt-BR
The system SHALL persist the description of every newly generated business audit event in pt-BR. Operational action and entity type codes, entity names, identifiers, actor snapshots and technical change payloads MUST retain their existing semantics and values.

#### Scenario: Business lifecycle mutation
- **WHEN** a client, employee, contract, expense, fee or remuneration is created, updated, deleted or restored through a supported operation
- **THEN** its audit description is persisted in pt-BR in the existing transaction
- **AND** operational codes and technical payloads remain unchanged

#### Scenario: Attachment upload or deletion
- **WHEN** an attachment is uploaded individually, in a batch, or deleted
- **THEN** each corresponding audit description is persisted in pt-BR
- **AND** the original filename is preserved

#### Scenario: Historical audit compatibility
- **WHEN** this change is deployed over existing audit history
- **THEN** existing audit records are not rewritten
- **AND** existing localized reading behavior and firm-scoped authorization remain unchanged

## ADDED Requirements

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

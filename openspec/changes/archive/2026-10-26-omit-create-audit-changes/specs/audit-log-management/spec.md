## ADDED Requirements

### Requirement: Creation summaries omit field changes

The system SHALL omit field-change summaries for CREATE audit events while retaining their full technical payload in storage and technical details. Existing history SHALL remain immutable.

#### Scenario: Creation details
- **WHEN** an administrator inspects a CREATE event
- **THEN** the drawer omits the field-change summary and the changes tab explains its omission
- **AND** technical details retain the complete original payload

#### Scenario: Persistence remains unchanged
- **WHEN** a CREATE event is recorded by runtime or demo seed
- **THEN** its full technical payload is persisted using existing behavior

#### Scenario: Other mutations
- **WHEN** UPDATE, DELETE or RESTORE is inspected
- **THEN** its existing payload and presentation remain unchanged

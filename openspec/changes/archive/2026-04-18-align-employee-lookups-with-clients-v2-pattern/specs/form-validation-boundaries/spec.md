## ADDED Requirements

### Requirement: Multi-lookup writes preserve per-lookup validation boundaries
The system SHALL preserve the canonical validation boundary when a feature write depends on multiple lookup-backed fields, so each lookup family is resolved and validated independently while pure cross-field rules remain separate.

#### Scenario: Multi-lookup writes stay database-free at the schema layer
- **WHEN** a feature schema validates a payload that includes more than one lookup-backed field
- **THEN** the schema SHALL remain limited to structural validation and pure business assertions
- **AND** the schema SHALL not require Prisma-backed lookup resolution to determine whether the lookup values exist or are selectable

#### Scenario: Server boundary resolves each lookup family separately
- **WHEN** a create or update write reaches the server boundary with multiple lookup-backed values
- **THEN** the server SHALL resolve each lookup family separately by stable lookup `value`
- **AND** persistence-aware existence or activity checks SHALL execute per lookup family instead of through one opaque aggregate lookup validator
- **AND** equivalent lookup families SHALL keep the same naming pattern already used by the reference slice, such as `get...ByValue`, `assert...Exists`, and `assert...CanBeSelected`

#### Scenario: Cross-field rules compose with, but do not replace, lookup validation
- **WHEN** a feature also has pure cross-field rules that depend on the submitted payload
- **THEN** those rules SHALL remain separate from the lookup-resolution boundary
- **AND** the feature SHALL be able to apply both the cross-field rules and the per-lookup persistence-aware checks without either layer becoming the authoritative home of the other

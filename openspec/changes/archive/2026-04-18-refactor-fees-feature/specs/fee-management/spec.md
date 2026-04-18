## MODIFIED Requirements

### Requirement: Fee writes preserve the shared form-validation boundary
The system SHALL apply the shared form-validation boundary to fee writes so schema validation, normalization, pure business validation, and persisted resource checks remain consistently separated.

#### Scenario: Pure fee business validation is discoverable from the feature rules directory
- **WHEN** a contributor needs to change a fee business rule that does not require Prisma
- **THEN** the authoritative implementation SHALL be discoverable under `src/features/fees/rules/`
- **AND** exported throwing assertion entrypoints SHALL use an `assert...` prefix

#### Scenario: Fee API writes use the canonical rules directory
- **WHEN** the fee create or update flow enforces non-Prisma fee rules
- **THEN** those rules SHALL reuse modules under `src/features/fees/rules/`
- **AND** parent-resource reads and persisted-state checks MAY remain in API-side or data-side helpers

#### Scenario: Fee schema parse remains authoritative for pure write validation
- **WHEN** the fee create or update schema successfully parses a submitted payload
- **THEN** that payload SHALL be valid for the feature's pure non-Prisma fee rules
- **AND** any remaining server-side fee checks SHALL be limited to parent-resource or persisted-state concerns

#### Scenario: Fee validation tests are colocated with the feature
- **WHEN** the fee validation boundary is implemented or updated
- **THEN** focused tests SHALL live in feature-local `__tests__` folders
- **AND** those tests SHALL cover the schema parse boundary plus the canonical fee rules

## MODIFIED Requirements

### Requirement: Contract writes preserve the shared form-validation boundary
The system SHALL apply the shared form-validation boundary to contract create and update writes so schema validation, normalization, pure business validation, and lookup-backed server checks remain consistently separated.

#### Scenario: Pure contract business validation is discoverable from one file
- **WHEN** a contributor needs to change a contract business rule that does not require Prisma
- **THEN** the authoritative implementation SHALL be discoverable in `src/features/contracts/rules.ts`
- **AND** exported rule entrypoints SHALL use a `validate...` prefix

#### Scenario: Contract API writes use the canonical rules file
- **WHEN** the contract create or update flow enforces non-Prisma business rules
- **THEN** those rules SHALL reuse `src/features/contracts/rules.ts`
- **AND** lookup-backed or current-record checks MAY remain in API-side helpers

#### Scenario: Contract schema parse remains authoritative for pure write validation
- **WHEN** the contract create or update schema successfully parses a submitted payload
- **THEN** that payload SHALL be valid for the feature's pure non-Prisma contract rules
- **AND** any remaining API-side contract checks SHALL be limited to lookup-backed or persisted-state concerns

#### Scenario: Contract validation tests are colocated with the feature
- **WHEN** the contract validation boundary is implemented or updated
- **THEN** focused tests SHALL live in feature-local `__tests__` folders
- **AND** those tests SHALL cover the schema parse boundary plus the canonical contract rules

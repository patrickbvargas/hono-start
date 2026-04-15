## Purpose

Define the remuneration feature's pure write-validation boundary so schema validation, canonical business rules, and persisted resource checks stay separated and discoverable.

## Requirements

### Requirement: Remuneration writes preserve the shared form-validation boundary
The system SHALL apply the shared form-validation boundary to remuneration writes so schema validation, pure business validation, and persisted resource checks remain consistently separated.

#### Scenario: Pure remuneration business validation is discoverable from one file
- **WHEN** a contributor needs to change a remuneration business rule that does not require Prisma
- **THEN** the authoritative implementation SHALL be discoverable in `src/features/remunerations/rules.ts`
- **AND** exported rule entrypoints SHALL use a `validate...` prefix

#### Scenario: Remuneration API writes use the canonical rules file
- **WHEN** the remuneration update flow enforces pure remuneration business rules
- **THEN** those rules SHALL reuse `src/features/remunerations/rules.ts`
- **AND** current-record access and persisted-state checks MAY remain in API-side helpers

#### Scenario: Remuneration schema parse remains authoritative for pure write validation
- **WHEN** the remuneration update schema successfully parses a submitted payload
- **THEN** that payload SHALL be valid for the feature's pure remuneration rules
- **AND** any remaining API-side remuneration checks SHALL be limited to current-record access or persisted-state concerns

#### Scenario: Remuneration validation tests are colocated with the feature
- **WHEN** the remuneration validation boundary is implemented or updated
- **THEN** focused tests SHALL live in feature-local `__tests__` folders
- **AND** those tests SHALL cover the schema parse boundary plus the canonical remuneration rules

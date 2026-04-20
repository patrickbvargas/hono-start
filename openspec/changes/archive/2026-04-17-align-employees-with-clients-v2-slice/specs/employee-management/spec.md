## MODIFIED Requirements

### Requirement: Employee writes preserve the shared form-validation boundary
The system SHALL apply the shared form-validation boundary to employee create and update writes so schema validation, normalization, pure business validation, persistence-aware checks, and lookup-backed server checks remain consistently separated.

#### Scenario: Pure employee business validation is discoverable from canonical rule modules
- **WHEN** a contributor needs to change a pure employee validation rule
- **THEN** the authoritative implementation SHALL be discoverable in `src/features/employees/rules/`
- **AND** exported rule entrypoints SHALL use an `assert...` prefix

#### Scenario: Employee schema uses the canonical rule modules
- **WHEN** the employee create or update schema validates submitted fields
- **THEN** any schema-level refinement for pure business rules SHALL reuse `src/features/employees/rules/`
- **AND** a successful schema parse SHALL mean the submitted payload is valid for the feature's pure employee rules
- **AND** the schema SHALL NOT become the authoritative home of the underlying rule logic

#### Scenario: Persistence-aware checks stay outside pure rule modules
- **WHEN** employee create, update, delete, or restore flows require lookup resolution, current stored-state checks, or active-contract checks
- **THEN** those checks SHALL be enforced through the feature's Prisma-backed write boundary rather than the pure `rules/` modules
- **AND** the pure `rules/` modules SHALL remain database-free

#### Scenario: Employee validation tests are colocated with the feature
- **WHEN** the employee validation boundary is implemented or updated
- **THEN** focused tests SHALL live in feature-local test folders
- **AND** those tests SHALL cover the schema parse boundary plus the canonical employee rule modules

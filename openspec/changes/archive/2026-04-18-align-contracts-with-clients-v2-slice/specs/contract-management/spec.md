## MODIFIED Requirements

### Requirement: Contract route and server operations derive scope from session
The system SHALL derive tenant scope and role-aware contract access from the authenticated session rather than from client-submitted authority claims.

#### Scenario: Server boundaries remain feature-owned and route-facing
- **WHEN** the contracts feature is implemented or materially refactored
- **THEN** route-facing contract query and mutation wrappers SHALL live in `src/features/contracts/api/queries.ts` and `src/features/contracts/api/mutations.ts`
- **AND** Prisma-backed contract reads, writes, lookup access, resource access checks, and persistence-aware lifecycle checks SHALL live in `src/features/contracts/data/`
- **AND** the `/contratos` route SHALL consume the feature barrel rather than importing contract internals

### Requirement: View contract details
The system SHALL allow authenticated users with access to a contract to inspect contract details without leaving the list workflow.

#### Scenario: Contract details and edit hydration use feature-owned detail queries
- **WHEN** the contracts route opens details or edit flows for a contract
- **THEN** the route SHALL pass the contract id through the overlay state
- **AND** the details drawer and edit-default hydration SHALL load persisted contract detail through feature-owned query boundaries rather than list-row snapshots

### Requirement: Contract writes preserve the shared form-validation boundary
The system SHALL apply the shared form-validation boundary to contract create and update writes so schema validation, normalization, pure business validation, and lookup-backed server checks remain consistently separated.

#### Scenario: Pure contract business validation is discoverable from canonical rule modules
- **WHEN** a contributor needs to change a contract business rule that does not require Prisma
- **THEN** the authoritative implementation SHALL be discoverable in `src/features/contracts/rules/`
- **AND** exported rule entrypoints SHALL use an `assert...` prefix

#### Scenario: Contract API writes use the canonical rule modules
- **WHEN** the contract create or update flow enforces non-Prisma business rules
- **THEN** those rules SHALL reuse `src/features/contracts/rules/`
- **AND** lookup-backed or current-record checks SHALL remain in the Prisma-backed data boundary

#### Scenario: Contract validation tests are colocated with the feature
- **WHEN** the contract validation boundary is implemented or updated
- **THEN** focused tests SHALL live in feature-local `__tests__` folders
- **AND** those tests SHALL cover the schema parse boundary, canonical contract rule modules, and route-critical contract data boundaries

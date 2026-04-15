## MODIFIED Requirements

### Requirement: Canonical feature slices define one discoverable home for pure business validation
The system SHALL define one canonical home for feature-local pure business validation so future boilerplate features remain easy to change, reason about, and compare.

#### Scenario: Feature slice uses a canonical rules file
- **WHEN** a feature slice is created or materially refactored
- **THEN** the slice SHALL keep pure business validation in a single feature-local `rules.ts` file by default
- **AND** `api/` SHALL remain the home for transport and persisted-state access
- **AND** `schemas/` SHALL remain the home for structural validation
- **AND** `utils/` SHALL remain reserved for generic helpers rather than authoritative business rules

#### Scenario: Feature rules use a canonical naming pattern
- **WHEN** a contributor changes feature behavior
- **THEN** exported feature business-rule entrypoints SHALL be discoverable in `rules.ts`
- **AND** those entrypoints SHALL use a `validate...` prefix
- **AND** helper predicates MAY use narrower names when they are not the authoritative exported rule entrypoints

### Requirement: Feature boundaries preserve clear reasons to change
The system SHALL keep business-rule ownership distinct from structural validation and persistence checks.

#### Scenario: Feature rule usage does not change rule ownership
- **WHEN** a feature API handler processes a query or mutation
- **THEN** it MAY reuse rule functions from `rules.ts`
- **AND** that reuse SHALL NOT make the API layer the authoritative home of pure business validation

#### Scenario: Feature schema refinements reuse canonical rules
- **WHEN** a feature schema performs database-free refinement
- **THEN** it MAY reuse rule functions from `rules.ts`
- **AND** the schema layer SHALL NOT become the authoritative home of the underlying business rules

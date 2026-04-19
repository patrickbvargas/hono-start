## ADDED Requirements

### Requirement: Client management has one authoritative feature slice
The system SHALL use `src/features/clients` as the only authoritative client-management feature implementation.

#### Scenario: Client route consumes promoted client slice
- **WHEN** the `/clientes` route composes the client-management screen
- **THEN** it SHALL import route-facing client functionality from `src/features/clients`
- **AND** it SHALL NOT import from the legacy suffixed client feature path

#### Scenario: Obsolete client implementation is removed
- **WHEN** contributors inspect client-management source code
- **THEN** there SHALL be no separate legacy client implementation alongside the promoted `src/features/clients` slice
- **AND** there SHALL be no `_v2` suffixed client feature path used by active source code

## MODIFIED Requirements

### Requirement: Client writes preserve the shared form-validation boundary
The system SHALL apply the shared form-validation boundary to client create and update writes so schema validation, normalization, pure business validation, and lookup-backed server checks remain consistently separated.

#### Scenario: Client schema uses only pure validation helpers
- **WHEN** the client create or update schema validates submitted fields
- **THEN** any schema-level refinement uses only pure helpers that do not require Prisma or persisted client state

#### Scenario: Pure client business validation is discoverable from the promoted slice
- **WHEN** a contributor needs to change a pure client validation rule
- **THEN** the authoritative implementation SHALL be discoverable under `src/features/clients/rules/`
- **AND** exported assertion entrypoints SHALL use an `assert...` prefix

#### Scenario: Client type selection is resolved at the server boundary
- **WHEN** a client create or update mutation receives a submitted client type lookup value
- **THEN** the server resolves that lookup value before persistence
- **AND** the server rejects unknown or disallowed selections with a user-friendly Portuguese error

#### Scenario: Client input is normalized separately from validation
- **WHEN** the client create or update flow canonicalizes document or optional text inputs
- **THEN** that normalization executes separately from the pure business validation helpers
- **AND** the normalized values are the ones persisted by the server

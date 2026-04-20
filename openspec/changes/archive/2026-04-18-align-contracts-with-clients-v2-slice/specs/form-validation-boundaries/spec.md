## MODIFIED Requirements

### Requirement: Feature validation concerns use a canonical boundary
The system SHALL organize feature validation concerns using a canonical boundary so schemas, pure assertion helpers, Prisma-backed lookup resolution, persistence-aware checks, read-model mapping, and form-hook orchestration have distinct ownership.

#### Scenario: Contract form hook submits and hydrates through canonical feature boundaries
- **WHEN** the contracts feature form hook coordinates create or update submission after schema validation
- **THEN** the hook SHALL submit the parsed payload to the contract mutation boundary
- **AND** create-versus-update branching, cache refresh, toast feedback, and edit-default hydration SHALL remain the hook's responsibility
- **AND** edit hydration SHALL use a feature-owned contract detail query rather than a route-supplied row object

#### Scenario: Contract server wrappers stay separate from persistence modules
- **WHEN** the contracts feature implements route-facing reads or writes
- **THEN** route-facing server functions and React Query option factories SHALL live in `src/features/contracts/api/queries.ts` and `src/features/contracts/api/mutations.ts`
- **AND** Prisma-backed contract reads, writes, lookup access, and persistence-aware checks SHALL live in `src/features/contracts/data/queries.ts` and `src/features/contracts/data/mutations.ts`
- **AND** the contract form hook and `/contratos` route SHALL consume the `api/` surface rather than importing persistence modules directly

#### Scenario: Contract read models are mapped before schema parsing
- **WHEN** the contracts feature reads persisted data for list or detail views
- **THEN** the feature SHALL map raw Prisma rows into explicit contract summary or detail models before parsing with `schemas/model.ts`
- **AND** lookup-backed read fields SHALL expose UI-ready labels when rendered to users
- **AND** stable lookup `value` fields SHALL remain available alongside labels when the feature needs them for edit defaults or downstream write flows

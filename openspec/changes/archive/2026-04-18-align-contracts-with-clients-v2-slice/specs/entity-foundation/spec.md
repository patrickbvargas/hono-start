## MODIFIED Requirements

### Requirement: Feature slices preserve ownership boundaries
The system SHALL keep clear ownership boundaries between feature slices, routes, and shared infrastructure for feature work.

#### Scenario: Existing slices converge on the canonical ownership pattern
- **WHEN** the `contracts` feature is refactored to align with the repository's reference slice
- **THEN** the refactor SHALL move remaining route-facing query wrappers into `src/features/contracts/api/queries.ts` and `src/features/contracts/api/mutations.ts`
- **AND** the refactor SHALL move Prisma-backed reads and writes into `src/features/contracts/data/queries.ts` and `src/features/contracts/data/mutations.ts`
- **AND** overlay-driven contract route flows SHALL consume ids and feature-owned detail hydration rather than row-object snapshots

#### Scenario: Contracts align naming with equivalent slice responsibilities
- **WHEN** `contracts` implements responsibilities already present in `clients_v2` and `employees`, such as route-facing query boundaries, feature data modules, edit hydration, or public-barrel exports
- **THEN** those responsibilities SHALL use aligned naming and ownership boundaries unless a documented contract-management behavior requires a different shape
- **AND** the contracts slice SHALL NOT preserve older ad hoc names for equivalent responsibilities once the canonical pattern exists

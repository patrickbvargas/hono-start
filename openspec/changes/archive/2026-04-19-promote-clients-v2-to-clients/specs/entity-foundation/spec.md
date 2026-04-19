## MODIFIED Requirements

### Requirement: Reference feature slice defines the baseline structure for future feature work
The system SHALL treat `src/features/clients` as the reference slice for feature structure, ownership boundaries, list behavior, option-query behavior, protected mutation flows, and route-facing public surface. Future feature slices SHALL compare any planned deviation against that reference slice before changing the workflow shape.

#### Scenario: Clients serves as the reference slice
- **WHEN** the application prepares to implement a new feature slice or refactor an existing one
- **THEN** `src/features/clients` SHALL be treated as the baseline example for feature structure, ownership boundaries, list behavior, option-query behavior, protected mutation flows, and route-facing public surface
- **AND** the reference slice SHALL be used as a workflow reference rather than a copy-paste template for domain-specific logic

#### Scenario: Planned deviations are justified against the reference slice
- **WHEN** a contributor proposes a structural deviation from the reference feature slice
- **THEN** the deviation SHALL be compared against `src/features/clients` before it is accepted
- **AND** the deviation SHALL be justified by feature-specific behavior rather than ad hoc implementation preference

### Requirement: Feature slices preserve ownership boundaries
The system SHALL keep clear ownership boundaries between feature slices, routes, and shared infrastructure for feature work.

#### Scenario: Feature owns feature-specific behavior
- **WHEN** a feature slice is implemented or materially refactored
- **THEN** its feature slice SHALL own feature-specific schemas, route-facing server wrappers, persistence modules, orchestration hooks, presentation components, constants, pure helpers, and pure business assertions
- **AND** route-facing server wrappers and React Query option factories SHALL live in the feature-local `api/` modules
- **AND** Prisma-backed reads, writes, lookup access, and persistence-aware checks SHALL live in the feature-local `data/` modules
- **AND** feature-specific rules SHALL not be defined inside route files
- **AND** routes SHALL remain declarative composition points that consume the feature barrel rather than feature internals

#### Scenario: Pure feature business assertions use a canonical location and naming pattern
- **WHEN** a feature slice defines pure business assertions that do not require Prisma or persisted resource lookups
- **THEN** the authoritative implementation SHALL live in the feature-local `rules/` module area by default
- **AND** exported assertion entrypoints SHALL use an `assert...` prefix
- **AND** `utils/` SHALL remain reserved for generic helpers rather than authoritative business-rule implementations

#### Scenario: Read models are explicit feature contracts
- **WHEN** a feature slice reads persisted data for route-backed list or detail views
- **THEN** the feature SHALL map raw persistence rows into explicit read models before parsing them with `schemas/model.ts`
- **AND** lookup-backed read models SHALL expose UI-ready labels when rendered to users
- **AND** stable lookup `value` fields SHALL remain available alongside labels when the feature needs them for edit defaults or downstream write flows

#### Scenario: Equivalent slice responsibilities use aligned naming
- **WHEN** multiple feature slices implement the same kind of responsibility such as create-default helpers, primary form hooks, list/data query modules, or primary write assertions
- **THEN** those responsibilities SHALL use aligned naming across features unless a documented exception requires otherwise
- **AND** one feature slice SHALL NOT keep ad hoc names for an equivalent responsibility when the repository already has a clearer house convention

#### Scenario: Existing slices converge on the canonical ownership pattern
- **WHEN** an existing feature slice is refactored to align with the repository's reference slice
- **THEN** the refactor SHALL move remaining route-facing query wrappers into `api/queries.ts` and `api/mutations.ts`
- **AND** the refactor SHALL move Prisma-backed reads and writes into `data/queries.ts` and `data/mutations.ts`
- **AND** overlay-driven route flows SHALL consume ids and feature-owned detail hydration rather than row-object snapshots when following the canonical entity-management pattern

#### Scenario: Contracts converge on the canonical ownership pattern
- **WHEN** the `contracts` feature is refactored to align with the repository's reference slice
- **THEN** the refactor SHALL move remaining route-facing query wrappers into `src/features/contracts/api/queries.ts` and `src/features/contracts/api/mutations.ts`
- **AND** the refactor SHALL move Prisma-backed reads and writes into `src/features/contracts/data/queries.ts` and `src/features/contracts/data/mutations.ts`
- **AND** overlay-driven contract route flows SHALL consume ids and feature-owned detail hydration rather than row-object snapshots

#### Scenario: Contracts align naming with equivalent slice responsibilities
- **WHEN** `contracts` implements responsibilities already present in `clients` and `employees`, such as route-facing query boundaries, feature data modules, edit hydration, or public-barrel exports
- **THEN** those responsibilities SHALL use aligned naming and ownership boundaries unless a documented contract-management behavior requires a different shape
- **AND** the contracts slice SHALL NOT preserve older ad hoc names for equivalent responsibilities once the canonical pattern exists

#### Scenario: Feature barrels expose a consistent public surface
- **WHEN** a feature slice defines its public `index.ts` barrel
- **THEN** the barrel SHALL expose the categories of public API that top-level consumers need in a consistent way across equivalent feature slices
- **AND** the canonical minimal route-facing surface SHALL stay limited to route-consumed query option factories, top-level feature UI entrypoints, exported search schemas, and route-consumed feature model types
- **AND** the barrel SHALL avoid leaking implementation-only modules merely because another slice does so
- **AND** equivalent top-level consumers such as route files SHALL not need feature-specific knowledge of unrelated internal export differences

#### Scenario: Shared code remains generic
- **WHEN** reusable infrastructure is added for multiple features
- **THEN** the `shared/` layer SHALL own only generic primitives, helpers, and infrastructure that are not tied to one feature's domain rules
- **AND** feature-specific logic SHALL remain inside the feature until a stable abstraction is proven

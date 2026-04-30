## MODIFIED Requirements

### Requirement: Feature slices preserve ownership boundaries
The system SHALL keep clear ownership boundaries between feature slices, routes, and shared infrastructure for feature work, and equivalent micro-patterns SHALL converge across feature slices instead of remaining as informal per-feature variations.

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
- **AND** exported assertion entrypoints SHALL throw when the asserted invariant fails
- **AND** non-throwing predicates, issue collectors, and validation helpers SHALL not be exported from `rules/`
- **AND** `utils/` SHALL remain reserved for generic helpers rather than authoritative business-rule implementations

#### Scenario: Feature errors use safe feature-local catalogs
- **WHEN** a feature throws an expected business or authorization error
- **THEN** the user-facing message SHALL come from a feature-local error catalog or a documented shared safe-error helper
- **AND** the message SHALL be safe to display to users in pt-BR
- **AND** database errors, stack traces, SQL details, and internal implementation details SHALL not be exposed through thrown user-facing messages

#### Scenario: Feature boundary params, hook options, and component props are consistently named
- **WHEN** a feature component, hook, or route-facing API accepts structured input
- **THEN** React component props SHALL use local `PascalCaseProps` interfaces
- **AND** hook object parameters SHALL use local `Use<Feature><Concern>Options` interfaces when the hook accepts options
- **AND** route-facing query and mutation boundaries SHALL use explicit named input object shapes when a call accepts multiple values or optional values
- **AND** equivalent responsibilities SHALL use equivalent naming across features unless a documented exception requires otherwise

#### Scenario: Equivalent overlay flows prefer id-based contracts
- **WHEN** a feature renders detail, edit, delete, or restore overlays that hydrate feature-owned data by selection
- **THEN** equivalent overlay props SHALL prefer `id: EntityId` or equivalent id-based selection inputs
- **AND** the overlay SHALL rely on feature-owned hydration hooks rather than row-object snapshots when following the canonical entity-management pattern

#### Scenario: Equivalent table actions prefer id-based callbacks
- **WHEN** a feature table exposes view, edit, delete, or restore actions for route-level overlay orchestration
- **THEN** the table SHALL prefer callbacks such as `onView(id)`, `onEdit(id)`, `onDelete(id)`, and `onRestore(id)`
- **AND** equivalent table components SHALL NOT require parent routes to keep ad hoc row-object action contracts for the same lifecycle concern

#### Scenario: Equivalent entity tables expose a clickable id entrypoint for details
- **WHEN** a principal entity table renders a row in the canonical list-management pattern
- **THEN** the first column SHALL render the row's internal id in a clickable format such as `#123`
- **AND** activating that id SHALL open the same details drawer flow used by the row-level view action
- **AND** the row actions menu SHALL preserve a details fallback action for the same record

#### Scenario: Feature control flow uses braced if statements
- **WHEN** feature code uses an `if` statement
- **THEN** the `if` body SHALL use braces
- **AND** early returns SHALL be written as braced blocks rather than inline single-statement returns
- **AND** synchronized feature code SHALL NOT introduce braceless inline `if` statements

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
- **AND** the canonical minimal route-facing surface SHALL stay limited to route-consumed query option factories, top-level feature UI entrypoints, exported primary route-facing data hooks, exported search schemas, and route-consumed feature model types
- **AND** the barrel SHALL avoid leaking implementation-only modules merely because another slice does so
- **AND** equivalent top-level consumers such as route files SHALL not need feature-specific knowledge of unrelated internal export differences

#### Scenario: Equivalent feature barrels avoid incidental exports
- **WHEN** two feature slices serve the same route-facing concern category
- **THEN** they SHALL NOT diverge only because one slice exports extra query factories, form schemas, or internal helpers that the other does not
- **AND** any additional export beyond the canonical minimal surface SHALL be justified by a route-facing consumer need rather than historical drift

#### Scenario: Principal features are validated against the boilerplate pattern
- **WHEN** the project validates completed principal feature work
- **THEN** `clients`, `employees`, `contracts`, `fees`, and `remunerations` SHALL be audited against the same feature boilerplate responsibility matrix
- **AND** unjustified drift SHALL be synchronized with the canonical pattern
- **AND** justified exceptions SHALL be documented in the owning implementation docs or feature-specific specification

#### Scenario: Shared code remains generic
- **WHEN** reusable infrastructure is added for multiple features
- **THEN** the `shared/` layer SHALL own only generic primitives, helpers, and infrastructure that are not tied to one feature's domain rules
- **AND** feature-specific logic SHALL remain inside the feature until a stable abstraction is proven

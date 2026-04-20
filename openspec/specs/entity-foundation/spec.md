## MODIFIED Requirements

### Requirement: Reference feature slice defines the baseline structure for future feature work
The system SHALL treat `src/features/clients` as the reference slice for feature structure, ownership boundaries, list behavior, option-query behavior, protected mutation flows, and route-facing public surface. Future feature slices SHALL compare any planned deviation against that reference slice before changing the workflow shape.

#### Scenario: Clients serves as the reference slice
- **WHEN** the application prepares to implement a new feature slice or refactor an existing one
- **THEN** `src/features/clients` SHALL be treated as the baseline example for feature structure, ownership boundaries, list behavior, option-query behavior, protected mutation flows, and route-facing public surface
- **AND** the reference slice SHALL be used as a workflow reference rather than a copy-paste template for domain-specific logic

#### Scenario: Feature boilerplate pattern is explicit
- **WHEN** a contributor validates an entity-management feature slice
- **THEN** the implementation contract SHALL define the canonical responsibilities for `api/`, `components/`, `constants/`, `data/`, `hooks/`, `rules/`, `schemas/`, `utils/`, and `index.ts`
- **AND** the feature SHALL include only the directories whose responsibilities it owns
- **AND** missing or additional responsibility areas SHALL be documented as justified feature-specific exceptions rather than left as implicit drift

#### Scenario: Feature subfolders avoid nested barrels
- **WHEN** a feature slice is implemented or synchronized with the canonical boilerplate pattern
- **THEN** the feature SHALL keep only its top-level public feature barrel
- **AND** feature subfolders SHALL NOT contain barrel `index.ts` or `index.tsx` files
- **AND** feature-internal imports SHALL target concrete module files rather than local subfolder barrels

#### Scenario: Planned deviations are justified against the reference slice
- **WHEN** a contributor proposes a structural deviation from the reference feature slice
- **THEN** the deviation SHALL be compared against `src/features/clients` before it is accepted
- **AND** the deviation SHALL be justified by feature-specific behavior rather than ad hoc implementation preference

### Requirement: Feature slices follow a standard implementation sequence
The system SHALL define a repeatable implementation workflow for feature slices so contributors can add or refactor features without reinterpreting architecture from scratch.

#### Scenario: Feature contract is defined before UI assembly
- **WHEN** a feature slice is started or materially refactored
- **THEN** the feature SHALL define its schema contract before route wiring
- **AND** the schema contract SHALL include entity model, form payload, filter, sort, and search definitions when those concerns exist
- **AND** the implementation sequence SHALL proceed from schemas to feature-local APIs, then hooks, then components, and finally the route

#### Scenario: Route wiring happens after feature behavior exists
- **WHEN** a feature slice is wired into a route
- **THEN** the route SHALL validate search state, prefetch feature queries, and mount feature UI pieces
- **AND** the route SHALL not be the first location where feature business rules are defined
- **AND** overlays for create, edit, delete, restore, and details SHALL be wired only after the feature contract and feature UI pieces already exist

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
- **AND** the canonical minimal route-facing surface SHALL stay limited to route-consumed query option factories, top-level feature UI entrypoints, exported search schemas, and route-consumed feature model types
- **AND** the barrel SHALL avoid leaking implementation-only modules merely because another slice does so
- **AND** equivalent top-level consumers such as route files SHALL not need feature-specific knowledge of unrelated internal export differences

#### Scenario: Principal features are validated against the boilerplate pattern
- **WHEN** the project validates completed principal feature work
- **THEN** `clients`, `employees`, `contracts`, `fees`, and `remunerations` SHALL be audited against the same feature boilerplate responsibility matrix
- **AND** unjustified drift SHALL be synchronized with the canonical pattern
- **AND** justified exceptions SHALL be documented in the owning implementation docs or feature-specific specification

#### Scenario: Shared code remains generic
- **WHEN** reusable infrastructure is added for multiple features
- **THEN** the `shared/` layer SHALL own only generic primitives, helpers, and infrastructure that are not tied to one feature's domain rules
- **AND** feature-specific logic SHALL remain inside the feature until a stable abstraction is proven

### Requirement: Shared abstractions are extracted only after repeated cross-feature usage
The system SHALL prefer local feature implementation over premature generic abstractions when establishing validation or workflow patterns.

#### Scenario: First feature proves the pattern locally
- **WHEN** a workflow or helper exists for only one feature slice
- **THEN** the implementation MAY remain feature-local
- **AND** the team SHALL not treat single-use code as sufficient evidence for a shared abstraction

#### Scenario: Repeated patterns justify extraction
- **WHEN** multiple feature slices require the same behavioral helper or structure
- **THEN** the team MAY extract a shared abstraction after comparing the repeated usage
- **AND** the abstraction SHALL reflect the stable common contract rather than one feature's accidental details

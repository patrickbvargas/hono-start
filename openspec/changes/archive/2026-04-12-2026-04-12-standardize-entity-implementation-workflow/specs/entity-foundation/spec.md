## MODIFIED Requirements

### Requirement: Reference entity slice defines the baseline structure for new entities
The system SHALL use one stabilized entity slice as the reference implementation before new business entities are introduced.

#### Scenario: Employees serves as the workflow reference slice
- **WHEN** the application prepares to implement the next entity-management feature
- **THEN** the employees slice SHALL be treated as the baseline example for route structure, feature boundaries, list behavior, option-query behavior, and protected mutation flows
- **AND** the employees slice SHALL be used as a workflow reference rather than as a copy-paste template for domain-specific logic
- **AND** contributors SHALL compare any planned deviation against the employees slice before changing the workflow shape for a new entity

#### Scenario: New entities inherit the same management workflow shape
- **WHEN** a new entity-management feature is proposed after this change
- **THEN** its route and feature structure SHALL follow the same high-level workflow shape established by the reference slice
- **AND** deviations SHALL be justified by entity-specific behavior rather than ad hoc implementation preference

### Requirement: New entity slices follow a standard implementation sequence
The system SHALL define a repeatable implementation workflow for new entity-management features so contributors can add entities without re-interpreting the architecture from scratch.

#### Scenario: Entity contract is defined before UI assembly
- **WHEN** a new entity-management feature is started
- **THEN** the feature SHALL define its schema contract before route wiring
- **AND** the schema contract SHALL include entity model, form payload, filter, sort, and search definitions
- **AND** the implementation sequence SHALL proceed from schemas to feature-local APIs, then hooks, then components, and finally the route

#### Scenario: Server boundary follows the schema contract
- **WHEN** a new entity-management feature adds server operations
- **THEN** feature-local read and write handlers SHALL validate against the feature schemas
- **AND** the handlers SHALL map persistence concerns into the feature model before route composition occurs

#### Scenario: Route is wired after feature behavior exists
- **WHEN** a new entity-management route is implemented
- **THEN** the route SHALL validate search state, prefetch feature queries, and mount feature UI pieces
- **AND** the route SHALL not be the first location where entity business rules are defined
- **AND** overlays for create, edit, delete, restore, and details SHALL be wired only after the feature contract and feature UI pieces already exist

### Requirement: New entity slices preserve ownership boundaries
The system SHALL keep clear ownership boundaries between feature slices, routes, and shared infrastructure for entity-management work.

#### Scenario: Feature owns entity-specific behavior
- **WHEN** an entity-management feature is implemented
- **THEN** its feature slice SHALL own entity-specific schemas, server operations, orchestration hooks, presentation components, constants, and pure helpers
- **AND** entity-specific rules SHALL not be defined inside route files
- **AND** routes SHALL remain declarative composition points that consume the feature barrel rather than feature internals

#### Scenario: Shared code remains generic
- **WHEN** reusable infrastructure is added for entity-management features
- **THEN** the `shared/` layer SHALL own only generic primitives, helpers, and infrastructure that are not tied to one entity’s domain rules
- **AND** entity-specific logic SHALL remain inside the feature until a stable abstraction is proven

### Requirement: Shared abstractions are extracted only after repeated usage
The system SHALL prefer local entity implementations over premature generic abstractions when establishing new entity-management patterns.

#### Scenario: First entity proves the pattern locally
- **WHEN** a workflow or helper exists for only one entity slice
- **THEN** the implementation MAY remain feature-local
- **AND** the team SHALL not treat single-use code as sufficient evidence for a shared abstraction

#### Scenario: Repeated patterns justify extraction
- **WHEN** multiple entity slices require the same behavioral helper or structure
- **THEN** the team MAY extract a shared abstraction after comparing the repeated usage
- **AND** the abstraction SHALL reflect the stable common contract rather than one feature’s accidental details

#### Scenario: Shared extraction follows repeated cross-entity proof
- **WHEN** a contributor considers moving entity-management code into `shared/`
- **THEN** the contributor SHALL first verify the behavior has repeated across multiple entity slices
- **AND** the extraction SHALL preserve a generic contract instead of encoding employee-specific assumptions

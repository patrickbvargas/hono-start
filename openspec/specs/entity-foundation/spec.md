## MODIFIED Requirements

### Requirement: Reference feature slice defines the baseline structure for future feature work
The system SHALL treat `src/features/employees` as the reference slice for route structure, feature boundaries, list behavior, option-query behavior, and protected mutation flows. Future feature slices SHALL compare any planned deviation against the reference slice before changing the workflow shape.

#### Scenario: Employees serves as the reference slice
- **WHEN** the application prepares to implement a new feature slice or refactor an existing one
- **THEN** `src/features/employees` SHALL be treated as the baseline example for route structure, feature boundaries, list behavior, option-query behavior, and protected mutation flows
- **AND** the reference slice SHALL be used as a workflow reference rather than a copy-paste template for domain-specific logic

#### Scenario: Planned deviations are justified against the reference slice
- **WHEN** a contributor proposes a structural deviation from the reference feature slice
- **THEN** the deviation SHALL be compared against `src/features/employees` before it is accepted
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
- **WHEN** a feature slice is implemented
- **THEN** its feature slice SHALL own feature-specific schemas, server operations, orchestration hooks, presentation components, constants, pure helpers, and pure business validation
- **AND** feature-specific rules SHALL not be defined inside route files
- **AND** routes SHALL remain declarative composition points that consume the feature barrel rather than feature internals

#### Scenario: Pure feature business validation uses a canonical file and naming pattern
- **WHEN** a feature slice defines pure business validation that does not require Prisma or persisted resource lookups
- **THEN** the authoritative implementation SHALL live in the feature-local `rules.ts` file by default
- **AND** exported rule entrypoints SHALL use a `validate...` prefix
- **AND** private helpers in `rules.ts` that return a single `ValidationIssue` or `null` SHALL use a `get...Issue` name
- **AND** `utils/` SHALL remain reserved for generic helpers rather than authoritative business-rule implementations

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

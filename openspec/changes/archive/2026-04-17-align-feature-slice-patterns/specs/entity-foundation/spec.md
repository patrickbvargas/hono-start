## MODIFIED Requirements

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
- **AND** the primary exported write-validator entrypoint SHALL use the `validate<Feature>WriteRules` pattern
- **AND** private helpers in `rules.ts` that return a single `ValidationIssue` or `null` SHALL use a `get...Issue` name
- **AND** `utils/` SHALL remain reserved for generic helpers rather than authoritative business-rule implementations

#### Scenario: Equivalent slice responsibilities use aligned naming
- **WHEN** multiple feature slices implement the same kind of responsibility such as create-default helpers, primary form hooks, or primary write validators
- **THEN** those responsibilities SHALL use aligned naming across features unless a documented exception requires otherwise
- **AND** one feature slice SHALL NOT keep ad hoc names for an equivalent responsibility when the repository already has a clearer house convention

#### Scenario: Feature barrels expose a consistent public surface
- **WHEN** a feature slice defines its public `index.ts` barrel
- **THEN** the barrel SHALL expose the categories of public API that top-level consumers need in a consistent way across equivalent feature slices
- **AND** the barrel SHALL avoid leaking implementation-only modules merely because another slice does so
- **AND** equivalent top-level consumers such as route files SHALL not need feature-specific knowledge of unrelated internal export differences

#### Scenario: Specialized validation boundaries stay descriptive
- **WHEN** a feature exports an additional validator for a distinct post-resolution or server-only validation boundary
- **THEN** that export MAY keep a more specific descriptive name instead of reusing the primary `validate<Feature>WriteRules` entrypoint name
- **AND** the specialized validator SHALL remain clearly scoped to its distinct validation boundary

#### Scenario: Shared code remains generic
- **WHEN** reusable infrastructure is added for multiple features
- **THEN** the `shared/` layer SHALL own only generic primitives, helpers, and infrastructure that are not tied to one feature's domain rules
- **AND** feature-specific logic SHALL remain inside the feature until a stable abstraction is proven

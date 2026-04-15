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
- **AND** exported rule entrypoints SHALL use a `validate...` prefix
- **AND** private helpers in `rules.ts` that return a single `ValidationIssue` or `null` SHALL use a `get...Issue` name
- **AND** `utils/` SHALL remain reserved for generic helpers rather than authoritative business-rule implementations

#### Scenario: Shared code remains generic
- **WHEN** reusable infrastructure is added for multiple features
- **THEN** the `shared/` layer SHALL own only generic primitives, helpers, and infrastructure that are not tied to one feature's domain rules
- **AND** feature-specific logic SHALL remain inside the feature until a stable abstraction is proven

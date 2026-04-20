## MODIFIED Requirements

### Requirement: Feature validation concerns use a canonical boundary
The system SHALL organize feature validation concerns using a canonical boundary so schemas, normalization helpers, pure validation helpers, Prisma-backed lookup resolution, and form-hook orchestration have distinct ownership.

#### Scenario: Form-side schema names communicate input intent
- **WHEN** a feature defines request-shape contracts in `schemas/form.ts`
- **THEN** create, update, id, and other server-facing request schemas SHALL use `camelCase` names ending in `InputSchema`
- **AND** inferred types from those schemas SHALL use matching `PascalCase` names ending in `Input`
- **AND** concise unsuffixed domain names such as `contractSchema` or `Contract` SHALL remain reserved for read-model contracts in `schemas/model.ts`

#### Scenario: Form schema consumes only pure helpers
- **WHEN** a feature defines a create or update form schema
- **THEN** the schema SHALL use Zod request-shape validation and schema-level refinements that do not require database access
- **AND** the schema SHALL consume only pure helpers that are safe to execute without Prisma or persisted resource lookups

#### Scenario: Pure business validation stays outside lookup resolution
- **WHEN** a feature defines reusable business validation helpers for form writes
- **THEN** those helpers SHALL live separately from Prisma-backed lookup resolution
- **AND** they SHALL be reusable by schemas or server handlers without requiring data access
- **AND** helpers that report field-level validation problems SHALL return `ValidationIssue` objects directly rather than message-only fragments
- **AND** a form schema consuming the primary feature write validator SHALL use the feature-local `validate<Feature>WriteRules` entrypoint

#### Scenario: Form hook submits the validated payload consistently
- **WHEN** a feature form hook coordinates create or update submission after schema validation
- **THEN** the hook SHALL pass the parsed validated payload to the mutation boundary instead of mixing reparsing-plus-casting and parsed-payload submission styles across slices
- **AND** create-versus-update branching, cache refresh, and toast feedback SHALL remain the hook's responsibility

#### Scenario: Normalization stays separate from validation
- **WHEN** a feature canonicalizes submitted input values before validation or persistence
- **THEN** that normalization logic SHALL be defined separately from business validation helpers
- **AND** the canonicalized values SHALL be used consistently by the consuming schema or server handler

### Requirement: Feature quality checks cover the aligned slice contract
The system SHALL verify the aligned feature-slice contract through tests that cover the minimum expected boundary behavior for each slice.

#### Scenario: Validation boundaries are always covered
- **WHEN** a feature slice exposes schema and rules boundaries
- **THEN** the slice SHALL include tests for the schema contract and the pure rules contract at minimum

#### Scenario: Standardized orchestration behavior is tested when touched
- **WHEN** a change standardizes orchestration-critical feature behavior such as form-hook submission flow or public barrel usage assumptions
- **THEN** the affected slice SHALL add or update targeted tests that protect the standardized behavior from drifting again

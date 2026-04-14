## MODIFIED Requirements

### Requirement: Feature validation concerns use a canonical boundary
The system SHALL organize feature validation concerns using a canonical boundary so schemas, normalization helpers, pure validation helpers, and Prisma-backed lookup resolution have distinct ownership.

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

#### Scenario: Normalization stays separate from validation
- **WHEN** a feature canonicalizes submitted input values before validation or persistence
- **THEN** that normalization logic SHALL be defined separately from business validation helpers
- **AND** the canonicalized values SHALL be used consistently by the consuming schema or server handler

### Requirement: Feature orchestration hooks do not duplicate schema validation
The system SHALL keep feature hooks orchestration-only so they do not re-run the same schema validation already performed by the form layer.

#### Scenario: Hook submits validated form values without reparsing them
- **WHEN** a feature form has already validated submitted data
- **THEN** the feature hook SHALL pass the validated value to the mutation boundary without parsing the same shape again
- **AND** the hook SHALL still handle create-versus-update branching, cache refresh, and toast feedback

#### Scenario: Hook remains responsible for orchestration only
- **WHEN** a feature hook coordinates a write flow
- **THEN** it MAY choose the correct mutation and refresh affected queries
- **AND** it SHALL NOT become a second copy of the form schema validation layer

### Requirement: Lookup-backed writes resolve and verify selections at the server boundary
The system SHALL resolve lookup-backed form selections on the server boundary before persistence and SHALL keep persistence-aware lookup checks separate from pure validation helpers.

#### Scenario: Create flow resolves lookup values on the server
- **WHEN** a create mutation receives lookup-backed form values
- **THEN** the server SHALL resolve the submitted lookup `value` semantics to persisted relational records before writing
- **AND** the server SHALL reject unknown lookup selections with a user-friendly Portuguese error

#### Scenario: Update flow validates persisted lookup selections on the server
- **WHEN** an update mutation receives lookup-backed form values
- **THEN** the server SHALL validate that the submitted lookup selection is allowed for that write
- **AND** any rule that depends on the current persisted record or lookup activity state SHALL execute at the server boundary rather than inside the form schema

#### Scenario: Lookup boundary remains feature-local
- **WHEN** a feature implements lookup-backed form writes
- **THEN** the lookup resolution and lookup-state checks SHALL remain inside that feature slice
- **AND** the implementation SHALL NOT move feature-specific lookup business rules into generic shared modules

### Requirement: Feature server handlers map persistence failures to stable user-facing messages
The system SHALL translate known persistence failures into stable pt-BR messages and SHALL avoid branching on arbitrary substring matches in exception text.

#### Scenario: Unique constraint failure becomes a stable field-level message
- **WHEN** a feature server handler receives a known uniqueness violation from Prisma
- **THEN** the handler SHALL map that failure to a stable user-facing Portuguese message
- **AND** the message SHALL identify the business conflict rather than leaking database internals

#### Scenario: Not-found and disallowed lookup states map to explicit user errors
- **WHEN** a feature server handler resolves a missing, inactive, or otherwise disallowed lookup-backed selection
- **THEN** the handler SHALL return an explicit Portuguese error that describes the invalid selection
- **AND** the handler SHALL NOT rely on substring matching of unrelated exception text to decide the message

#### Scenario: Unexpected failures stay generic and safe
- **WHEN** a feature server handler encounters an unexpected persistence failure
- **THEN** the handler SHALL return a safe generic error message to the user
- **AND** the internal error SHALL remain available only in server-side logs


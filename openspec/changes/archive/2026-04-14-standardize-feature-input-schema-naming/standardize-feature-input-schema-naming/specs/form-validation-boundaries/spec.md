## MODIFIED Requirements

### Requirement: Feature form concerns use a canonical boundary
The system SHALL organize form-related feature concerns using a canonical boundary so schemas, normalization helpers, pure validation helpers, and Prisma-backed lookup resolution have distinct ownership.

#### Scenario: Form-side schema names communicate input intent
- **WHEN** a feature defines request-shape contracts in `schemas/form.ts`
- **THEN** create, update, id, and other server-facing request schemas SHALL use `camelCase` names ending in `InputSchema`
- **AND** inferred types from those schemas SHALL use matching `PascalCase` names ending in `Input`
- **AND** concise unsuffixed domain names such as `contractSchema` or `Contract` SHALL remain reserved for read-model contracts in `schemas/model.ts`

#### Scenario: Form schema consumes only pure helpers
- **WHEN** a feature defines a create or update form schema
- **THEN** the schema uses Zod request-shape validation and schema-level refinements that do not require database access
- **AND** the schema consumes only pure helpers that are safe to execute without Prisma or persisted resource lookups

#### Scenario: Pure business validation stays outside lookup resolution
- **WHEN** a feature defines reusable business validation helpers for form writes
- **THEN** those helpers live separately from Prisma-backed lookup resolution
- **AND** they can be reused by schemas or server handlers without requiring data access

#### Scenario: Normalization stays separate from validation
- **WHEN** a feature canonicalizes submitted input values before validation or persistence
- **THEN** that normalization logic is defined separately from business validation helpers
- **AND** the canonicalized values are used consistently by the consuming schema or server handler

### Requirement: Lookup-backed writes resolve and verify selections at the server boundary
The system SHALL resolve lookup-backed form selections on the server boundary before persistence and SHALL keep persistence-aware lookup checks separate from pure validation helpers.

#### Scenario: Create flow resolves lookup values on the server
- **WHEN** a create mutation receives lookup-backed form values
- **THEN** the server resolves the submitted lookup `value` semantics to persisted relational records before writing
- **AND** the server rejects unknown lookup selections with a user-friendly Portuguese error

#### Scenario: Update flow validates persisted lookup selections on the server
- **WHEN** an update mutation receives lookup-backed form values
- **THEN** the server validates that the submitted lookup selection is allowed for that write
- **AND** any rule that depends on the current persisted record or lookup activity state executes at the server boundary rather than inside the form schema

#### Scenario: Lookup boundary remains feature-local
- **WHEN** a feature implements lookup-backed form writes
- **THEN** the lookup resolution and lookup-state checks remain inside that feature slice
- **AND** the implementation does not move feature-specific lookup business rules into generic shared modules

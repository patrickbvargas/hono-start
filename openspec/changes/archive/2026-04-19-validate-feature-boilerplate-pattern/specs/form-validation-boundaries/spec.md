## MODIFIED Requirements

### Requirement: Feature validation concerns use a canonical boundary
The system SHALL organize feature validation concerns using a canonical boundary so schemas, pure assertion helpers, Prisma-backed lookup resolution, persistence-aware checks, read-model mapping, and form-hook orchestration have distinct ownership.

#### Scenario: Form-side schema names communicate input intent
- **WHEN** a feature defines request-shape contracts in `schemas/form.ts`
- **THEN** create, update, id, and other server-facing request schemas SHALL use `camelCase` names ending in `InputSchema`
- **AND** inferred types from those schemas SHALL use matching `PascalCase` names ending in `Input`
- **AND** concise unsuffixed domain names such as `ClientDetail`, `ClientSummary`, or other read-model names SHALL remain reserved for contracts in `schemas/model.ts`

#### Scenario: Form schema consumes only pure helpers
- **WHEN** a feature defines a create or update form schema
- **THEN** the schema SHALL use Zod request-shape validation and schema-level refinements that do not require database access
- **AND** the schema SHALL consume only pure helpers that are safe to execute without Prisma or persisted resource lookups
- **AND** exported pure assertion entrypoints that throw on invalid state SHALL use an `assert...` prefix when the feature follows the `clients` reference pattern

#### Scenario: Pure business assertions stay outside lookup resolution
- **WHEN** a feature defines reusable business assertions for form writes
- **THEN** those helpers SHALL live separately from Prisma-backed lookup resolution
- **AND** they SHALL be reusable by schemas or server handlers without requiring data access
- **AND** exported assertion entrypoints that throw on invalid state SHALL use an `assert...` prefix
- **AND** assertion failures SHALL use safe pt-BR business messages rather than internal diagnostic text

#### Scenario: Form hook submits the parsed payload consistently
- **WHEN** a feature form hook coordinates create or update submission after schema validation
- **THEN** the hook SHALL submit the parsed payload to the mutation boundary
- **AND** create-versus-update branching, cache refresh, toast feedback, and edit-default hydration SHALL remain the hook's responsibility
- **AND** the route and form component SHALL remain free of persistence orchestration details

#### Scenario: Form hook options and mutation parameters are explicit
- **WHEN** a feature form hook or mutation option factory accepts caller-provided values
- **THEN** hook options SHALL be passed as named object parameters when optional values or callbacks exist
- **AND** mutation payloads SHALL preserve the parsed input type from `schemas/form.ts`
- **AND** update flows SHALL include resource identity and parsed data in an explicit shape rather than relying on positional arguments

#### Scenario: Validation and submit branches use braced control flow
- **WHEN** schemas, hooks, API wrappers, or data mutations use conditional validation or submit branching
- **THEN** every `if` statement SHALL use braces
- **AND** inline braceless early returns SHALL NOT be used in the synchronized validation boundary

#### Scenario: Lookup-backed writes resolve selections at the server boundary
- **WHEN** a create or update mutation receives lookup-backed form values
- **THEN** the server SHALL resolve the submitted lookup `value` semantics to persisted relational records before writing
- **AND** any rule that depends on persisted state or lookup activity SHALL execute at the server boundary rather than inside the form schema

#### Scenario: Server wrappers stay separate from persistence modules
- **WHEN** a feature implements route-facing reads or writes
- **THEN** route-facing server functions and React Query option factories SHALL live in the feature `api/` modules
- **AND** Prisma-backed reads, writes, lookup access, and persistence-aware checks SHALL live in feature-local `data/` modules
- **AND** the feature form hook and route SHALL consume the `api/` surface rather than importing persistence modules directly

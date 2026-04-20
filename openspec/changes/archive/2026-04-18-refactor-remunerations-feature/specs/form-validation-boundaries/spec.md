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
- **AND** exported pure assertion entrypoints that throw on invalid state SHALL use an `assert...` prefix when the feature follows the `clients_v2` reference pattern

#### Scenario: Pure business assertions stay outside lookup resolution
- **WHEN** a feature defines reusable business assertions for form writes
- **THEN** those helpers SHALL live separately from Prisma-backed lookup resolution
- **AND** they SHALL be reusable by schemas or server handlers without requiring data access
- **AND** exported assertion entrypoints that throw on invalid state SHALL use an `assert...` prefix

#### Scenario: Read models are mapped before schema parsing
- **WHEN** a feature reads persisted data for list or detail views
- **THEN** the feature SHALL map raw Prisma rows into the feature read-model shape before parsing with `schemas/model.ts`
- **AND** lookup-backed read fields SHALL expose UI-ready labels when rendered to users
- **AND** stable lookup `value` fields SHALL remain available alongside labels when the feature needs them for edits or downstream write flows

#### Scenario: Form hook submits the parsed payload consistently
- **WHEN** a feature form hook coordinates create or update submission after schema validation
- **THEN** the hook SHALL submit the parsed payload to the mutation boundary
- **AND** create-versus-update branching, cache refresh, toast feedback, and edit-default hydration SHALL remain the hook's responsibility

#### Scenario: Contract form hook submits and hydrates through canonical feature boundaries
- **WHEN** the contracts feature form hook coordinates create or update submission after schema validation
- **THEN** the hook SHALL submit the parsed payload to the contract mutation boundary
- **AND** create-versus-update branching, cache refresh, toast feedback, and edit-default hydration SHALL remain the hook's responsibility
- **AND** edit hydration SHALL use a feature-owned contract detail query rather than a route-supplied row object

#### Scenario: Lookup-backed writes resolve selections at the server boundary
- **WHEN** a create or update mutation receives lookup-backed form values
- **THEN** the server SHALL resolve the submitted lookup `value` semantics to persisted relational records before writing
- **AND** any rule that depends on persisted state or lookup activity SHALL execute at the server boundary rather than inside the form schema

#### Scenario: Server wrappers stay separate from persistence modules
- **WHEN** a feature implements route-facing reads or writes
- **THEN** route-facing server functions and React Query option factories SHALL live in the feature `api/` modules
- **AND** Prisma-backed reads, writes, lookup access, and persistence-aware checks SHALL live in feature-local `data/` modules
- **AND** the feature form hook and route SHALL consume the `api/` surface rather than importing persistence modules directly

#### Scenario: Contract server wrappers stay separate from persistence modules
- **WHEN** the contracts feature implements route-facing reads or writes
- **THEN** route-facing server functions and React Query option factories SHALL live in `src/features/contracts/api/queries.ts` and `src/features/contracts/api/mutations.ts`
- **AND** Prisma-backed contract reads, writes, lookup access, and persistence-aware checks SHALL live in `src/features/contracts/data/queries.ts` and `src/features/contracts/data/mutations.ts`
- **AND** the contract form hook and `/contratos` route SHALL consume the `api/` surface rather than importing persistence modules directly

#### Scenario: Contract read models are mapped before schema parsing
- **WHEN** the contracts feature reads persisted data for list or detail views
- **THEN** the feature SHALL map raw Prisma rows into explicit contract summary or detail models before parsing with `schemas/model.ts`
- **AND** lookup-backed read fields SHALL expose UI-ready labels when rendered to users
- **AND** stable lookup `value` fields SHALL remain available alongside labels when the feature needs them for edit defaults or downstream write flows

#### Scenario: Remuneration server wrappers stay separate from persistence modules
- **WHEN** the remunerations feature implements route-facing reads, exports, or writes
- **THEN** route-facing server functions and React Query option factories SHALL live in `src/features/remunerations/api/queries.ts` and `src/features/remunerations/api/mutations.ts`
- **AND** Prisma-backed remuneration reads, writes, option loading, access-resource loading, and persistence-aware checks SHALL live in `src/features/remunerations/data/queries.ts` and `src/features/remunerations/data/mutations.ts`
- **AND** remuneration hooks and routes SHALL consume the `api/` surface rather than importing persistence modules directly

#### Scenario: Remuneration pure business assertions use the canonical assert boundary
- **WHEN** the remunerations feature defines reusable write rules that do not require Prisma
- **THEN** exported pure rule entrypoints SHALL live under `src/features/remunerations/rules/`
- **AND** exported pure rule entrypoints SHALL use an `assert...` prefix
- **AND** exported pure rule entrypoints SHALL throw when the asserted invariant fails
- **AND** non-throwing validation collectors SHALL NOT be exported from the remuneration rules boundary

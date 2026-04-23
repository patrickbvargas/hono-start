## ADDED Requirements

### Requirement: Automated tests protect documented architecture boundaries
The test suite SHALL verify that live application code follows the documented repository architecture, import boundaries, feature ownership rules, and shared UI vendor boundary.

#### Scenario: Routes consume feature public surfaces
- **WHEN** the architecture guardrail tests inspect route source files
- **THEN** routes SHALL import feature behavior through documented public feature barrels
- **AND** routes SHALL NOT import feature-internal `data/`, `rules/`, `hooks/`, `schemas/`, or component implementation modules directly

#### Scenario: Routes avoid persistence ownership
- **WHEN** the architecture guardrail tests inspect route source files
- **THEN** routes SHALL NOT import Prisma, construct Prisma filters, or call feature persistence modules directly
- **AND** routes SHALL remain limited to composition, search validation, loader prefetching, authorization wiring, and overlay wiring

#### Scenario: Feature and route UI imports use the shared UI boundary
- **WHEN** the architecture guardrail tests inspect feature and route source files
- **THEN** reusable UI primitives SHALL be imported through `@/shared/components/ui` or documented shared composites
- **AND** feature and route source files SHALL NOT import shadcn, Radix, Base UI, React Aria, or other vendor UI primitives directly

#### Scenario: Feature slice conventions remain executable
- **WHEN** the architecture guardrail tests inspect feature source files
- **THEN** they SHALL continue to verify top-level-only feature barrels, braced `if` statements, local component props interfaces, canonical option-factory suffixes, and rule export naming
- **AND** test failures SHALL identify the violating file path and rule

### Requirement: Automated tests cover feature schema and search contracts
The test suite SHALL verify feature-local schemas, defaults, filter behavior, sort behavior, model contracts, and pure utilities for principal feature slices and shared query contracts.

#### Scenario: Search schemas apply safe URL defaults
- **WHEN** a feature search schema parses empty or malformed URL-driven list state
- **THEN** the parsed search state SHALL fall back to documented safe defaults for pagination, sorting, status, active state, and feature filters
- **AND** invalid values SHALL NOT reach data query construction

#### Scenario: Sort schemas preserve allowed columns and directions
- **WHEN** a feature sort schema receives unsupported columns or directions
- **THEN** the schema SHALL recover to the feature's documented default sort behavior
- **AND** route-backed list queries SHALL receive only allowed sort fields

#### Scenario: Model schemas validate UI-ready read contracts
- **WHEN** feature list or detail models are parsed in tests
- **THEN** schemas SHALL accept UI-ready mapped fields used by routes and components
- **AND** schemas SHALL reject missing required fields that would break edit defaults, details drawers, tables, or filters

#### Scenario: Utility tests preserve formatting and normalization contracts
- **WHEN** feature utility helpers normalize, default, format, or export values
- **THEN** tests SHALL verify documented pt-BR formatting, empty-value normalization, stable default values, CSV escaping, PDF text escaping, and filename behavior where those helpers exist

### Requirement: Automated tests cover business rules and validation boundaries
The test suite SHALL verify pure business assertions and database-free form validation separately from persisted lookup and state checks.

#### Scenario: Pure rules throw safe business errors
- **WHEN** a feature pure rule receives invalid domain input
- **THEN** it SHALL throw a safe feature-local pt-BR error message
- **AND** it SHALL NOT require Prisma or persisted lookup access

#### Scenario: Form schemas validate request shape before server work
- **WHEN** create, update, id, search, or export input schemas receive invalid request data
- **THEN** schemas SHALL reject the payload before business logic or persistence logic executes
- **AND** database-backed lookup activity rules SHALL remain outside form schemas

#### Scenario: Persisted lookup rules execute at the server boundary
- **WHEN** a write receives lookup-backed values such as client type, employee type, role, contract status, legal area, assignment type, or revenue type
- **THEN** tests SHALL verify the server/data boundary resolves submitted stable lookup `value` semantics before writing
- **AND** unknown or inactive lookup selections SHALL fail with safe feature-local messages unless the unchanged inactive persisted selection is explicitly allowed

### Requirement: Automated tests cover data access and lifecycle behavior
The test suite SHALL verify tenant-scoped queries, deterministic ordering, soft-delete semantics, transaction use, auditability, and lifecycle side effects at the data/API boundary.

#### Scenario: List queries are tenant-scoped and deterministic
- **WHEN** a feature list query builds persistence calls
- **THEN** tests SHALL verify the query scopes results by the authenticated firm
- **AND** default live queries SHALL filter soft-deleted records unless deleted records are explicitly requested
- **AND** paginated sorting SHALL include a stable tiebreaker

#### Scenario: Option queries apply documented active and lookup behavior
- **WHEN** tests exercise entity option queries and lookup option queries
- **THEN** entity option queries SHALL filter deleted and inactive entities
- **AND** lookup option queries SHALL return lookup rows sorted by label so inactive values can be disabled in the UI rather than hidden from edit defaults

#### Scenario: Lifecycle mutations preserve soft-delete and restore semantics
- **WHEN** delete and restore data mutations execute
- **THEN** delete mutations SHALL set `deletedAt` rather than permanently deleting business records
- **AND** restore mutations SHALL clear `deletedAt`
- **AND** blocked delete conditions such as active dependents SHALL prevent persistence writes

#### Scenario: Multi-step writes use transactions and audit logs
- **WHEN** create, update, delete, restore, cascade, or remuneration-generating writes touch multiple persistence concerns
- **THEN** tests SHALL verify the write uses a transaction boundary
- **AND** successful business mutations SHALL create audit-log entries with actor, firm, entity, action, and change data

#### Scenario: Fee and remuneration side effects remain consistent
- **WHEN** fee creation, update, delete, or restore is tested
- **THEN** remuneration generation, recalculation, manual override preservation, soft-delete synchronization, and contract auto-completion behavior SHALL match the documented fee lifecycle rules

### Requirement: Automated tests cover authorization and safe server boundaries
The test suite SHALL verify that protected server operations enforce session-derived role, actor, and firm scope instead of trusting client-submitted authority.

#### Scenario: Server wrappers use session-derived scope
- **WHEN** tests exercise route-facing server wrappers or their extracted behavior
- **THEN** protected operations SHALL derive actor, role, and firm scope from the logged session
- **AND** client-submitted tenant or authority claims SHALL NOT be trusted

#### Scenario: Unauthorized access fails safely
- **WHEN** a regular user attempts an administrator-only operation or cross-firm resource access
- **THEN** the operation SHALL fail before persistence writes
- **AND** the thrown error SHALL be safe and user-facing rather than a leaked database or stack-trace message

#### Scenario: Known infrastructure errors map to feature-local messages
- **WHEN** server boundary tests simulate known Prisma unique constraint or expected feature errors
- **THEN** the API boundary SHALL map them to the documented safe feature-local error messages
- **AND** unknown errors SHALL map to generic safe failure messages

### Requirement: Automated tests cover frontend orchestration states
The test suite SHALL verify feature hooks and components that coordinate forms, filters, tables, overlays, cache refresh, and user feedback.

#### Scenario: Form hooks own create and update orchestration
- **WHEN** tests exercise feature form hooks
- **THEN** the hook SHALL select create or update behavior based on mode
- **AND** it SHALL submit parsed schema payloads to mutation option factories
- **AND** it SHALL handle edit-default hydration, toast feedback, and query invalidation without moving persistence orchestration into routes

#### Scenario: Delete and restore hooks expose stable confirmation handlers
- **WHEN** tests exercise delete and restore hooks
- **THEN** each hook SHALL expose `handleConfirm(id)` behavior for the current overlay id
- **AND** successful mutations SHALL call supplied `onSuccess` callbacks and refresh the correct feature cache domain

#### Scenario: Filter controls preserve URL-driven list state
- **WHEN** tests exercise feature filter components or hooks
- **THEN** filter changes SHALL update route search state in the documented shape
- **AND** reset behavior SHALL return filters, sort, and pagination to safe defaults

#### Scenario: Tables render operational states explicitly
- **WHEN** tests render feature table components
- **THEN** loading, empty, error, active, inactive, and soft-deleted states SHALL be explicit
- **AND** lifecycle row actions SHALL respect `canManageLifecycle` and feature-specific edit/delete/restore rules

#### Scenario: Entity routes keep orchestration declarative
- **WHEN** route composition is tested or source-scanned
- **THEN** route files SHALL validate search state, prefetch route-consumed query options, mount feature UI, and wire shared overlays
- **AND** route files SHALL NOT duplicate feature business rules, mutation orchestration, or Prisma query construction

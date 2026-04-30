## Purpose

Define the remuneration feature's pure write-validation boundary so schema validation, canonical business assertions, persisted resource checks, and canonical slice boundaries stay separated and discoverable.

## Requirements

### Requirement: Remuneration writes preserve the shared form-validation boundary
The system SHALL apply the shared form-validation boundary to remuneration writes so schema validation, pure business assertions, and persisted resource checks remain consistently separated.

#### Scenario: Pure remuneration business assertions are discoverable from the rules directory
- **WHEN** a contributor needs to change a remuneration business rule that does not require Prisma
- **THEN** the authoritative implementation SHALL be discoverable under `src/features/remunerations/rules/`
- **AND** exported rule entrypoints SHALL use an `assert...` prefix
- **AND** exported rule entrypoints SHALL throw when the asserted invariant fails

#### Scenario: Remuneration API writes use the canonical rules directory
- **WHEN** the remuneration update flow enforces pure remuneration business rules
- **THEN** those rules SHALL reuse modules under `src/features/remunerations/rules/`
- **AND** current-record access and persisted-state checks SHALL remain outside the pure rules directory

#### Scenario: Remuneration schema parse remains authoritative for pure write validation
- **WHEN** the remuneration update schema successfully parses a submitted payload
- **THEN** that payload SHALL be valid for the feature's pure remuneration assertions
- **AND** any remaining server-side remuneration checks SHALL be limited to current-record access, permissions, or persisted-state concerns

#### Scenario: Remuneration validation tests are colocated with the feature
- **WHEN** the remuneration validation boundary is implemented or updated
- **THEN** focused tests SHALL live in feature-local `__tests__` folders
- **AND** those tests SHALL cover the schema parse boundary plus the canonical remuneration assertions

### Requirement: Remuneration feature follows the canonical slice boundary
The system SHALL organize the remuneration feature using the same route-facing API, Prisma-backed data, rules, schemas, hooks, components, constants, utils, and public barrel boundaries as the documented reference feature slices.

#### Scenario: Route-facing query and mutation wrappers live in canonical API modules
- **WHEN** routes, hooks, or feature components need remuneration query or mutation option factories
- **THEN** the route-facing server functions and option factories SHALL be provided from `src/features/remunerations/api/queries.ts` or `src/features/remunerations/api/mutations.ts`
- **AND** obsolete split API modules SHALL NOT remain as a second supported pattern

#### Scenario: Prisma-backed remuneration reads live in data queries
- **WHEN** the remuneration feature reads lists, details, selectable contracts, selectable employees, or access resources
- **THEN** Prisma-backed query construction, persisted resource loading, option mapping, and read-model mapping SHALL live in `src/features/remunerations/data/queries.ts`

#### Scenario: Prisma-backed remuneration writes live in data mutations
- **WHEN** the remuneration feature updates, deletes, or restores a remuneration
- **THEN** Prisma-backed write operations and persisted-state guards SHALL live in `src/features/remunerations/data/mutations.ts`
- **AND** route-facing mutation handlers SHALL delegate persistence work to that data module

#### Scenario: Public remuneration barrel stays route-facing
- **WHEN** external code imports from the remuneration feature
- **THEN** imports SHALL go through `src/features/remunerations/index.ts`
- **AND** the barrel SHALL expose only route-consumed query option factories, feature UI components, route-consumed types, and search schemas
- **AND** internal `data/`, `rules/`, and implementation-only helpers SHALL NOT be exported by default

### Requirement: Remuneration behavior is preserved through the refactor
The system SHALL preserve existing remuneration product behavior while changing the feature's internal organization.

#### Scenario: List and detail visibility remains role-aware
- **WHEN** an administrator loads remuneration lists or details
- **THEN** the system SHALL return remunerations in the administrator's firm according to the submitted filters
- **AND** when a regular user loads remuneration lists or details
- **THEN** the system SHALL return only remunerations scoped to that user's employee identity and firm

#### Scenario: Manual override update remains administrator-controlled
- **WHEN** an authorized administrator updates remuneration amount or effective percentage
- **THEN** the system SHALL persist the submitted values and mark the remuneration as a manual override
- **AND** when an unauthorized user attempts the same action
- **THEN** the server SHALL reject the mutation before persistence

#### Scenario: Deleted remuneration and deleted parent fee guards remain enforced
- **WHEN** a user attempts to edit a soft-deleted remuneration or a remuneration whose parent fee is soft-deleted
- **THEN** the system SHALL reject the update with the existing Portuguese feature error
- **AND** when a user attempts to restore a remuneration whose parent fee is soft-deleted
- **THEN** the system SHALL reject the restore with the existing Portuguese feature error

#### Scenario: Export uses the same scope as the on-screen list
- **WHEN** a user exports remunerations with filters and sorting
- **THEN** the exported data SHALL use the same session-derived firm, role, employee scope, filters, and ordering as the on-screen remuneration list

### Requirement: List remunerations
The system SHALL display a paginated, sortable, filterable list of remunerations available to the authenticated user, following the shared entity-management list contract and the remuneration visibility rules defined by role and employee scope.

#### Scenario: Administrator sees firm-wide remunerations
- **WHEN** an administrator navigates to the remunerations route
- **THEN** the system displays remunerations belonging to the administrator's firm

#### Scenario: Regular user sees only own remunerations
- **WHEN** a regular authenticated user navigates to the remunerations route
- **THEN** the system displays only remunerations in the same firm that belong to that user's employee identity

#### Scenario: Query by parent contract number or collaborator name
- **WHEN** a user enters a free-text query in the remunerations list
- **THEN** the system matches remunerations whose parent contract process number contains the query text
- **AND** the system also matches remunerations whose collaborator name contains the query text
- **AND** the existing firm scope and employee visibility rules remain enforced

#### Scenario: Filter by employee, contract, and payment date
- **WHEN** a user applies supported structured filters such as employee, contract, or payment date range
- **THEN** the system combines those filters with the free-text query deterministically

#### Scenario: Sort and pagination state persist in the URL
- **WHEN** a user changes sorting, filtering, or page
- **THEN** the URL search params are updated to reflect the current state
- **AND** refreshing the page preserves the same remunerations view

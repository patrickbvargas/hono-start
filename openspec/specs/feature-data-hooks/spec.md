## Purpose

Define the route-facing data hook and query key boundaries for feature page data.

## Requirements

### Requirement: Feature page data is consumed through feature-local data hooks
The system SHALL provide feature-local page data hooks for routes that consume primary route data during render.

#### Scenario: Route consumes primary page data
- **WHEN** a route component needs the primary data already prefetched by its loader
- **THEN** the route SHALL consume that data through a route-facing feature hook named `useXData`
- **AND** the hook SHALL live in `src/features/<feature>/hooks/use-data.ts`
- **AND** `X` SHALL identify the owning feature or screen in PascalCase

#### Scenario: Route still prefetches with query options
- **WHEN** a route loader prefetches primary page data
- **THEN** the loader SHALL continue using the feature's `get...QueryOptions` factory with `queryClient.ensureQueryData`
- **AND** the loader SHALL NOT depend on a React hook to fetch data

#### Scenario: Feature data hook returns named data
- **WHEN** a `useXData` hook returns data to a route or feature component
- **THEN** it SHALL return named fields that match the feature data contract
- **AND** the caller SHALL NOT need to know the underlying React Query result shape for ordinary route rendering

#### Scenario: Feature consumes option data
- **WHEN** a feature form, filter, or component consumes feature option query data
- **THEN** the feature SHALL expose the option query hook from `src/features/<feature>/hooks/use-data.ts`
- **AND** existing option hook names such as `useXOptions` SHALL remain separate from `useXData`
- **AND** the feature SHALL NOT keep a separate `hooks/use-options.ts` file

#### Scenario: Feature consumes multiple unconditional suspense option queries
- **WHEN** a feature option hook consumes multiple option queries that are all required immediately
- **THEN** the hook SHALL use one `useSuspenseQueries` call
- **AND** it SHALL NOT use multiple separate `useSuspenseQuery` calls for equivalent option loading

### Requirement: Query option factories remain the reusable query boundary
The system SHALL keep React Query option factories as the reusable query boundary for hooks, loaders, tests, and cache operations.

#### Scenario: Data hook loads query data
- **WHEN** a `useXData` hook consumes TanStack Query data
- **THEN** it SHALL call the existing feature `get...QueryOptions` factory
- **AND** it SHALL NOT duplicate query keys, query functions, stale times, or server function calls

#### Scenario: Query options are needed outside render
- **WHEN** loaders, mutation orchestration, tests, or cache utilities need query keys or query functions
- **THEN** they SHALL continue consuming feature `get...QueryOptions` factories
- **AND** the feature SHALL keep those factories available through its route-facing public surface when top-level consumers require them

### Requirement: Feature query keys are centrally managed
The system SHALL manage query key shapes through feature-owned query key factories.

#### Scenario: Feature defines multiple related query keys
- **WHEN** a feature has list, detail, option, or other related query variants
- **THEN** the feature SHALL define its key factory in `src/features/<feature>/api/queries.ts`
- **AND** query option factories SHALL consume the centralized key shape instead of inventing unrelated inline roots

#### Scenario: Query inputs change loaded data
- **WHEN** validated route search state or other query input changes the loaded data
- **THEN** the changed input SHALL remain represented in the query key
- **AND** the system SHALL rely on the query key change to load the matching data

#### Scenario: Feature invalidates broad query data
- **WHEN** a feature mutation flow refreshes broad feature query data after a successful mutation
- **THEN** it SHALL invalidate using the feature key factory root such as `featureKeys.all`
- **AND** the feature SHALL NOT export or define a separate raw root cache key constant

### Requirement: Data hooks preserve feature and route ownership boundaries
The system SHALL keep feature data hooks limited to client-side query consumption and route data orchestration.

#### Scenario: Data hook is implemented
- **WHEN** a feature implements `hooks/use-data.ts`
- **THEN** the hook SHALL NOT contain server functions, Prisma access, authorization decisions, business assertions, or persistence mapping
- **AND** those responsibilities SHALL remain in the existing feature API, data, rules, and schema boundaries

#### Scenario: Data hook is exposed to routes
- **WHEN** a route needs a feature `useXData` hook
- **THEN** the hook SHALL be exported through the feature's top-level public barrel
- **AND** the route SHALL NOT import the hook from the feature's internal `hooks/` path

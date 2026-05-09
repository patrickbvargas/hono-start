## MODIFIED Requirements

### Requirement: Feature page data is consumed through feature-local data hooks
The system SHALL provide feature-local data hooks for routes and feature components that consume feature query data during render, and equivalent query concerns SHALL use the same hook semantics across feature slices.

#### Scenario: Route consumes primary page data
- **WHEN** a route component needs the primary data already prefetched by its loader
- **THEN** the route SHALL consume that data through a route-facing feature hook
- **AND** the hook SHALL live in `src/features/<feature>/hooks/use-data.ts`

#### Scenario: Feature component consumes entity data
- **WHEN** a feature component needs entity detail, lifecycle confirmation, or equivalent feature-owned query data during render
- **THEN** the component SHALL consume that data through a feature-local custom hook from `src/features/<feature>/hooks/use-data.ts`
- **AND** the component SHALL NOT call `useQuery` or `useSuspenseQuery` directly for that feature-owned data read

#### Scenario: Collection and entity data hooks use concise names
- **WHEN** a feature exposes route-facing or component-facing collection and single-entity data hooks
- **THEN** collection hooks SHALL prefer plural names such as `useClients(search)`, `useEmployees(search)`, or `useContracts(search)`
- **AND** single-entity hooks SHALL prefer singular names such as `useClient(id)`, `useEmployee(id)`, or `useContract(id)`
- **AND** screen-specific names such as `useDashboardData(search)` SHALL remain valid when the consumer is screen-oriented rather than entity-oriented

#### Scenario: Route still prefetches with query options
- **WHEN** a route loader prefetches primary page data
- **THEN** the loader SHALL continue using the feature's `get...QueryOptions` factory with `queryClient.ensureQueryData`
- **AND** the loader SHALL NOT depend on a React hook to fetch data

#### Scenario: Feature data hook returns named data
- **WHEN** a feature data hook returns data to a route or feature component
- **THEN** it SHALL return named fields that match the feature data contract
- **AND** the caller SHALL NOT need to know the underlying React Query result shape for ordinary rendering

#### Scenario: Equivalent collection hooks use suspense consistently
- **WHEN** a feature hook consumes collection or other primary route data that the route prefetches before render
- **THEN** the hook SHALL use `useSuspenseQuery`
- **AND** equivalent feature slices SHALL NOT mix suspense and non-suspense collection-hook behavior for the same concern

#### Scenario: Equivalent single-entity hooks use suspense consistently
- **WHEN** a feature hook consumes an unconditional single-entity read for details, delete, restore, or equivalent overlay hydration
- **THEN** the hook SHALL use `useSuspenseQuery`
- **AND** equivalent feature slices SHALL NOT keep direct non-suspense reads for the same concern without a documented contract reason

#### Scenario: Edit form hydration avoids transient create defaults
- **WHEN** an edit overlay depends on a persisted single-entity read to derive form defaults
- **THEN** the feature SHALL hydrate that edit state through a suspense-first feature data hook before rendering the editable field tree
- **AND** the edit form SHALL NOT briefly render create-mode default values as if they were persisted selections

#### Scenario: Feature consumes option data
- **WHEN** a feature form, filter, or component consumes feature option query data
- **THEN** the feature SHALL expose the option query hook from `src/features/<feature>/hooks/use-data.ts`
- **AND** existing option hook names such as `useXOptions` SHALL remain separate from collection or entity data hooks
- **AND** the feature SHALL NOT keep a separate `hooks/use-options.ts` file

#### Scenario: Feature consumes multiple unconditional suspense option queries
- **WHEN** a feature option hook consumes multiple option queries that are all required immediately
- **THEN** the hook SHALL use one `useSuspenseQueries` call
- **AND** it SHALL NOT use multiple separate `useSuspenseQuery` calls for equivalent option loading

#### Scenario: Mixed option concerns do not weaken the base pattern
- **WHEN** a feature has both unconditional required option data and conditionally enabled option data
- **THEN** the feature SHALL structure its `use-data.ts` hooks so the unconditional option concern still follows the canonical suspense-first pattern
- **AND** the feature SHALL prefer splitting option concerns into smaller hooks over collapsing equivalent concerns into one ad hoc query-consumption pattern

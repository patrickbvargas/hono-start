## Context

The existing `feature-data-hooks` contract standardized route-facing list and screen data hooks in `src/features/<feature>/hooks/use-data.ts`, but the implementation stopped short of feature-component consumers. Several feature components still call `useSuspenseQuery(get...ByIdQueryOptions(id))` or `useQuery(...)` directly inside detail drawers, delete confirmations, restore confirmations, and section-level feature UI.

That leaves the repository in an in-between state:

- routes are mostly declarative and consume feature hooks
- feature hooks already own form, filter, delete, restore, export, and option orchestration
- feature components still partially own raw query consumption

The user goal is to push the query-consumption boundary fully into custom hooks, inspired by Angular-style dependency injection patterns, but without introducing an actual DI container or replacing TanStack Query. In this repository, the closest equivalent is feature-local hook indirection: components depend on a feature-owned hook surface, and the hook surface depends on `api/queries.ts` option factories.

## Goals / Non-Goals

**Goals:**
- Consolidate feature-owned query consumption into `src/features/<feature>/hooks/use-data.ts`.
- Remove direct feature component consumption of TanStack Query hooks for feature data where a feature-local custom hook can own the read contract.
- Add concise entity-shaped hooks that wrap existing query option factories across all participating features, using plural names for collections and singular names for single-entity reads.
- Encourage reuse of one data hook across multiple overlays when they depend on the same entity detail payload.
- Preserve `api/queries.ts` query option factories as the reusable abstraction for loaders, mutations, tests, and imperative cache access.
- Encode the broader rule in boundary tests so new components do not regress to direct query consumption.

**Non-Goals:**
- Do not create a runtime DI container, injectable service registry, or shared global `useData` abstraction.
- Do not move server functions, Prisma access, authorization, or business rules into hooks.
- Do not force every `useQuery` call in the repository into `use-data.ts`; shared session infrastructure and explicitly shared non-feature infrastructure can keep their existing patterns when they are outside feature ownership.
- Do not merge unrelated orchestration concerns into one oversized hook that over-fetches data.

## Decisions

### Keep `api/queries.ts` as the source of truth and treat hooks as consumer facades

Feature data hooks will remain thin wrappers over `get...QueryOptions` factories. The hook layer is a consumer-facing facade, not a second query-definition layer.

This keeps one canonical place for:

- query keys
- query functions
- stale times
- loader prefetching
- cache invalidation references

Alternative considered: expose only custom hooks and stop exporting query option factories. Rejected because route loaders, tests, mutation invalidation, and imperative cache APIs still need query keys and query functions outside React render.

### Expand `use-data.ts` from route data hooks to feature data-consumption hooks

`hooks/use-data.ts` will become the single feature-local home for query-consumption hooks used by feature routes and feature components. This includes:

- collection hooks such as `useClients(search)` or `useEmployees(search)`
- single-entity hooks such as `useClient(id)` or `useEmployee(id)`
- option hooks such as `useClientOptions()`
- small section-level hooks when a feature component owns a query-backed subsection

Alternative considered: split detail hooks into `hooks/use-detail.ts` or move them into each component folder. Rejected because it fragments the orchestration boundary and reintroduces per-component query ownership.

### Prefer concise entity-shaped hook names over generic DI-style services

Hook names should stay explicit and local across all participating features, for example:

- `useClients(search)`
- `useContracts(search)`
- `useEmployee(id)`
- `useContract(id)`
- `useEmployeeOptions()`

The hook contract should describe the screen or entity data it provides rather than a generic service object. This keeps the pattern idiomatic for React while still giving components an injected dependency surface through hooks.

Screen-specific names such as `useDashboardData(search)` remain acceptable where the consumer is not centered on one entity and the screen contract is clearer than singular/plural entity naming.

Alternative considered: create feature-level service hooks that return many methods and queries together. Rejected because broad service objects hide data dependencies, encourage over-fetching, and drift toward a pseudo-container pattern the repository does not use elsewhere.

### Reuse one detail hook across equivalent overlays

Where details, delete, and restore overlays all need the same `get...ByIdQueryOptions(id)` payload, they should share one detail-oriented hook from `use-data.ts` instead of repeating parallel hooks or direct query calls.

Examples:

- `useEmployee(id)` shared by details, delete, and restore components
- `useContract(id)` shared by details, delete, and restore components

Alternative considered: create separate hooks for each overlay such as `useEmployeeDeleteData`. Rejected because it duplicates the same query wrapper without changing the data contract.

### Scope enforcement through boundary tests, not only convention

The current boundary tests only enforce route-level primary page data and option hook placement. This change should extend tests so feature components under `src/features/**/components/**` do not call `useQuery` or `useSuspenseQuery` directly for feature-owned query consumption when an equivalent hook belongs in `hooks/use-data.ts`.

The tests should focus on feature slices, not on shared infrastructure such as session context or shared shell components, because those are outside the feature-slice ownership rule.

Alternative considered: rely on code review and documentation only. Rejected because the existing partial migration happened despite the documented direction, so the contract needs executable enforcement.

## Risks / Trade-offs

- [Hooks become vague service containers] → Mitigation: keep hooks narrowly named around one data contract and continue treating `api/queries.ts` as the canonical query-definition boundary.
- [Hooks over-fetch to satisfy multiple consumers] → Mitigation: share hooks only when overlays already need the same payload; otherwise keep separate narrow hooks.
- [Boundary tests become too broad and flag shared infrastructure] → Mitigation: scope enforcement to feature slices and explicitly exclude shared/session infrastructure from the rule.
- [Developers duplicate query wrappers with inconsistent naming] → Mitigation: standardize naming in the spec and use the existing `use-data.ts` location as the only allowed home.

## Migration Plan

1. Identify direct feature-component TanStack Query consumers that belong to feature-local hook ownership.
2. Add detail and section-level hooks to the matching `hooks/use-data.ts` files without changing query option factories.
3. Update feature components to consume those hooks and remove direct `useQuery` or `useSuspenseQuery` imports where the feature hook now owns the read.
4. Extend boundary tests to enforce the broader rule and document any scoped exceptions.
5. Verify routes, overlays, forms, and cache invalidation behavior remain unchanged because the underlying query option factories stay the same.

Rollback is low-risk: components can temporarily return to direct React Query consumption because the underlying `get...QueryOptions` factories remain intact.

## Open Questions

- Should `AttachmentSection` be included in the first pass as a feature-owned section query, or should attachment section reads stay out of scope until the entity overlay migration is complete?
- Should shared authenticated session consumption remain outside this rule permanently, or should the project later introduce a separate shared-session hook convention for non-feature infrastructure?

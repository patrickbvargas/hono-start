## Context

`src/features/employees` still uses a transitional structure that predates the repository's canonical entity-management slice. The current feature keeps Prisma-backed queries and lookup resolution inside `api/*`, exposes a single `Employee` read model for both table rows and overlay consumers, stores pure business validation in a flat `rules.ts`, and lets `src/routes/colaboradores.tsx` pass entire employee row objects through edit, delete, restore, and details overlays.

The implementation contract now names `src/features/clients_v2` as the reference slice. That reference uses thin route-facing `api/queries.ts` and `api/mutations.ts` modules, Prisma-backed reads and writes in `data/*`, focused rule modules under `rules/`, feature-owned read-model mapping before schema parsing, and route overlays keyed by entity id with detail hydration performed through feature queries.

This change is an internal architectural alignment. It must preserve the `/colaboradores` route, current Portuguese UI copy, existing filter semantics, current authorization behavior, and the documented list-management UX contract.

## Goals / Non-Goals

**Goals:**
- Reshape `src/features/employees` to match the canonical slice anatomy without changing intended product behavior.
- Move Prisma-backed reads, writes, lookup resolution, and persistence-aware checks into `data/queries.ts` and `data/mutations.ts`.
- Replace the flat `rules.ts` with focused rule modules whose exported assertions follow the documented `assert...` convention.
- Split employee read contracts into summary and detail models so route overlays can pass ids instead of row snapshots.
- Refactor `/colaboradores` to use the same route overlay composition as `/clientes`, with detail and edit hydration delegated to feature query boundaries.
- Reduce the public barrel to the minimal route-facing surface required by the route and feature consumers.

**Non-Goals:**
- No new employee fields, business rules, permissions, or workflow changes.
- No route-path or URL search contract changes beyond internal naming alignment required by the canonical pattern.
- No UX redesign beyond replacing row-carried overlay payloads with id-based hydration.
- No extraction of employee-specific domain code into `shared/` unless an already-proven generic primitive is required.

## Decisions

### Decision: Rebuild the feature boundary to mirror `clients_v2`

`employees` will adopt `api/queries.ts`, `api/mutations.ts`, `data/queries.ts`, `data/mutations.ts`, and `rules/` as first-class modules. Route-facing server functions and React Query option factories stay in `api/*`; Prisma access, lookup resolution, deterministic ordering, read-model mapping, and persistence-aware lifecycle checks move to `data/*`.

Rationale:
- This matches the repository contract and removes the remaining parallel architecture.
- It gives `tasks.md` a clear migration target based on a proven local reference.
- It prevents route files from inheriting persistence or orchestration details during later work.

Alternatives considered:
- Keep the current file layout and only rename exports. Rejected because it preserves the same boundary violations.
- Partially adopt the pattern for reads only. Rejected because writes and lifecycle checks would still be split across inconsistent layers.

### Decision: Introduce separate employee summary and detail read models

`schemas/model.ts` will define distinct summary and detail schemas instead of a single all-purpose `Employee` model. The list query will return summaries tailored to table rendering. Detail and edit flows will hydrate a detail model by id through a dedicated query option.

Rationale:
- The current single-model approach forces route overlays to carry more data than they own and hides which flows truly require full details.
- Summary/detail separation matches the reference slice and the route contract in `docs/implementation/FRONTEND.md`.
- Explicit read models reduce accidental coupling between table shape and form/details requirements.

Alternatives considered:
- Keep one broad read model and pass only `id` through overlays. Rejected because list queries would still overfetch and detail/edit flows would remain implicitly coupled to the table contract.
- Keep row-object overlays for delete/restore only. Rejected because it preserves two overlay conventions in one route.

### Decision: Move overlay payloads in `/colaboradores` from `Employee` objects to entity ids

`src/routes/colaboradores.tsx` will use `useOverlay<EntityId>()`, matching `/clientes`. The route continues to preload the list query from validated search state. Table actions emit ids. `EmployeeForm`, `EmployeeDetails`, `EmployeeDelete`, and `EmployeeRestore` receive ids where they need persisted state and fetch through feature query boundaries or feature hooks rather than using stale row snapshots.

Rationale:
- This preserves list context while ensuring overlay content is sourced from canonical data, not whatever happened to be in the table row when the overlay opened.
- It aligns employees with the documented shared overlay pattern.
- It eliminates stale-data risks when a row changes between table render and overlay interaction.

Alternatives considered:
- Keep passing row objects for speed and only add a detail query for the drawer. Rejected because edit/delete/restore would still diverge from the canonical route pattern.
- Store overlay state inside feature components instead of the route. Rejected because the route contract explicitly owns overlay composition.

### Decision: Split pure business rules from persistence-aware assertions

The current flat `rules.ts` will be replaced by focused modules under `rules/` for database-free assertions such as remuneration/referral percentage validation and OAB requirements. Assertions that need current stored state, active-contract counts, or lookup existence checks will move into `data/mutations.ts` or adjacent data helpers.

Rationale:
- The implementation contract draws a hard boundary between pure rules and persistence-aware checks.
- Smaller rule modules make intent clearer and give tests a stable home after the refactor.
- This prevents `rules/` from becoming a second persistence layer in disguise.

Alternatives considered:
- Move all checks into `rules/`. Rejected because Prisma-backed checks do not belong there.
- Leave `rules.ts` in place and only rename the exported function. Rejected because it keeps the old structure and weakens the reference pattern.

### Decision: Keep the feature barrel minimal and route-facing

`src/features/employees/index.ts` will expose only the route-consumed query option factories, top-level UI components, the search schema, and any route-consumed model types. Internal server handlers, `data/*` modules, and implementation-only helpers remain private.

Rationale:
- The public barrel rule exists to keep feature internals swappable.
- The current barrel leaks a legacy `Employee` type whose semantics are about to split into summary/detail.
- A minimal barrel makes the route's dependencies explicit and easier to review against the contract.

Alternatives considered:
- Re-export the entire feature tree for convenience. Rejected because it violates the documented boundary.

## Risks / Trade-offs

- [Route and component churn] -> Mitigation: migrate the route and overlay consumers in one slice-focused pass, then update the public barrel last so temporary breakage stays local.
- [Hidden coupling to the current all-purpose `Employee` type] -> Mitigation: introduce summary/detail types early and let TypeScript expose components that still assume the old shape.
- [Behavior drift in filters or sorting while moving read logic] -> Mitigation: preserve the existing search schema, deterministic ordering, and current lookup-to-id translation behavior when extracting `data/queries.ts`.
- [Regression in delete/restore or edit defaults] -> Mitigation: ensure destructive and edit flows hydrate persisted state by id and retain existing feature hooks for toast, invalidation, and mutation orchestration.
- [Test fragility during file moves] -> Mitigation: keep behavior assertions, but relocate tests to follow the new rule/data boundaries rather than preserving outdated file targets.

## Migration Plan

1. Extract current employee read logic into `data/queries.ts`, preserving search translation, sorting, contract-count enrichment, and UI-ready mapping before schema parsing.
2. Extract write paths and persistence-aware checks into `data/mutations.ts`, leaving `api/mutations.ts` responsible only for server function wrappers and mutation option factories.
3. Replace `rules.ts` with focused rule modules and update schema/form hooks to consume the new assertion entrypoints.
4. Introduce employee summary/detail schemas and add detail-query support needed by form and drawer hydration.
5. Refactor `src/routes/colaboradores.tsx` and feature components to use id-based overlays and feature-owned hydration.
6. Reduce `src/features/employees/index.ts` to the minimal route-facing surface and update imports accordingly.
7. Run focused tests for employee forms, rules, and route-adjacent behavior, then add or adjust tests where the new boundaries expose missing coverage.

Rollback strategy:
- The refactor remains inside one feature slice and one route. If a regression is discovered before merge, revert the slice-level changes together rather than partially restoring the old boundary.

## Open Questions

- None identified. The repository contract, proposal, and local `clients_v2` reference slice provide a sufficiently clear target architecture for task generation and implementation.

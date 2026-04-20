## Context

The codebase already declares a feature-slice architecture intended to scale across multiple business entities, but the current implementation only materializes the employees slice. That makes employees both a product feature and a prototype for the rest of the system.

Today, the employees slice proves the general package layout (`api`, `components`, `hooks`, `schemas`, `constants`, `utils`) and some shared primitives (`useFilter`, `useSort`, `DataTable`, overlay helpers, shared session policy). However, the conventions that future entities would copy are still unstable:

- employee list semantics currently blur `isActive` and soft-delete visibility
- lookup option queries are still feature-specific and do not enforce the shared active-only selectable rule consistently
- route-level employee-management denial is weaker than the spec intends
- employee validation still depends on partial client-side shape rules instead of complete business validation
- the architecture docs describe a broader system than the current Prisma schema actually supports

This change deliberately treats employees as the reference slice and stabilizes the cross-entity contract before clients, contracts, or financial entities are introduced.

## Goals / Non-Goals

**Goals:**
- Define a shared behavioral foundation for entity-management screens that future slices can reuse without reinterpretation.
- Make employees conform to that foundation so it becomes the canonical example for new entities.
- Separate active/inactive filtering from soft-delete visibility using a stable URL and UI contract.
- Standardize selectable option-query behavior for entity forms.
- Ensure management access and firm scoping are enforced through shared session helpers on both route and server boundaries.

**Non-Goals:**
- Implementing any new business entity beyond employees.
- Moving all employee code into `shared/` preemptively.
- Introducing BetterAuth or changing the permission matrix.
- Expanding the Prisma schema to the full PRD surface in this change.

## Decisions

### D1. Introduce a behavioral foundation spec before extracting more shared code

The first step is to define the contract in specs, not to aggressively refactor code into reusable abstractions. The shared code should follow only after the reusable behavior is clear.

This avoids the common failure mode where premature abstractions encode the first feature's accidental quirks. Employees will remain mostly feature-local, but the change will make explicit which behaviors are canonical for other entities.

Alternative considered: immediately extract a generic CRUD/entity framework from the employees slice. Rejected because the current slice still contains unresolved semantics, especially around filtering and option loading.

### D2. Treat `active` and soft-delete visibility as separate dimensions everywhere

The foundation will adopt a two-axis model:

- `active` controls `isActive` filtering
- `status` controls soft-delete visibility (`active`, `inactive`, `all`) or an equivalent explicit deleted-state contract

Employees already have specs that describe this separation, and the broader product docs apply the same pattern to other entities. The UI may present this through checkboxes, radios, or grouped controls, but the underlying semantics must remain distinct and composable.

Alternative considered: keep a single “status” control that mixes active and deleted semantics. Rejected because it becomes impossible to reuse cleanly across entities and contradicts the current data model.

### D3. Keep the reference implementation layered: route thin, feature owns behavior, shared owns primitives

The route should stay orchestration-only: search validation, query preloading, authorization gating, and overlay mounting. The employees feature continues to own entity-specific queries, mutations, schema rules, table columns, and forms. `shared/` continues to own primitives such as table rendering, URL helpers, session policy, and generic form infrastructure.

This preserves the architecture described in `docs/ARCHITECTURE.md` and gives future entities a clear template:

```text
route
  -> feature search schema + query options
  -> shared authorization gate
  -> feature filter/table/form/detail/delete/restore
```

Alternative considered: move list/search logic into route files for each entity. Rejected because it would scatter the entity contract and weaken slice isolation.

### D4. Standardize selectable option queries as a shared rule, not just an employee rule

Option-query behavior will be treated as a foundation rule:

- lookup-table options: `isActive = true`
- business-entity options: `deletedAt IS NULL AND isActive = true`
- selected historical references may still render in details/edit states if already persisted, but generic pickers return only selectable rows

This matches `docs/DATA_MODEL.md` and prevents each new entity from inventing its own option semantics.

Alternative considered: keep option filtering as a per-feature convention. Rejected because it would drift quickly once clients, contracts, and assignments exist.

### D5. Route authorization remains a UX concern, but server authorization is the authority

Management routes must deny access using shared authorization helpers before rendering the management UI, but all protected reads and mutations must also enforce the same boundary on the server.

This preserves good UX while keeping TanStack Start server functions as the real security boundary. It also aligns with the existing `src/shared/session` direction and avoids relying on hidden buttons as access control.

Alternative considered: rely on UI gating only for the employees route because server functions already enforce admin mutations. Rejected because management list access is also protected behavior and should not be exposed to regular users.

### D6. Employees becomes the “reference slice” by conformance, not by centralization

This change will not attempt to collapse employees into a shared “entity framework.” Instead, employees becomes the example by fully conforming to:

- shared route guard expectations
- shared filter/search/sort/pagination semantics
- shared option-query rules
- shared mutation feedback and refresh expectations
- documented business validation rules

Future entities can then clone the structure confidently and only extract code once a second or third consumer proves the abstraction.

Alternative considered: mark employees as the reference informally and start implementing clients next. Rejected because the current slice still contains placeholder behavior and ambiguous conventions.

## Risks / Trade-offs

- [Risk] The new foundation spec may overfit the employees use case. → Mitigation: keep the foundation focused on contracts that clearly recur across entity-management screens and avoid employee-only terminology in the new capability.
- [Risk] The change could become a refactor without improving user-visible correctness. → Mitigation: require spec deltas that tighten employee filtering, option loading, validation, and route access behavior.
- [Risk] Shared abstractions may still emerge too early. → Mitigation: treat shared code extraction as secondary to behavioral alignment; keep feature-specific logic inside employees unless a primitive is already clearly generic.
- [Risk] The docs and the actual Prisma schema still diverge after this change. → Mitigation: explicitly scope this change to foundation semantics and reference-slice stabilization, not full domain-model completion.

## Migration Plan

1. Capture the foundation contract in a new `entity-foundation` spec and add deltas to the existing employee-related specs.
2. Align employees route behavior, filter semantics, lookup option queries, and validation logic to the updated specs.
3. Extract only the shared helpers that the stabilized contract proves necessary.
4. Verify the employees slice remains the only required reference before starting a new entity proposal.

Rollback is low risk because this change is mostly behavioral and structural within the current employees implementation. If needed, the team can revert the shared conventions and employee alignment without data migration.

## Open Questions

- Should the shared foundation define one canonical deleted-state URL param name across all entities now, or only define the separation principle and let each entity keep a feature-local label?
- Should the reference pattern include a mandatory detail drawer for every entity, or can some future entities opt out if the list row already exposes all key data?
- When the second entity is introduced, should repeated list/query helpers move into `shared/` immediately or only after the third consumer confirms the abstraction?

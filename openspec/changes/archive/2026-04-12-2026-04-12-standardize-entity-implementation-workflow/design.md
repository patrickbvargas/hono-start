## Context

The repo architecture already describes feature slices in `docs/ARCHITECTURE.md`, and `employees` proves that the structure works in practice. However, architecture and conventions documents describe static rules, while the team also needs a delivery workflow: what to build first, what belongs in a feature vs. route vs. shared, and when refactoring is justified.

The current `entity-foundation` spec says employees is the reference slice and that future entities should follow the same high-level management workflow shape. That is useful but incomplete. A developer reading it still has to infer the actual implementation order and the boundary decisions from the employees codebase.

This change closes that gap by defining the workflow pattern explicitly, while preserving the existing architectural direction:

```text
feature-local contract
  -> feature-local server boundary
  -> feature-local orchestration hooks
  -> feature-local UI components
  -> route composition
```

## Goals / Non-Goals

**Goals:**
- Define a repeatable workflow for implementing new entity slices.
- Prevent routes from becoming business-logic containers.
- Make schema-first feature design the default pattern.
- Preserve feature isolation while clarifying when `shared/` should grow.
- Keep `employees` as the reference slice for workflow, not as a copy-paste source.

**Non-Goals:**
- Changing current product behavior.
- Forcing every future entity to have identical fields or identical internal helpers.
- Extracting shared code immediately.
- Replacing the current feature-slice architecture.

## Decisions

### D1. Standardize the implementation sequence for entity slices

New entity features will follow this order:

1. Define schemas (`model`, `form`, `filter`, `sort`, `search`)
2. Define feature-local server operations (`get`, `create`, `update`, optional `delete`/`restore`, optional lookups)
3. Add feature orchestration hooks
4. Add feature UI components
5. Wire the route last

This makes the entity contract explicit before UI assembly and prevents route-first implementations from leaking domain rules into page files.

Alternative considered: leave implementation order implicit and let each feature evolve organically. Rejected because the repo is still early, and inconsistent sequencing now will calcify into inconsistent slice boundaries later.

### D2. Keep the route thin and declarative

Routes are responsible for:

- validating search state with the feature search schema
- prefetching feature queries
- mounting feature components and overlays
- applying route-level access gates

Routes are not responsible for:

- building Prisma filters
- deciding mutation payload shape
- orchestrating feature-side success/error handling

This aligns with the existing TanStack Start route pattern already used by the employees slice.

Alternative considered: allow routes to own list/query logic when it seems smaller. Rejected because it weakens feature isolation and makes entity behavior harder to reuse or test consistently.

### D3. Treat hooks as orchestration and components as presentation

Feature hooks own:

- mutation selection
- submit orchestration
- query invalidation
- toast/error handling
- URL-driven filter synchronization

Feature components own:

- visual layout
- field rendering
- row action triggers
- read-only detail presentation

This keeps business flow out of component trees and gives future entities a consistent place to put operational logic.

Alternative considered: allow components to call mutations and invalidate queries directly if the code is shorter. Rejected because it distributes workflow logic across multiple views and makes slice patterns harder to recognize.

### D4. Delay shared abstraction until repeated consumers exist

The workflow standard will explicitly prefer local implementation first:

- first entity: prove the shape
- second entity: compare patterns
- third entity: extract only stable abstractions

This keeps the codebase from turning the first entity’s incidental details into a generic framework too early.

Alternative considered: extract shared CRUD helpers immediately from `employees`. Rejected because the current need is workflow clarity, not framework building.

### D5. Employees remains the workflow reference, not the domain template

Future entities should reuse the employees slice for:

- folder boundaries
- sequencing
- route composition pattern
- schema layering
- CRUD overlay flow

Future entities should not blindly reuse:

- employee-specific validation rules
- employee-specific lookup semantics
- employee-specific fields and naming
- known placeholders or temporary domain shortcuts

This allows the team to move forward without blocking on cleanup, while still avoiding literal copy-paste design.

Alternative considered: require employees to be fully refactored before it can serve as the reference slice. Rejected because that would slow down entity development unnecessarily; the workflow can be standardized first and refined later.

## Risks / Trade-offs

- [Risk] The workflow spec may feel redundant with architecture docs. → Mitigation: keep it focused on build order, ownership boundaries, and refactor timing rather than re-stating static folder structure only.
- [Risk] Contributors may still treat employees as a copy-paste base. → Mitigation: explicitly state in the spec that employees is a workflow reference, not a domain template.
- [Risk] A future entity may legitimately need fewer pieces than the standard slice shape. → Mitigation: allow omission of folders/components that are not needed while preserving the sequencing and ownership principles.

## Migration Plan

1. Add a spec delta to `entity-foundation` documenting the workflow requirements.
2. Use that spec as the baseline for future entity proposals.
3. Only create code refactors when a later implementation proves a stable cross-entity abstraction.

Rollback is trivial because this change does not alter application code or persisted data.

## Open Questions

- Should the team eventually capture this same workflow in a repo-level `docs/entity-workflow.md`, or is the spec alone enough for now? Create a `docs/WORKFLOW.md` for it.
- When the second entity lands, should we require an explicit comparison against `employees` in its proposal/design to justify any deviations? Yes.

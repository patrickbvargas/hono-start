# Architecture

This document defines the reusable house architecture of the repository.

It should remain valid even if the domain layer is replaced by another product domain.

## Canonical Repository Shape

```text
src/
  features/<feature>/
    api/
      queries.ts
      mutations.ts
    components/
    constants/
    data/
      queries.ts
      mutations.ts
    hooks/
    rules/
    schemas/
    utils/
    index.ts
  routes/
  shared/
    components/
    config/
    hooks/
    lib/
    schemas/
    session/
    types/
  styles/
```

## Slice Pattern

The canonical slice shape for feature work is defined by this document. New feature slices must follow it unless a documented exception exists.

`src/features/clients` is the named reference slice for this repository. Contributors should compare new slices and refactors against that slice before introducing structural deviations.

## Canonical Feature Slice Contract

Each feature slice is validated by responsibility. A feature should include the
directories whose responsibilities it owns, and any structural deviation from
the `clients` reference slice must be justified by feature-specific behavior.

```text
src/features/<feature>/
  api/          route-facing server wrappers and query/mutation options
  components/   feature UI pieces with local props interfaces
  constants/    cache keys, sort defaults, stable values, and error catalogs
  data/         Prisma-backed reads, writes, lookup resolution, and persisted checks
  hooks/        form, filter, option, delete, restore, and export orchestration
  rules/        pure throwing business assertions only
  schemas/      model, form, filter, search, and sort contracts
  utils/        pure defaults, normalization, and formatting helpers
  index.ts      minimal route-facing public barrel
```

Each feature slice is expected to use these responsibilities:

- `api/queries.ts`: route-facing read wrappers and query option factories
- `api/mutations.ts`: route-facing write wrappers and mutation option factories
- `components/`: feature-local UI pieces
- `constants/`: cache keys, sorting defaults, stable values, and safe pt-BR feature error catalogs
- `data/queries.ts`: Prisma-backed reads, option loading, search translation, deterministic ordering, and read-model mapping
- `data/mutations.ts`: Prisma-backed writes and persistence-aware checks that depend on current stored state
- `hooks/`: orchestration hooks such as `use-form`, `use-filter`, `use-delete`, `use-restore`, and `use-options`
- `rules/`: the canonical home for feature-local pure business assertions that do not require Prisma or persisted resource lookups; rule modules export `assert...` functions that throw on failure, and consumers import concrete rule modules directly instead of adding a `rules/index.ts` barrel
- `schemas/`: `model`, `form`, `filter`, `search`, and `sort` contracts, including Zod request schemas and database-free schema refinements
- `utils/`: feature-local pure helpers such as defaults, normalization helpers, and formatting helpers
- `index.ts`: minimal public barrel for route-facing consumers

Route-facing React Query factories follow a stable suffix convention:
`get...QueryOptions` for query factories and `...MutationOptions` for mutation
factories. Non-mutating export flows may live beside query/export orchestration,
but their factory names still use the mutation suffix when they return
`mutationOptions`.

Feature subfolders must not contain local re-export barrel files such as
`constants/index.ts` or `rules/index.ts`. Inside a feature, import concrete
modules directly. Leaf component folders may use an `index.tsx` implementation
file when that file defines the component directly; it must not be a nested
re-export barrel. The only feature barrel is the top-level
`src/features/<feature>/index.ts`.

Feature-specific extensions are allowed when they represent real product
responsibility. For example, `remunerations` owns export orchestration because
the remuneration route exposes report export behavior; that does not require
unrelated slices to add export files.

## Architectural Rules

- Domain behavior belongs in feature slices under `src/features/<feature>`.
- External consumers must import from a feature's public `index.ts` barrel only.
- Routes own composition, route-level search parsing, prefetching, and authorization wiring.
- Routes must not own feature business logic, Prisma query construction, or mutation orchestration.
- Route-facing server wrappers belong in `api/`; Prisma-backed reads and writes belong in `data/`.
- Pure feature business assertions belong in `rules/`, not in route files or generic `utils/`.
- A rule function always asserts an invariant and throws when the invariant fails; non-throwing decisions, predicates, and validation issue collectors are not rule exports.
- Expected business and authorization errors use feature-local safe pt-BR error catalogs or documented shared safe-error helpers.
- Read models are feature-owned UI contracts and must be mapped from persistence rows before `schemas/model.ts` parsing.
- `shared/` is reserved for generic infrastructure, primitives, and reusable building blocks that are not tied to one domain's business rules.

## Public Barrel Rule

Feature barrels expose only the public surface required by routes or other top-level consumers:

- route-consumed query option factories
- top-level feature UI components
- exported search schema
- route-consumed feature model types when needed

Internal helpers, implementation-only schemas, and server handlers must not leak through the barrel by default.

## Dependency Direction

- Features may depend on `shared/`.
- Routes may depend on features and `shared/`.
- Features must not reach into another feature's internal files.
- Shared code must not depend on feature-local business modules.

## Database Boundary

- Prisma access is centralized through shared database utilities.
- Generated Prisma artifacts are not hand-edited.
- Migration files are generated artifacts, not handwritten source of truth.

## Architectural Intent

- The system is organized around feature-local ownership, not horizontal file-type sprawl.
- Each feature should converge on the `clients` slice anatomy unless a documented exception exists.
- Route files must read like orchestration code, not like a second implementation layer.
- Business domains may change between repositories; this slice pattern should not.

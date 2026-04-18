# Conventions

## Language Policy

- User-facing copy must follow the product locale defined by the domain or product contract.
- Code identifiers, filenames, comments, and logs must be in English.

## Naming

- Files and directories: `lowercase-kebab-case`
- React components: `PascalCase`
- Hooks: `camelCase` with `use` prefix
- Constants: `UPPER_SNAKE_CASE`
- Exported pure business-rule assertions in `rules/`: `camelCase` with `assert` prefix
- Zod schemas: `camelCase` ending in `Schema`
- Exported types inferred from schemas must follow the schema name without the `Schema` suffix

## Export Rules

- Named exports only, except framework-required defaults.
- Public feature access goes through the feature barrel only.
- Server function handlers stay private; exported API surface is the options factory wrapping them.
- Feature barrels stay minimal and route-facing; do not export `data/` modules, internal helpers, or implementation-only schemas.
- Shared UI components are consumed through `@/shared/components/ui`.

## TypeScript Rules

- `any` is forbidden.
- Use `import type` for type-only imports.
- Props are defined as `interface`, not `type`.
- Prefer explicit return types for server boundaries and shared abstractions.

## Zod Rules

- Import Zod as `import * as z from "zod"`.
- Use Zod v4 APIs.
- URL-driven schemas must use safe defaults.
- Keep schema and inferred type definitions close together.
- `schemas/form.ts` is the canonical home for request-shape validation and database-free schema refinements.
- `schemas/form.ts` request and write schemas must use explicit `...InputSchema` names, and inferred types must use matching `...Input` names.
- `schemas/model.ts` read-model schemas and inferred types keep concise domain names such as `clientSummarySchema`, `ClientSummary`, `clientDetailSchema`, or `ClientDetail`.
- `schemas/model.ts` represents UI-ready read contracts, not raw Prisma row shapes.

## Feature Boundary Rules

- `api/queries.ts` and `api/mutations.ts` are the canonical route-facing boundary for server functions and React Query option factories.
- `data/queries.ts` and `data/mutations.ts` own Prisma-backed reads, writes, lookup resolution, and persistence-aware checks.
- `rules/` is the canonical home for pure business assertions that do not require Prisma or persisted resource lookups.
- Rules always assert a business invariant and throw an error when that invariant fails.
- Exported functions in `rules/` must be throwing assertions named with an `assert...` prefix.
- Non-throwing `validate...`, `should...`, and predicate helpers must not be exported from `rules/`; keep them private or place them outside `rules/`.
- `rules/` modules are imported by explicit module path, such as `rules/write`, rather than through a `rules/index.ts` barrel.
- `utils/normalization.ts` is reserved for pure input canonicalization helpers such as trimming, empty-to-null conversion, and mask removal.
- `utils/` is reserved for generic helpers such as normalization, formatting, and default-value helpers.
- Feature read modules must map raw persistence rows into explicit read models before parsing with `schemas/model.ts`.
- Lookup-backed read models should expose UI-ready labels and keep stable lookup `value` fields when edit defaults or later write flows need both.

## Cache And Mutation Rules

- Mutation option factories remain pure.
- Cache invalidation and toast feedback are handled by orchestration hooks or form hooks, not hidden inside mutation definitions.
- Cache keys are defined through feature constants, not inline strings.

## Form Hook Rule

- Shared form primitives are created through `useAppForm`.
- Feature-level form hooks own create vs update branching, schema selection, parsed payload submission, toast feedback, edit-default hydration, and query refresh behavior.
- Feature form hooks must keep the route and form component free of persistence orchestration details.

## Reusability Rule

- These conventions define house style, not business-domain behavior.
- A future project may replace the domain docs while keeping these conventions intact.

## Forbidden Drift

- Do not import `@heroui/*` directly from features or routes.
- Do not import a feature's internal files from outside that feature.
- Do not introduce new architectural patterns when a documented house pattern already exists.
- Do not move orchestration into route files when the feature already owns that concern.

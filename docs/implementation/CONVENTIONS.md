# Conventions

## Language Policy

- User-facing copy must follow the product locale defined by the domain or product contract.
- Code identifiers, filenames, comments, and logs must be in English.

## Naming

- Files and directories: `lowercase-kebab-case`
- React components: `PascalCase`
- Hooks: `camelCase` with `use` prefix
- Constants: `UPPER_SNAKE_CASE`
- Zod schemas: `camelCase` ending in `Schema`
- Exported types inferred from schemas must follow the schema name without the `Schema` suffix

## Export Rules

- Named exports only, except framework-required defaults.
- Public feature access goes through the feature barrel only.
- Server function handlers stay private; exported API surface is the options factory wrapping them.
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
- `schemas/model.ts` read-model schemas and inferred types keep concise domain names such as `contractSchema` and `Contract`.

## Feature Boundary Rules

- `utils/validation.ts` is reserved for pure business validation helpers and assertions that do not require Prisma or persisted resource lookups.
- `utils/normalization.ts` is reserved for pure input canonicalization helpers such as trimming, empty-to-null conversion, and mask removal.
- Feature-local `api/` modules own Prisma-backed lookup resolution and persisted-state lookup checks used by create and update flows.

## Cache And Mutation Rules

- Mutation option factories remain pure.
- Cache invalidation and toast feedback are handled by orchestration hooks or form hooks, not hidden inside mutation definitions.
- Cache keys are defined through feature constants, not inline strings.

## Form Hook Rule

- Shared form primitives are created through `useAppForm`.
- Feature-level form hooks own create vs update branching, schema selection, mutation calls, toast feedback, and query refresh behavior.
- Feature form hooks must keep the route and form component free of persistence orchestration details.

## Reusability Rule

- These conventions define house style, not business-domain behavior.
- A future project may replace the domain docs while keeping these conventions intact.

## Forbidden Drift

- Do not import `@heroui/*` directly from features or routes.
- Do not import a feature's internal files from outside that feature.
- Do not introduce new architectural patterns when a documented house pattern already exists.
- Do not move orchestration into route files when the feature already owns that concern.

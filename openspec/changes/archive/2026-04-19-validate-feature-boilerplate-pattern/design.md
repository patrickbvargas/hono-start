## Context

The current implementation is close to the desired house pattern. The remaining problem is that the pattern is spread across implementation docs, OpenSpec specs, `clients` reference code, and repeated slice examples. That makes review expensive: a contributor can follow the folder shape while still drifting in details such as what gets exported, where a thrown error message lives, whether a rule is an assertion or a predicate, and how hooks/components name their options and props.

The target is a concise pattern that is specific enough to validate, but not so rigid that feature-specific behavior becomes artificial.

```text
src/features/<feature>/
  api/          route-facing server wrappers + query/mutation options
  components/   feature UI; props as local interfaces
  constants/    cache keys, sort defaults, stable values, error catalogs
  data/         Prisma-backed reads/writes and persistence-aware checks
  hooks/        orchestration for forms, filters, options, delete/restore, exports
  rules/        pure throwing business assertions only
  schemas/      model, form, filter, search, sort contracts
  utils/        pure defaults, normalization, formatting helpers
  index.ts      minimal route-facing public barrel
```

Nested `index` barrels inside feature subfolders are intentionally excluded from the target pattern. Components and helpers should be imported from their concrete module files inside the feature; only the top-level feature barrel remains public for routes and top-level consumers.

## Goals / Non-Goals

**Goals:**

- Make the feature boilerplate pattern explicit and easy to review.
- Validate principal features against the pattern and classify deviations as either justified exceptions or drift.
- Keep `clients` as the reference slice while extracting the reusable pattern into docs/specs.
- Standardize error throwing and rule assertion semantics.
- Standardize params/options/props naming at feature boundaries.
- Standardize `if` statement style so every branch uses braces and avoids inline single-statement returns.
- Remove nested feature-folder barrels while preserving the top-level feature public barrel.

**Non-Goals:**

- Introduce a meta-framework or generator for feature slices.
- Require placeholder files when a feature does not own that responsibility.
- Change feature behavior or database shape.
- Move feature-specific business rules into shared code.

## Decisions

### 1. Validate by responsibility, not raw file inventory

Each feature is checked against responsibilities it actually owns. For example, `remunerations` may own export hooks while `clients` does not; that difference is valid when documented by capability. Equivalent responsibilities, however, must use the same ownership and naming pattern.

### 2. Keep `clients` as the reference implementation, but docs own the concise rule

`src/features/clients` remains the concrete example. The concise boilerplate matrix belongs in `docs/implementation/ARCHITECTURE.md` or a directly referenced implementation doc section so future contributors do not have to reverse-engineer it from code.

### 3. Errors are feature constants; rule modules throw safe messages

Feature-local error catalogs live under `constants/errors.ts`. Pure rule assertions import those constants and throw `Error` with a user-safe pt-BR message. Infrastructure/database failures are wrapped at server boundaries so internals are not leaked.

### 4. `rules/` exports only throwing assertions

Rule modules export `assert...` functions that enforce pure business invariants. Predicates, issue collectors, lookup resolution, and persisted-state checks do not become public `rules/` exports.

### 5. Props and options use explicit interfaces at the boundary

Feature components define `PascalCaseProps` interfaces near the component. Feature hooks define `Use<Feature><Concern>Options` interfaces when they accept an object parameter. Route-facing APIs use explicit input object shapes rather than positional argument drift when more than one value or optional value is involved.

### 6. Public barrels stay minimal and route-facing

Feature `index.ts` files export the route-consumed query option factories, top-level components, search schemas, and route-consumed model types. Internal data modules, rules, low-level utils, and implementation-only schemas stay private unless a concrete top-level consumer needs them.

### 7. Nested barrels are not part of feature slices

Feature subfolders should not contain barrel `index.ts` or `index.tsx` files. A file such as `components/table/index.tsx` hides the concrete component module behind a local barrel and makes folder navigation inconsistent. Prefer concrete module filenames such as `components/table/client-table.tsx` or `components/client-table.tsx`, following the existing feature-local organization.

### 8. Braced control flow is mandatory

All `if` statements use braces, including early returns. Inline forms such as `if (condition) return value;` are treated as drift because they make automated review and future edits less consistent. This applies to feature code and any updated shared code touched by the synchronization pass.

## Validation Plan

Audit each principal feature against this matrix:

| Area | Expected Pattern |
|---|---|
| Folder structure | canonical directories only when the feature owns the responsibility |
| `api/` | route-facing server wrappers and query/mutation options |
| `data/` | Prisma reads/writes, lookup resolution, persisted-state checks |
| `schemas/model.ts` | UI-ready read models parsed after mapping |
| `schemas/form.ts` | request input schemas and database-free refinements |
| `rules/` | exported `assert...` functions that throw |
| `constants/errors.ts` | user-safe pt-BR feature error messages |
| `hooks/` | orchestration, cache refresh, toast feedback, edit hydration |
| `components/` | presentation; props via local interfaces |
| `utils/` | defaults, normalization, formatting only |
| `index.ts` | minimal route-facing public surface |
| control flow | `if` statements always use braces |
| nested barrels | no feature-subfolder `index.ts` or `index.tsx` barrels |

## Risks / Trade-offs

- [Risk] Over-standardization could obscure real feature differences. Mitigation: validate by responsibility and document justified exceptions.
- [Risk] Barrel cleanup may break imports. Mitigation: audit all external imports from `src/features/*` and update them in the same implementation pass.
- [Risk] Error normalization could accidentally change user-facing messages. Mitigation: preserve existing pt-BR text unless it violates the safe-error contract.
- [Risk] Convention tests can become brittle. Mitigation: test public boundaries and high-value drift signals, not every incidental file.

## Open Questions

- Should the concise boilerplate matrix live directly in `ARCHITECTURE.md`, or should `ARCHITECTURE.md` point to a smaller dedicated implementation doc?
- Should convention validation be implemented as Vitest checks, static `rg`-style scripts, or both?

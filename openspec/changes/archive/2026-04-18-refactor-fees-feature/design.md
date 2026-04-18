## Context

`src/features/fees` implements the fee-management workflow but does not follow the current canonical feature-slice contract. Its route-facing server functions are split across `api/get.ts`, `api/create.ts`, `api/update.ts`, `api/delete.ts`, `api/restore.ts`, `api/resource.ts`, and `api/write.ts`, while `clients_v2`, `employees`, and `contracts` use `api/queries.ts`, `api/mutations.ts`, `data/queries.ts`, and `data/mutations.ts`.

The fees feature also keeps pure rules in `src/features/fees/rules.ts`, while the reference slices use a `rules/` directory with focused modules. The domain behavior itself is already defined: fee reads and writes must remain tenant-scoped, role-aware, tied to writable contracts, and responsible for remuneration and contract-status side effects.

## Goals / Non-Goals

**Goals:**

- Make `src/features/fees` match the same anatomy and naming convention as `clients_v2`, `employees`, and `contracts`.
- Keep `/honorarios` route composition thin and backed by the feature barrel.
- Move Prisma-backed reads, writes, access-resource loading, remuneration synchronization, and contract-status synchronization behind `data/queries.ts` and `data/mutations.ts`.
- Move pure database-free fee assertions from root `rules.ts` into `rules/` modules with exported `assert...` entrypoints where assertions throw.
- Preserve every user-facing fee behavior, pt-BR copy, validation result, authorization rule, tenant scope, and cache refresh behavior.

**Non-Goals:**

- No Prisma schema or migration changes.
- No redesign of fee/remuneration calculation formulas.
- No route path, layout, modal, drawer, table, or filter behavior change.
- No new shared abstraction unless needed to consume an existing shared helper.

## Decisions

### Consolidate Route-Facing API Into `api/queries.ts` And `api/mutations.ts`

The fees feature will expose server functions and React Query option factories from `api/queries.ts` and `api/mutations.ts`, matching the reference slices.

Alternatives considered:

- Keep one file per operation and only rename exports. This would leave the feature structurally different from the documented pattern.
- Move all logic into the two API files. This would make routes look consistent but keep Prisma and business write logic at the route-facing boundary.

### Move Prisma Reads And Mapping Into `data/queries.ts`

Fee list queries, detail queries, selectable contract/revenue option queries, access-resource lookup, Prisma `include` objects, search-to-where translation, deterministic sorting, and read-model mapping will live in `data/queries.ts`.

This mirrors `contracts/data/queries.ts`: API functions derive session scope, then delegate to data functions that accept explicit scope parameters.

### Move Writes And Side-Effect Synchronization Into `data/mutations.ts`

Fee create, update, delete, restore, remuneration synchronization, delete-state synchronization, and contract-status synchronization will live in `data/mutations.ts`. API mutations will validate input, derive session/role scope, enforce authorization at the server boundary, map known errors, and delegate persistence.

This keeps transaction-heavy fee behavior in the data layer without leaking Prisma concerns into routes or hooks.

### Preserve Public Barrel Minimalism

`src/features/fees/index.ts` will export route-consumed query option factories, top-level UI components, the `Fee` type, and `feeSearchSchema`. Mutation option factories can remain consumed by feature-local hooks through internal imports, matching the reference slices.

The route should import `getFeesQueryOptions` rather than `getFeesOptions`.

### Convert Pure Rules To Focused `rules/` Modules

The root `rules.ts` file will be replaced by focused modules under `src/features/fees/rules/`. Throwing business assertions should use `assert...` naming, following the documented convention. Schema-facing non-throwing validation helpers may remain named for their existing validation role if tests and schemas already depend on that shape, but new exported assertion entrypoints should use `assert`.

The implementation should keep pure validation database-free. Parent-resource consistency, installment uniqueness against persisted fee rows, manual override checks, and persisted lookup/resource checks belong in data/API write flow where Prisma-backed state is available.

## Risks / Trade-offs

- Import churn can break hooks, tests, and route loader imports -> update consumers in the same change and run `pnpm check` plus `npx tsc --noEmit`.
- Moving write helpers can accidentally change transaction behavior -> preserve the existing transaction boundaries and side-effect order when extracting into `data/mutations.ts`.
- Access-resource scoping can drift while splitting query code -> keep all fee access resources firm-scoped and session-derived at the API boundary, with data helpers requiring explicit `firmId`.
- Renaming exported options can break route prefetching -> update `/honorarios` loader and component to use the new canonical `getFeesQueryOptions` name.
- Rule naming can become inconsistent during migration -> use `assert...` for exported throwing assertions and keep tests aligned with the new `rules/` directory.


## Context

`src/features/contracts` still follows an older transitional shape. The feature already has the right high-level concerns, but they are distributed across route-facing `api/*` modules that also own Prisma work, a flat `rules.ts`, and overlay flows in `src/routes/contratos.tsx` that pass full contract row objects instead of ids. In contrast, `src/features/clients_v2` and the refactored `src/features/employees` now use the repository's canonical slice boundaries:

- `api/queries.ts` and `api/mutations.ts` for route-facing server wrappers and React Query options
- `data/queries.ts` and `data/mutations.ts` for Prisma-backed reads, writes, lookup resolution, and persistence-aware checks
- `rules/` for pure business assertions
- explicit feature-owned read-model mapping before `schemas/model.ts` parsing
- id-based overlay flows with detail hydration delegated to feature queries

Contracts is the largest aggregate among the entity-management slices. It carries client selection, legal-area and status lookups, collaborator assignments, revenue rows, delete and restore lifecycle actions, assignment-scoped access checks, and read-only status behavior. Because that aggregate is large, the older structure costs more here than it would in a smaller slice.

This change is an internal architectural alignment. It must preserve route behavior, authorization, Portuguese UI copy, filter/search semantics, tenant scope derivation, and the existing contract-management business rules already captured in the domain docs and `openspec/specs/contract-management/spec.md`.

## Goals / Non-Goals

**Goals:**
- Align `src/features/contracts` with the canonical `clients_v2` / `employees` slice pattern.
- Separate route-facing server wrappers from Prisma-backed persistence and access logic.
- Replace the flat `rules.ts` with focused pure-rule modules that follow the documented `assert...` convention.
- Move `/contratos` overlays to id-based state and feature-owned detail hydration.
- Split or clarify contract read models so list and detail flows no longer depend on passing row snapshots through the route.
- Keep the public barrel minimal and route-facing.

**Non-Goals:**
- No new contract behavior, fields, permissions, or workflow expansion.
- No change to route path, search-param semantics, or user-facing copy except where internal alignment forces no visible behavior change.
- No redesign of revenue, fee, or remuneration domain rules.
- No extraction of contract-specific logic into `shared/` unless an already-proven generic primitive is required.

## Decisions

### Decision: Rebuild the feature boundary to mirror `clients_v2` and `employees`

`contracts` will adopt `api/queries.ts`, `api/mutations.ts`, `data/queries.ts`, `data/mutations.ts`, and `rules/` as the first-class feature boundaries. Existing responsibilities currently spread across `api/get.ts`, `api/create.ts`, `api/update.ts`, `api/delete.ts`, `api/restore.ts`, `api/lookups.ts`, and `api/resource.ts` will be redistributed so `api/*` becomes route-facing only and `data/*` owns Prisma-backed work.

Rationale:
- This is the documented repository contract.
- Contracts is now the clearest remaining exception among the primary entity-management slices.
- It creates one predictable place for access queries, lookup resolution, write orchestration, and read-model mapping.

Alternatives considered:
- Keep the current module layout and only rename exports. Rejected because the same ownership drift would remain.
- Move reads first and leave writes where they are. Rejected because the write boundary is where most of the contracts complexity lives.

### Decision: Route overlays in `/contratos` will move from `Contract` objects to entity ids

`src/routes/contratos.tsx` will use `useOverlay<EntityId>()`, matching `/clientes` and `/colaboradores`. Table actions will emit ids. `ContractDetails`, `ContractForm`, `ContractDelete`, and `ContractRestore` will hydrate their required persisted state through feature queries or hook-owned query access rather than depending on the contract row captured at click time.

Rationale:
- This aligns contracts with the documented overlay contract in `docs/implementation/FRONTEND.md`.
- It removes stale-row coupling when aggregate data changes between list render and overlay interaction.
- It lets details and edit flows depend on an explicit feature query boundary instead of accidental table overfetch.

Alternatives considered:
- Keep row-object overlays and add only a details query. Rejected because edit/delete/restore would still diverge from the house pattern.
- Keep row-object overlays for destructive actions only. Rejected because one route would still carry two overlay contracts.

### Decision: Contract read models become explicit list and detail contracts

The contracts feature will no longer treat one broad `Contract` shape as the universal list, detail, and edit-default contract. The list query will return a summary/read model tailored to table usage. The detail query will return the richer aggregate shape needed by the drawer and edit hydration. Both shapes will still be feature-owned and mapped before parsing through `schemas/model.ts`.

Rationale:
- Contracts rows currently carry far more aggregate state than the route should own.
- Summary/detail separation is the cleanest way to support id-based overlays without overfetching the table.
- It follows the same direction already taken in the employees alignment.

Alternatives considered:
- Keep one large model and simply pass ids through overlays. Rejected because the list contract would still overreach and detail/edit flows would stay implicitly coupled to table shape.

### Decision: Pure contract assertions move into focused `rules/` modules and use `assert...` entrypoints

The current flat `rules.ts` will be replaced by focused modules under `src/features/contracts/rules/`. Pure, database-free assertions such as assignment uniqueness, revenue count limits, down-payment bounds, responsible-lawyer presence, and referral composition rules will live there. Exported entrypoints will use the canonical `assert...` naming convention rather than `validate...`.

Rationale:
- The implementation contract now standardizes pure rule entrypoints on `assert...`.
- Contracts has enough business assertions that a flat file has become harder to scan.
- Focused modules make schema integration and tests easier to reason about.

Alternatives considered:
- Keep one `rules.ts` file and only rename functions. Rejected because the structure would still diverge from the reference pattern.
- Move all checks into `data/mutations.ts`. Rejected because pure rules should stay reusable and database-free.

### Decision: Persistence-aware access and lookup checks stay in `data/*`

Rules that depend on persisted state, lookup existence, current resource state, or firm-scoped access will move out of route-facing API modules into `data/queries.ts` or `data/mutations.ts`. That includes:

- contract access-resource queries
- lookup resolution by stable `value`
- selectability checks for client and employee options
- write-time read-only checks
- delete and restore protections
- update-time synchronization of assignments and revenues

Rationale:
- These checks are not pure business assertions; they depend on Prisma and current state.
- They belong beside the persistence layer that enforces them.
- It keeps `api/*` small and easier to audit as the route-facing boundary.

Alternatives considered:
- Keep `api/resource.ts` and `api/lookups.ts` as special-case API-side helpers. Rejected because that preserves the old split responsibility.

### Decision: The contract form hook will hydrate edit defaults by id

`useContractForm` will align with the employee form pattern. In create mode it will start from `defaultContractCreateValues()`. In edit mode it will fetch the contract detail by id through the feature query boundary and reset the form with feature-owned default mapping.

Rationale:
- The route should not carry the full edit payload.
- Edit hydration becomes consistent with the canonical hook pattern already used in employees.
- It ensures edit defaults stay aligned with the detail contract rather than whichever fields the table happened to expose.

Alternatives considered:
- Continue passing full contract objects from the route into the form. Rejected because it preserves the route/data coupling that this refactor is meant to remove.

## Risks / Trade-offs

- [Aggregate read-model churn] -> Mitigation: introduce summary/detail models early so TypeScript exposes all components still depending on the old all-purpose `Contract` type.
- [Behavior drift while moving access and lookup logic] -> Mitigation: preserve the current spec-owned rules and move logic by responsibility, not by convenience.
- [Overlay regressions from the route refactor] -> Mitigation: migrate all `/contratos` overlays in one pass so the route only has one overlay contract at the end.
- [Write regressions in assignment/revenue synchronization] -> Mitigation: keep synchronization semantics unchanged and move them intact into `data/mutations.ts` before making naming cleanups.
- [Spec drift around assertion naming] -> Mitigation: update the relevant OpenSpec deltas in the same change so contracts no longer describes the older `validate...` rule vocabulary.

## Migration Plan

1. Create `data/queries.ts` and move contract list, detail, option-query, and access-resource Prisma logic there.
2. Create `data/mutations.ts` and move contract create, update, delete, restore, lookup resolution, and persisted-state checks there.
3. Replace `api/get.ts`, `api/create.ts`, `api/update.ts`, `api/delete.ts`, and `api/restore.ts` with canonical `api/queries.ts` and `api/mutations.ts` wrappers plus query/mutation option factories.
4. Split `rules.ts` into focused `rules/` modules with `assert...` entrypoints and update schemas plus server wrappers to consume them.
5. Introduce explicit contract summary/detail model shapes and feature-owned mapping before schema parsing.
6. Refactor `src/routes/contratos.tsx` and route-facing components to use `EntityId` overlays and feature-owned hydration.
7. Reduce `src/features/contracts/index.ts` to the minimal route-facing surface and update imports accordingly.
8. Run focused tests for contract schemas, rules, data access, and overlay-adjacent flows after implementation.

Rollback strategy:
- Revert the feature and route alignment as one unit. Partial rollback would reintroduce a mixed overlay/data contract, so the feature should be treated as one slice-level refactor.

## Open Questions

- None. The target architecture is already established by `clients_v2`, the employee refactor, and the current implementation contract.

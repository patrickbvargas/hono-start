## Context

The domain docs already define `Fee` as the concrete payment event recorded against a `Revenue`, and they further define `Remuneration` as a downstream record generated from fee behavior. The current implementation, however, stops at the contract aggregate introduced in the previous change: Prisma includes `Contract`, `ContractEmployee`, and `Revenue`, but there is still no `Fee` model, no remuneration persistence, no `/honorarios` route, and no feature slice that turns revenue plans into actual payment history.

This leaves an important gap in the product contract. Navigation and permissions already anticipate a fee surface, but the application cannot yet record incoming payments, calculate revenue progress from persisted source events, or trigger the documented remuneration lifecycle. The fee change therefore needs to do more than add a table and a route. It must introduce the missing financial event layer while preserving the repository's established slice, route, and session-policy patterns.

Contributor workflow is also affected. In this repository, attempting to run a plain Prisma development migration on top of the current local state has proven unreliable and can time out. The implementation contract should therefore document the working sequence for local schema work: reset the Prisma development database first, then generate the new migration, then reseed.

## Goals / Non-Goals

**Goals:**
- Introduce a first-class `fees` feature slice that follows the documented schema-first workflow already used by clients, employees, and contracts.
- Add the missing persistence foundation for `Fee` and the minimum remuneration persistence needed to satisfy fee lifecycle side effects without building the full remuneration-management UI.
- Keep route files thin by placing fee query building, parent-resource validation, mutation logic, remuneration side effects, and payload shaping inside the fee feature.
- Enforce assignment-scoped authorization and contract writability at the server boundary using authenticated session context.
- Derive revenue payment progress and contract auto-completion from persisted fee records rather than ad hoc calculations disconnected from the event source.
- Document the repository-specific Prisma migration-reset workflow in the implementation contract.

**Non-Goals:**
- Implementing the standalone `/remuneracoes` route, remuneration review UI, export flows, or manual remuneration override screens in this change.
- Redesigning contracts into a dedicated financial workspace or introducing a wizard route pattern for fees.
- Extracting new shared abstractions before the fee slice proves a second stable pattern beyond the existing entity-management features.

## Decisions

### D1. Fee management must introduce both the fee event model and the minimum remuneration persistence needed for fee side effects

The business rules do not treat remuneration generation as an optional future concern. They define fee lifecycle behavior in terms of linked remunerations: create when generation is enabled, recalculate on qualifying updates, preserve manual overrides, and soft-delete or restore in tandem with the fee. A fee change that persists only the fee row would still leave the documented lifecycle incomplete.

The implementation should therefore introduce:
- `Fee` as the concrete payment event linked to `Revenue`, `Firm`, and later fee-driven queries
- `Remuneration` as persisted downstream state linked to `Fee`, `ContractEmployee`, and `Firm`

The remuneration slice UI remains out of scope, but the persistence and server-side write behavior should land now because fee correctness depends on it.

Alternative considered: add only `Fee` now and defer all remuneration persistence to a later remuneration feature. Rejected because it would knowingly violate the documented fee lifecycle rules and require the fee API contract to change again immediately afterward.

### D2. Revenue progress and contract completion remain derived read models, not stored counters

The domain contract is explicit that `paidValue`, `installmentsPaid`, and `remainingValue` are derived from persisted source data. The system should therefore continue treating revenue totals as a combination of:
- the persisted revenue plan
- the optional down payment
- the sum and count of active fee records

Contract completion should be re-evaluated after each fee mutation by inspecting the fully-paid state of all active revenues on the contract. The implementation may update the persisted contract status as a business transition, but it should not introduce redundant mutable fee-progress columns on `Revenue`.

Alternative considered: store mutable progress counters on `Revenue` and update them incrementally on every fee write. Rejected because it increases drift risk and weakens the domain rule that the financial state must remain reproducible from source events.

### D3. Fee writes must validate parent resources transactionally and treat the parent contract as the writable boundary

Fee operations depend on multiple persisted facts:
- the fee belongs to a revenue
- the revenue belongs to a contract
- the contract belongs to the authenticated firm
- the current user may access that contract
- the contract is still writable
- the target revenue still allows another active installment

These checks belong in the fee API layer, and the create or update operation should execute transactionally with any linked remuneration changes and post-write contract-status evaluation. The parent writable boundary is the contract, not the fee row in isolation.

Alternative considered: check only the selected revenue row and infer contract state later in the route or UI. Rejected because writability and visibility are authoritative server-side policy derived from the contract resource.

### D4. The `/honorarios` route should be a standalone entity-management surface, not only an embedded contract subpanel

The domain docs define fee management as a separate feature area and list `/honorarios` as a canonical authenticated route. The first implementation should therefore create a dedicated fees feature slice and route that follows the established pattern:
- route-level validated search state and prefetching
- filter controls in the route header
- a server-backed table in the route body
- create and edit modals
- a details drawer
- delete and restore confirmations

Contract details may later embed fee summaries, but the primary operational entrypoint should still be the dedicated route already named in the product contract.

Alternative considered: surface fees only inside the contract details drawer and defer the top-level route. Rejected because it would diverge from the documented route inventory and make fee filtering and cross-contract financial review harder to implement cleanly.

### D5. Remuneration generation state should distinguish system-generated records from manual overrides

The fee lifecycle rules require recalculation of system-generated remunerations while preserving manual overrides. The persistence model therefore needs an explicit way to distinguish whether a remuneration is still system-derived or has been administratively detached from later recalculation.

A simple persisted flag or equivalent lifecycle field on `Remuneration` should represent that distinction. Fee updates with remuneration generation enabled should recalculate only system-generated rows linked to the fee. Fee updates with generation disabled should preserve existing remunerations. Fee delete and restore should cascade through linked remunerations consistently.

Alternative considered: infer manual override status indirectly from mismatched percentages or amounts. Rejected because it is brittle, ambiguous, and difficult to reason about during recalculation.

### D6. The Prisma contributor workflow must be documented as reset, then migrate, then seed

This repository has a practical local-development constraint: generating a new Prisma development migration without resetting the dev database first has been timing out and is not a reliable contributor workflow. The implementation contract should therefore explicitly document the working sequence for local schema changes:
1. `npx prisma migrate reset`
2. `npx prisma migrate dev --name <change-name>`
3. `npx prisma db seed`

This is not a product behavior rule; it is a repository-specific implementation rule and belongs in the implementation docs rather than the domain contract.

Alternative considered: leave the workflow undocumented and rely on contributors to discover it ad hoc. Rejected because it creates repeated friction and inconsistent migration practices.

## Risks / Trade-offs

- [Risk] The fee change widens scope by pulling remuneration persistence into the same implementation. → Mitigation: keep the remuneration work limited to schema and server-side fee lifecycle behavior, not a standalone UI slice.
- [Risk] Derived financial state may become expensive if every fee list or write recomputes across large revenue histories. → Mitigation: keep queries intentional, index parent keys and lifecycle fields, and derive summary values only where the route or mutation needs them.
- [Risk] Recalculation rules for remunerations can become hard to reason about when assignment changes, referral percentages, and manual overrides coexist. → Mitigation: keep the first implementation narrowly aligned to the documented formulas and preserve a clear persisted distinction between system-generated and manual rows.
- [Risk] Contributors may still run the old Prisma migration flow out of habit. → Mitigation: update the implementation docs in the same change and include the workflow explicitly in the task list and review checklist.
- [Risk] The fee route may duplicate too much contract and revenue context in its table or overlays. → Mitigation: expose concise parent summaries in the fee read model and avoid turning the first fee screen into a secondary contract dashboard.

## Migration Plan

1. Add the new `fee-management` spec delta so fee behavior is fixed before implementation.
2. Extend Prisma schema with `Fee` and `Remuneration`, including the relations, indexes, lifecycle fields, and active uniqueness constraints required by the domain rules.
3. Update the contributor docs to require the local Prisma workflow of reset first, then migration generation, then seed.
4. Reset the local Prisma development database, generate the migration for the fee and remuneration schema additions, and reseed lookup and baseline data.
5. Build the `fees` feature slice in the standard order: schemas, APIs, hooks, components, then route.
6. Wire fee authorization, derived revenue progress, contract completion checks, and remuneration side effects into fee write operations.
7. Verify the new slice against the documented route, overlay, and list-management patterns before moving on to remuneration UI work.

Rollback is straightforward at the route level but heavier at the schema level. If the feature must be disabled after deployment, the route and feature slice can be removed while leaving the new tables unused; schema rollback should be treated as a controlled migration operation rather than the default recovery path.

## Open Questions

- Should the first fee table expose parent contract and revenue filters as independent selectors, or should revenue selection always be constrained by a chosen contract in the filter UI?
- Should fee bulk creation for the same revenue be included in the first implementation or deferred even though the domain docs already allow it?
- When a fee update changes the parent revenue, should linked remunerations be recalculated in place or soft-deleted and recreated as new system-generated rows for clearer audit behavior?

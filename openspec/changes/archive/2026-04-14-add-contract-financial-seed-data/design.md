## Context

`prisma/seed.ts` currently establishes lookup catalogs, a default firm, employees, and clients, but it does not populate the financial aggregate introduced by the contract and fee foundations. That leaves local environments unable to validate contract lists, fee lists, remuneration counts, assignment-based visibility, contract auto-completion, or referral-calculation behavior without manual data entry.

This change is cross-cutting inside the seed layer because the missing fixture graph spans multiple Prisma models: `Contract`, `ContractEmployee`, `Revenue`, `Fee`, and `Remuneration`. The design must preserve business rules already encoded in the domain contract and the fee write logic, while still keeping the seed deterministic and safe to rerun.

## Goals / Non-Goals

**Goals:**
- Seed a deterministic financial fixture graph for the default firm with at least 20 contracts.
- Cover the main runtime scenarios needed for local development: basic responsible-lawyer contracts, referral-team contracts, assistant participation, fees with and without remuneration generation, partially paid revenues, fully paid revenues, active and inactive records, and completed contracts.
- Keep the seed idempotent so repeated execution converges to the same records and child relations.
- Preserve realistic user visibility by distributing assignments across multiple employees instead of concentrating every seeded contract on one user.

**Non-Goals:**
- No Prisma schema change or database migration.
- No runtime API, route, or UI changes.
- No generic fixture framework for arbitrary seed customization.
- No second tenant bootstrap unless a later change explicitly requires multi-firm demo data.

## Decisions

### Use a deterministic fixture catalog keyed by stable business identifiers
The seed should define explicit fixture inputs for contracts, revenues, fees, and expected assignments using stable keys such as `processNumber`, revenue `type.value`, employee email, and client document.

Rationale:
- `processNumber` is already unique per firm and provides a natural contract fixture key.
- Stable keys let the seed re-resolve relational IDs on every run without persisting fragile assumptions about auto-increment values.
- This aligns with the repository’s lookup strategy, which already treats stable values as the application boundary.

Alternatives considered:
- Rely on creation order and inferred numeric IDs. Rejected because it is brittle across resets and future fixture edits.
- Delete all seeded financial rows and recreate them from scratch. Rejected because that is more destructive than needed and makes seed reruns harder to reason about.

### Build the fixture graph from parent to child, but persist remunerations from seed-side calculations
The seed should create contracts, assignments, revenues, and fees first, then create remunerations by applying the same effective-percentage formulas the fee feature uses.

Rationale:
- Remunerations are a persisted derived record, so the seed must materialize them if the local database is expected to represent realistic post-fee state.
- Creating remunerations from the same formulas used by the fee feature keeps local data aligned with product truth.
- Seed-side calculation avoids depending on server actions or route handlers during environment bootstrap.

Alternatives considered:
- Seed only fees and rely on runtime code to lazily derive remunerations. Rejected because remunerations are persisted, not virtual.
- Import the feature’s server mutation into the seed. Rejected because the seed should remain a direct Prisma bootstrap path with minimal coupling to runtime server boundaries.

### Model fixture coverage as scenario families, not one-off rows
The seed should define a small set of scenario families and instantiate them across enough records to exceed 20 contracts.

Scenario families:
- standard active contract with one responsible lawyer
- active contract with responsible lawyer plus admin assistant
- referral contract with recommending and recommended lawyers
- fee with `generatesRemuneration = false`
- partially paid contract
- fully paid contract with completed status
- contract containing inactive revenue or inactive fee history where allowed by the persistence model

Rationale:
- Scenario families make the seed explainable and maintainable.
- They provide direct traceability from domain rules to fixture data.
- They avoid a flat list of arbitrary mock records that becomes difficult to extend safely.

Alternatives considered:
- Hand-author 20 unrelated contracts. Rejected because it scales poorly and obscures scenario intent.
- Generate completely random financial data. Rejected because deterministic verification becomes difficult.

### Reconcile child collections per seeded contract transactionally
For each seeded contract fixture, the seed should upsert the contract, then reconcile assignments, revenues, fees, and remunerations in one transaction based on the contract’s stable fixture definition.

Rationale:
- Child uniqueness rules are partly enforced in service logic rather than declarative Prisma constraints.
- Transactional reconciliation prevents partially updated fixture graphs when one child record fails validation.
- Per-contract reconciliation keeps blast radius small and simplifies debugging.

Alternatives considered:
- Bulk `createMany` for all children globally. Rejected because child matching and cleanup become opaque.
- Global delete-and-recreate of all financial data. Rejected because it is heavier and less precise.

## Risks / Trade-offs

- [Fixture drift from runtime remuneration rules] → Mitigation: mirror the effective-percentage formulas already used in the fee write flow and keep the seed helper small and explicit.
- [Idempotency bugs produce duplicate child rows] → Mitigation: reconcile children using stable fixture keys per contract and clear or update previously seeded child records deterministically.
- [Fixtures accidentally encode invalid business states] → Mitigation: shape scenario families directly from documented business rules and fee validation constraints.
- [Overly complex seed file becomes hard to maintain] → Mitigation: isolate fixture builders and scenario definitions into clear helper sections inside the seed module or local helper files.
- [Seeded completed contracts drift from derived payment state] → Mitigation: calculate fee totals so completed contracts are fully paid by persisted fee and down payment data instead of forcing status-only mock data.

## Migration Plan

1. Extend the seed with deterministic contract financial fixture definitions.
2. Run `npx prisma db seed` against a local reset database.
3. Verify that the seeded dataset contains at least 20 contracts and matching fee/remuneration coverage.
4. Validate that contract and fee screens can surface realistic records for both admin and non-admin users.

Rollback strategy:
- Revert the seed change and rerun the normal local reset-and-seed workflow.
- No production migration rollback is required because this change does not alter schema.

## Open Questions

- Should the fixture set include soft-deleted contracts, revenues, fees, or remunerations, or is active/inactive history sufficient for the first seed expansion?
- Should any seeded contract intentionally exercise status-lock behavior, or is completed-versus-active coverage enough for this first proposal?

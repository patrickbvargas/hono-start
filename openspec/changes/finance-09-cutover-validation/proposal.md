## Why

Finish the branch as one coherent system, replacing obsolete fee/expense/remuneration contracts and validating all dependent flows before release.

## What Changes

- **BREAKING target behavior:** introduce development cutover, legacy retirement and release evidence under the approved financial contract. Preserve baseline code until the coordinated cutover.
- Deliver the narrowly scoped steps described in design/tasks, with feature-owned contracts, authority checks and focused tests.
- Follow [financial domain rules](../../../docs/domain/FINANCIAL_SYSTEM.md), [authorization](../../../docs/domain/FINANCIAL_AUTHORIZATION.md) and [ordered roadmap](../../../docs/implementation/FINANCIAL_ROADMAP.md).

## Capabilities

### New Capabilities
- `financial-cutover`: Development cutover, legacy retirement and release evidence.

### Modified Capabilities
- `fee-management`: retire legacy fee-slot and confirmed-event editing requirements; replaced by financial-receipts.
- `remuneration-management`: retire standalone remuneration obligations; replaced by financial-remuneration and Payables.

## Dependencies and order

Phase 09/09. Required predecessor: `finance-08-cash-flow`. Dependency completion is a manual implementation gate even if OpenSpec reports artifact readiness. No skipping directly to this phase.

## Non-goals

No unrelated stack redesign, no production migration or reset, no automatic live Clerk changes, no extra operational modules, no credits or analytic rateio. This artifact creates no runtime behavior.

## Impact

Primary owners: the feature slices and query boundaries described in design.md. Admin/Member remain subject to explicit grants, current Firm scope and the absolute Member remuneration confidentiality invariant. Global Person/catalog changes do not widen operational access.

## Ready-to-use reset acceptance

Deliver a reproducible `pnpm run db:reset` that applies the migration chain, generates the client and seeds a usable app database. Require incremental seed updates in phases01–09, deterministic configured Clerk identity/organization bindings, documented external prerequisites, current scenario fixtures and two real clean-reset/login/use cycles without manual SQL repair. Preserve the existing UI style; no visual redesign is part of cutover.

## Person revision — 2026-10-30

Follow docs/domain/PERSON_REGISTRATION.md over prior separate-screen/document assumptions. Unified Pessoas route with role checkboxes/filters; employee implies supplier; optional 1:1 ClientProfile, SupplierProfile and EmployeeProfile from this revision; receivable customer/payable supplier eligibility; seeded Pagamentos diversos/Recebimentos diversos generic counterparties without fiscal documents or professional profiles. Ordinary documents stay required/unique. Apply role/document constraints and deterministic generic seed keys first, verify database/seed, then review Clerk/session/projections. Preserve explicit grants, Member field/record confidentiality, real employee commission origin and existing UI style. Record new implementation evidence separately from commits8c0718b/d0cb812; do not mark whole phases done from foundation work.

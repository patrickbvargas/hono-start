## Why

Introduce exact-key financial grants and Member confidentiality before exposing new financial surfaces.

## What Changes

- **BREAKING target behavior:** introduce granular operational and financial authorization under the approved financial contract. Preserve baseline code until the coordinated cutover.
- Deliver the narrowly scoped steps described in design/tasks, with feature-owned contracts, authority checks and focused tests.
- Follow [financial domain rules](../../../docs/domain/FINANCIAL_SYSTEM.md), [authorization](../../../docs/domain/FINANCIAL_AUTHORIZATION.md) and [ordered roadmap](../../../docs/implementation/FINANCIAL_ROADMAP.md).

## Capabilities

### New Capabilities
- `financial-access`: Granular operational and financial authorization.

### Modified Capabilities
None in this phase's delta. Existing legacy finance contracts are explicitly retired/reconciled in phase 09; no legacy rule may override the approved target during this gated transition.

## Dependencies and order

Phase 02/09. Required predecessor: `finance-01-unify-people`. Dependency completion is a manual implementation gate even if OpenSpec reports artifact readiness. No skipping directly to this phase.

## Non-goals

No unrelated stack redesign, no production migration or reset, no automatic live Clerk changes, no extra operational modules, no credits or analytic rateio. This artifact creates no runtime behavior.

## Impact

Primary owners: the feature slices and query boundaries described in design.md. Admin/Member remain subject to explicit grants, current Firm scope and the absolute Member remuneration confidentiality invariant. Global Person/catalog changes do not widen operational access.

## Registration UI clarification

Preserve one Pessoas route/sidebar entry with role checkboxes and permission-scoped role filters over one shared Person. Member cannot access supplier/collaborator management; API projections must protect professional fields, percentages and access bindings even when that Person is a readable customer.

## Person revision — 2026-10-30

Follow docs/domain/PERSON_REGISTRATION.md over prior separate-screen/document assumptions. Unified Pessoas route with role checkboxes/filters; employee implies supplier; optional 1:1 ClientProfile, SupplierProfile and EmployeeProfile from this revision; receivable customer/payable supplier eligibility; seeded Pagamentos diversos/Recebimentos diversos generic counterparties without fiscal documents or professional profiles. Ordinary documents stay required/unique. Apply role/document constraints and deterministic generic seed keys first, verify database/seed, then review Clerk/session/projections. Preserve explicit grants, Member field/record confidentiality, real employee commission origin and existing UI style. Record new implementation evidence separately from commits8c0718b/d0cb812; do not mark whole phases done from foundation work.

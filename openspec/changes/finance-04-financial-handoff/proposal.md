## Why

Replace implicit revenue schedules and immediate-expense cash with explicit acerto financeiro for Contract Revenue and Expense.

## What Changes

- **BREAKING target behavior:** introduce operational financial generation and editable schedule under the approved financial contract. Preserve baseline code until the coordinated cutover.
- Require preview titles (including entry) to equal the agreed total exactly before generation; a reason cannot bypass a mismatch. Preserve authorized post-generation adjustments/extras. No month/year competence field in this version.
- Deliver the narrowly scoped steps described in design/tasks, with feature-owned contracts, authority checks and focused tests.
- Follow [financial domain rules](../../../docs/domain/FINANCIAL_SYSTEM.md), [authorization](../../../docs/domain/FINANCIAL_AUTHORIZATION.md) and [ordered roadmap](../../../docs/implementation/FINANCIAL_ROADMAP.md).

## Capabilities

### New Capabilities
- `financial-handoff`: Operational financial generation and editable schedule.

### Modified Capabilities
None in this phase's delta. Existing legacy finance contracts are explicitly retired/reconciled in phase 09; no legacy rule may override the approved target during this gated transition.

## Dependencies and order

Phase 04/09. Required predecessor: `finance-03-title-foundation`. Dependency completion is a manual implementation gate even if OpenSpec reports artifact readiness. No skipping directly to this phase.

## Non-goals

No unrelated stack redesign, no production migration or reset, no automatic live Clerk changes, no extra operational modules, no credits or analytic rateio. This artifact creates no runtime behavior.

## Impact

Primary owners: the feature slices and query boundaries described in design.md. Admin/Member remain subject to explicit grants, current Firm scope and the absolute Member remuneration confidentiality invariant. Global Person/catalog changes do not widen operational access.

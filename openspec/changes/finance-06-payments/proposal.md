## Why

Settle obligations from expenses, direct entries and remuneration through one common payment workflow.

## What Changes

- **BREAKING target behavior:** introduce payable settlement and grouped cash outflow under the approved financial contract. Preserve baseline code until the coordinated cutover.
- Deliver the narrowly scoped steps described in design/tasks, with feature-owned contracts, authority checks and focused tests.
- Follow [financial domain rules](../../../docs/domain/FINANCIAL_SYSTEM.md), [authorization](../../../docs/domain/FINANCIAL_AUTHORIZATION.md) and [ordered roadmap](../../../docs/implementation/FINANCIAL_ROADMAP.md).

## Capabilities

### New Capabilities
- `financial-payments`: Payable settlement and grouped cash outflow.

### Modified Capabilities
None in this phase's delta. Existing legacy finance contracts are explicitly retired/reconciled in phase 09; no legacy rule may override the approved target during this gated transition.

## Dependencies and order

Phase 06/09. Required predecessor: `finance-05-receipts`. Dependency completion is a manual implementation gate even if OpenSpec reports artifact readiness. No skipping directly to this phase.

## Non-goals

No unrelated stack redesign, no production migration or reset, no automatic live Clerk changes, no extra operational modules, no credits or analytic rateio. This artifact creates no runtime behavior.

## Impact

Primary owners: the feature slices and query boundaries described in design.md. Admin/Member remain subject to explicit grants, current Firm scope and the absolute Member remuneration confidentiality invariant. Global Person/catalog changes do not widen operational access.

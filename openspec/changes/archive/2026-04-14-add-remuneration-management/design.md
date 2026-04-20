## Context

The repository already has the persistence foundation for remunerations and fee-driven side effects. Prisma includes `Remuneration`, the fee write flow already creates and recalculates remuneration rows, and the seed data now exercises those paths. What is missing is the actual feature surface: there is no `src/features/remunerations` slice, no `/remuneracoes` route, no query layer for role-scoped remuneration review, and no administrator workflow for manual overrides even though the domain contract already allows them.

That means the product currently generates financially meaningful data that users cannot inspect through the intended application surface. This is a larger gap than a simple missing table route, because the remuneration surface carries the main user-facing consequence of fee writes: administrators must be able to trust and correct payout records, and regular users must be able to see their own scoped financial outcomes. The design therefore needs to extend the existing entity-management pattern into the remuneration domain while preserving the already documented fee-side source-of-truth behavior.

## Goals / Non-Goals

**Goals:**
- Introduce a `remunerations` feature slice that matches the established repository anatomy: `api`, `components`, `constants`, `hooks`, `schemas`, `utils`, and a public barrel.
- Add the `/remuneracoes` route as a thin orchestration layer with validated search state, loader prefetching, authenticated access, and shared overlay wiring.
- Enforce the documented visibility model at the server boundary: firm-wide remuneration access for administrators and employee-scoped remuneration access for regular users.
- Support administrator manual adjustments to remuneration amount and effective percentage while preserving the business rule that manual overrides are no longer silently recalculated from later fee updates.
- Support remuneration export for the currently filtered, role-scoped dataset in PDF and spreadsheet formats from the remuneration surface itself.

**Non-Goals:**
- Changing the fee-generation formulas or redesigning the fee write flow that already creates and recalculates remuneration rows.
- Building a generic export platform shared by every feature before the remuneration flow proves the pattern.
- Implementing audit-log review, attachments, dashboard analytics, or authentication work in the same change.

## Decisions

### D1. Build remunerations as a standalone feature slice and route, not as a subpanel of fees

The product contract explicitly lists `/remuneracoes` as an authenticated route and treats remunerations as a distinct feature area with its own scoped visibility and export behavior. The implementation should therefore create a dedicated `src/features/remunerations` slice and a route-level screen that follows the same pattern already used by clients, contracts, and fees.

This keeps route composition consistent across the application:
- route-level validated search state and loader prefetching
- filter controls in the header
- server-backed table in the body
- details drawer
- edit modal for admin-only overrides
- delete and restore confirmations for administrators

Alternative considered: expose remunerations only inside fee details. Rejected because it would hide the feature behind another domain surface and break the documented route inventory and export flow.

### D2. Derive regular-user remuneration visibility from the session's employee identity

The permission contract is narrower for remunerations than for clients: regular users can see only their own remuneration records, while administrators can see the firm-wide set. The remuneration query layer should therefore derive access from two session facts:
- `firmId` for tenant isolation
- `employeeId` for regular-user financial visibility

Administrators query all remunerations inside the firm. Regular users query only remunerations where the linked `contractEmployee.employeeId` matches the employee identity resolved from the authenticated session.

Alternative considered: infer regular-user visibility from assigned contracts alone. Rejected because the domain docs are stricter for remunerations than for contract-level visibility; users see their own payouts, not everyone else's payouts on the same contract.

### D3. Administrator edits convert the remuneration into a manual override

The business rules already define the manual-override boundary: once a remuneration has been intentionally adjusted by an administrator, it must no longer be silently recalculated from later fee updates. The implementation should represent this with the existing `isSystemGenerated` flag:
- system-created rows start with `isSystemGenerated = true`
- any administrator edit to amount or effective percentage sets `isSystemGenerated = false`
- later fee recalculation logic continues to skip rows where `isSystemGenerated = false`

This keeps the persistence contract aligned with the fee feature that already preserves manual overrides.

Alternative considered: add a second explicit `isManualOverride` field. Rejected because the current persistence model already has a sufficient and meaningful distinction, and duplicating it would create avoidable state drift.

### D4. Keep remuneration export feature-local and scoped to the current filters

The domain contract says users may view and export remunerations, but the repository does not yet have a generic export subsystem. The first implementation should therefore keep export behavior inside the remuneration feature:
- export uses the same validated remuneration filters as the on-screen list
- export derives the same role-aware scope from the session
- export offers PDF and spreadsheet outputs for the filtered dataset

This keeps the feature shippable without widening the change into a cross-feature platform rewrite.

Alternative considered: defer export until a generic reporting module exists. Rejected because export is already part of the canonical remuneration user flow and would leave the feature only partially implemented against the contract.

### D5. Reuse the current remuneration schema unless query evidence justifies a small index-only migration

The Prisma model already includes the core fields needed for the feature: `feeId`, `contractEmployeeId`, `effectivePercentage`, `amount`, `paymentDate`, `isSystemGenerated`, `isActive`, and `deletedAt`. The implementation should assume no foundational schema redesign is needed.

If implementation reveals a clear performance need for additional query indexes, a small migration is acceptable, but the feature should otherwise stay focused on the missing query, route, and UI layers rather than re-opening the financial persistence model.

Implementation note: after verifying the remuneration list, detail, and export query paths against the existing `Remuneration`, `ContractEmployee`, and `Fee` indexes, no additional Prisma migration was required for this change.

Alternative considered: redesign the remuneration schema up front before building the route. Rejected because the current model already matches the documented business semantics well enough for the missing surface.

## Risks / Trade-offs

- [Risk] Export support can expand the change into a broader reporting framework. → Mitigation: keep export feature-local, reuse the remuneration search schema, and limit output to the documented remuneration dataset.
- [Risk] Regular-user remuneration scope may be hard to derive if session identity does not consistently expose the employee record. → Mitigation: verify and, if necessary, extend the shared session selector boundary before building remuneration queries.
- [Risk] Administrator manual edits could create confusion about why later fee updates stop changing a remuneration row. → Mitigation: surface override state clearly in the remuneration table and details drawer with explicit pt-BR labeling.
- [Risk] Delete and restore semantics can conflict with parent fee lifecycle behavior. → Mitigation: keep remuneration lifecycle rules explicit and block restore when the parent fee remains soft-deleted, if that condition appears during implementation.
- [Risk] The remuneration feature could drift into a second financial dashboard. → Mitigation: keep the first screen tightly focused on review, correction, and export of payout rows rather than broader analytics.

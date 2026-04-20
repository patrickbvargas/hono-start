## Why

The product contract already defines remunerations as a core user-facing surface, but the current implementation stops at generating remuneration rows indirectly from fee writes. Adding the remuneration feature now closes the biggest remaining financial workflow gap so administrators can review and correct payout data, and regular users can see their own scoped financial results in the application instead of only relying on downstream assumptions.

## What Changes

- Add a new remuneration-management capability for role-scoped remuneration listing, filtering, sorting, detail viewing, and export flows on the documented `/remuneracoes` route.
- Implement a first-class `src/features/remunerations` slice following the repository's standard entity-management pattern, with server-prefetched list queries, URL-driven search state, detail drawer, and admin-only edit, delete, and restore overlays.
- Expose administrator-only manual remuneration adjustment behavior that converts edited remunerations into manual overrides so later fee recalculation does not silently overwrite them.
- Enforce the documented remuneration visibility model: administrators see firm-wide remunerations, while regular users see only remunerations tied to their own employee identity.
- Add remuneration export behavior for the currently filtered, role-scoped dataset in PDF and spreadsheet formats without introducing a generic export platform for every feature.

## Capabilities

### New Capabilities
- `remuneration-management`: Remuneration review, `/remuneracoes` route behavior, role-scoped visibility, administrator manual overrides, remuneration lifecycle actions, and remuneration-specific export.

### Modified Capabilities

## Non-goals

- Reworking fee-generation formulas or changing the already documented fee-side remuneration side effects.
- Implementing a generic cross-feature export framework for clients, contracts, fees, and audit history in the same change.
- Introducing attachment, audit-log, login, or dashboard work that is unrelated to the remuneration feature slice.

## Impact

- Affected code: new `src/features/remunerations/**` slice, new `/remuneracoes` route under `src/routes/`, shared route config and navigation wiring, shared session and scope helpers used to derive employee-scoped remuneration access, and feature-local export handlers.
- Affected data model: the current `Remuneration` persistence shape already covers the documented manual-override distinction through `isSystemGenerated`; this change should not require a foundational schema redesign unless query-level indexing gaps are discovered during implementation.
- Affected roles: administrators gain firm-wide remuneration review, manual adjustment, delete, restore, and export actions; regular users gain access to their own remuneration list, details, and scoped export only.
- Multi-tenancy: every remuneration read, export, and mutation remains strictly scoped to the authenticated user's `firmId`, and regular-user visibility is additionally constrained to the session's employee identity.

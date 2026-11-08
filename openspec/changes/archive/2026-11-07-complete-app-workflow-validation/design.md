## Context

The schema already implements people/profiles and pure financial titles with dedicated bridges. Dashboard, pending-work and legacy feature entry points still use removed models. The audit records 124 type errors and reproducible UI defects. Existing financial consultation and settlement slices provide the owning boundaries to extend.

## Goals / Non-Goals

Goals: restore current flows without resurrecting old persistence, preserve authorization and financial precision, remove duplicate UI paths, verify the app and report live-environment gaps honestly. Non-goals are listed in proposal.md; notably no database reset, broadened grants or new bulk/manual-title UI.

## Decisions

1. Keep existing dashboard presentation/search and feature-owned API boundaries. Replace legacy data projections and fabricated schedules with explicit title/movement records. Derive projected amounts from title due dates and cash from signed settlement/reversal events on their effective dates. Commission obligations are separate from actual payable cash. Decimal arithmetic remains authoritative.
2. Apply firm, assigned-contract and own-beneficiary restrictions in database queries before aggregation. Employee options use EmployeeProfile/Person; cash/result metrics require global financial grants. Operational soft deletion must not erase existing financial obligations.
3. Rebuild pending-work's parameterized SQL at its current owner using bridge/title balances and current physical names. Keep one snapshot for rows/counts/totals. Do not retain old schedule fallback.
4. Delete fees/remunerations implementations and unsupported actions. Old URLs become redirects to receivables/payables and discard old numeric record IDs, which do not identify current titles. Current dashboard relationships target financial title IDs. Preserve unrelated valid historical lookup selections.
5. Contract writes accept negotiated revenue data only; title planning stays in financial-titles. Generated-title rows include classification and cancellation, and totals exclude cancelled titles/reversed movements. No destructive schema change is needed.
6. Settlement input must not clamp invalid financial values into a different transaction. Use existing form primitives with validation at both client and server. Refresh all affected query reads, including inactive route-backed caches, after mutations; test that movement status and balance agree without reload.
7. Reconcile documentation conservatively: current UI supports individual settlements and financial consultation; no manual-title UI or Member payment access is added. Translate display labels without rewriting audit history. Shared recovery UI provides actual retry plus a usable alternative destination.

## Risks / Trade-offs

- [Risk] Dashboard numbers change because old code counted operational amounts as cash → signed actual events and regression tests with discounts, reversals and paid commissions establish correct totals.
- [Risk] Removing legacy modules invalidates source-string tests → remove tests belonging solely to deleted modules, rewrite shared contracts against current owning slices, preserve substantive authorization/arithmetic tests.
- [Risk] Current session cannot exercise Member, two organizations or real storage → cover boundaries automatically and retain explicit live checks in TODO.md; never mark them executed.
- [Risk] Existing seed change checklist is stale → inspect and run non-destructive verification when suitable, without seed/reset or altering another change's claims without evidence.

## Migration Plan

Deploy application code against the existing bridge schema. No data migration or reset. Old collection/detail URLs redirect to current collections. Roll back the application revision if needed; immutable financial events and schema remain unchanged. Run lint, typecheck, focused/full tests, build and browser smoke checks before final status.

## Open Questions

No permission expansion is required. Future bulk-settlement and manual-title interfaces remain separate work. Live identity/storage scenarios require suitable existing test fixtures.

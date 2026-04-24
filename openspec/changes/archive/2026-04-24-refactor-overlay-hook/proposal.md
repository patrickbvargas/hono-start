## Why

The shared overlay hook already matches the entity route pattern, but its implementation relies on type casts that make the state contract less explicit than the behavior it enforces. Refactoring it to an explicit reducer-based state machine will preserve route-level overlay behavior while making future changes easier to verify.

## What Changes

- Refactor `src/shared/hooks/use-overlay.ts` to keep the same public API while replacing implicit state updates and casts with explicit reducer actions and type guards.
- Preserve the existing route-local overlay contract for `create`, `edit`, `details`, `delete`, and `restore`.
- Add focused Vitest coverage for shared overlay behavior, including single-active-overlay semantics, data requirements, close behavior, and render gating.
- Update implementation docs to clarify that shared hook/refactor/new-code changes require matching Vitest coverage when behavior or contracts change.
- No external modal state dependency will be added.

## Non-goals

- Do not replace the shared overlay hook with `@ebay/nice-modal-react` or any other modal state library.
- Do not change feature route composition, modal components, drawer components, or shared UI primitives.
- Do not change user-facing modal or drawer behavior.
- Do not move overlay state into global app state or URL search state.

## Capabilities

### New Capabilities
- `shared-overlay-orchestration`: Covers shared route-local overlay state behavior for entity create, edit, details, delete, and restore flows.

### Modified Capabilities
- `contract-aligned-test-suite`: Requires Vitest coverage for each feature, refactor, or new-code change that alters behavior, contracts, or shared abstractions.

## Impact

- Affected code:
  - `src/shared/hooks/use-overlay.ts`
  - new or updated Vitest tests for shared overlay orchestration
  - `docs/implementation/FRONTEND.md`
  - `docs/implementation/WORKFLOW.md` or `docs/implementation/QUALITY_SCORE.md`
  - OpenSpec specs for shared overlay orchestration and test-suite coverage
- Public API impact:
  - No breaking change to `useOverlay<T>()`, `OverlayState`, routes, or feature components.
- Dependencies:
  - No new runtime dependency.
- Roles and multi-tenant impact:
  - No role, permission, or tenant-scope behavior changes.
  - Existing route-level permission checks and feature lifecycle rules remain unchanged.

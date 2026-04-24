## Context

Entity list routes use `useOverlay<T>()` as the shared route-local orchestration layer for create/edit/details/delete/restore overlays. The hook exposes a stable object shape consumed by routes and shared modal/drawer wrappers through `OverlayState`.

Current behavior is correct for the documented frontend pattern, but the implementation uses internal casts to read selected data from a discriminated union. This weakens maintainability because the type system does not fully prove the same invariant the runtime state is enforcing.

The project also now requires behavior-changing feature, refactor, and shared-code work to include Vitest coverage. This refactor is a small shared abstraction change, so it should land with focused hook tests and documentation updates.

## Goals / Non-Goals

**Goals:**

- Preserve the public `useOverlay<T>()` API and all route call sites.
- Make overlay transitions explicit with reducer actions.
- Remove unsafe selected-data casts from render paths by using type guards.
- Keep exactly one active overlay per hook instance.
- Add Vitest coverage for the hook contract.
- Update implementation docs so future feature/refactor/new-code changes include matching Vitest coverage.

**Non-Goals:**

- Do not introduce `@ebay/nice-modal-react` or another modal state manager.
- Do not move overlay state to global context, URL search state, or feature slices.
- Do not change `OverlayState`, modal components, drawers, confirmations, or entity routes.
- Do not change role, tenant, or business lifecycle behavior.

## Decisions

### Keep the existing public API

The refactor will keep route code such as `overlay.create.open()`, `overlay.edit.open(id)`, and `overlay.details.render((id, state) => ...)` unchanged.

Alternative considered: rename the API around generic `open(key, data)` calls. Rejected because it would weaken route readability and lose TypeScript enforcement that `create` has no payload while data overlays require one.

### Use a reducer for internal state transitions

The hook will represent transitions with explicit actions such as close, open create, and open data overlay. This makes the allowed state changes clear and testable without changing consumer behavior.

Alternative considered: keep `useState` and only add a type guard. Rejected because it removes casts but does not make transition intent as explicit.

### Use type guards for selected data

Data overlay render functions will call a narrow type guard before passing selected data to the render callback. This keeps the discriminated union useful and avoids implementation-only casts.

Alternative considered: store `selected?: T` on every state variant. Rejected because it would allow impossible states such as `create` carrying selected entity data.

### Keep route-local ownership

Each entity route or nested section will still own its overlay state by calling `useOverlay<T>()`. This preserves list context and prevents unrelated routes or sections from interfering with one another.

Alternative considered: app-level modal registry. Rejected because current entity overlays are local route composition concerns, not cross-app commands.

### Test behavior, not implementation internals

Vitest coverage will exercise the public hook API using React hook/component testing utilities. Tests should verify open/close/render behavior rather than reducer action names.

Alternative considered: export reducer and test it directly. Rejected because the reducer is an implementation detail and exporting it would expand the shared API unnecessarily.

## Risks / Trade-offs

- Refactor accidentally changes route behavior -> Mitigate with hook-level Vitest tests for all overlay scopes and current render semantics.
- Memoization changes create stale state in callbacks -> Mitigate by testing open, close, onOpenChange, and render after state transitions.
- Tests couple to implementation shape -> Mitigate by testing only returned hook API.
- Documentation duplicates rules across files -> Mitigate by placing detailed test mandate in the owning implementation workflow/quality docs and keeping frontend docs focused on overlay behavior.

## Migration Plan

1. Add tests that describe the current `useOverlay<T>()` behavior.
2. Refactor hook internals to reducer actions and type guards without changing exports.
3. Update docs to require Vitest coverage for behavior-changing feature/refactor/new-code work.
4. Run the focused Vitest test file and, if feasible, the existing frontend orchestration boundary test.
5. Rollback is low-risk: restore previous `use-overlay.ts` implementation if parity tests fail.

## Open Questions

- None.

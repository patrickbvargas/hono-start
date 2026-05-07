## Context

Entity routes and nested sections use `useOverlay<T>()` as the shared route-local orchestration layer for create, edit, details, delete, and restore overlays. The current hook exposes the right route-facing API, but it stores only one active overlay key at a time. That makes details drawers disappear when a nested action opens a confirmation dialog or edit form from inside the drawer.

The chosen direction is to keep the unified named-scope API and change only the internal state model. This keeps route call sites stable while allowing multiple overlays in the same hook instance when the route composition intentionally renders them together.

## Goals / Non-Goals

**Goals:**

- Preserve the existing public `useOverlay<T>()` route-facing API for named overlay scopes.
- Allow `create`, `edit`, `details`, `delete`, and `restore` to open independently inside one hook instance.
- Keep `render(...)` and `OverlayState` compatible with existing shared modal, alert-dialog, and drawer wrappers.
- Ensure each overlay closes only itself when `close()` or `onOpenChange(false)` runs.
- Add focused Vitest coverage for concurrent open and close behavior.

**Non-Goals:**

- Do not replace the hook with a lower-level per-overlay primitive API.
- Do not add global overlay state, context, or URL search state.
- Do not change route composition structure or shared overlay wrapper components.
- Do not enforce new overlay exclusivity groups such as "only one modal at a time".

## Decisions

### Store overlay state per named scope

The hook will move from a single discriminated union to a per-key state object. Each named scope will track its own `isOpen` flag, and data overlays will also keep their own selected item. This matches the required behavior without changing call sites.

Alternative considered: keep the single-key state and special-case `details` so drawers stay open under dialogs. Rejected because it solves only the current drawer flow and fails future cases such as delete inside an edit form.

### Keep named scope API unchanged

Routes will continue using `overlay.create.open()`, `overlay.edit.open(id)`, and `overlay.details.render((id, state) => ...)`. The shared hook remains the canonical overlay composition surface for routes.

Alternative considered: expose multiple independent `useOverlay()` instances or a generic `open(key, data)` API. Rejected because the user explicitly asked to keep the unified surface without losing current usage patterns.

### Replace single-active metadata with multi-open metadata

`activeKey` cannot stay truthful once more than one overlay may be open. The hook will expose `openKeys` as the derived list of currently open scopes. Existing code does not appear to consume `activeKey`, so replacing it is the least confusing option.

Alternative considered: keep `activeKey` as "last opened key". Rejected because it would look authoritative while no longer representing the actual hook state.

### Keep close behavior local to each scope

Each scope's `close` function and `onOpenChange(false)` handler will only update that scope. Unrelated close signals must not affect other open overlays in the same hook instance.

Alternative considered: `close()` closes all overlays. Rejected because it breaks existing `onSuccess={state.close}` semantics for nested flows and makes one overlay able to tear down another unexpectedly.

## Risks / Trade-offs

- Concurrent overlays can create combinations the old hook prevented -> Mitigation: keep route composition explicit and test coexistence paths so only rendered combinations matter.
- Replacing `activeKey` can affect hidden consumers -> Mitigation: search the repo, replace with `openKeys`, and verify no route-facing code depends on single-active semantics.
- Independent overlay payloads could become stale if a row changes while multiple overlays stay open -> Mitigation: preserve current selected-item snapshot semantics and keep data-fetching behavior owned by mounted overlay components.
- Tests can drift toward implementation details -> Mitigation: assert only public hook behavior through the returned overlay scopes.

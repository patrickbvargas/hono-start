## Why

The shared overlay hook currently enforces a single active overlay per hook instance, which causes a details drawer to close as soon as a delete or edit overlay opens from inside that drawer. This blocks nested management flows that the product now needs and makes future overlay combinations harder to support.

## What Changes

- Update the shared overlay hook so `create`, `edit`, `details`, `delete`, and `restore` each keep their own open state within the same hook instance.
- Preserve the existing route-facing API shape so current routes and shared overlay wrappers can keep using named overlay scopes.
- Replace single-active overlay metadata with multi-open metadata that reflects all currently open overlay scopes.
- Add focused Vitest coverage for concurrent overlay behavior, including independent open, render, and close flows.
- Update frontend contract docs to reflect that one hook instance may keep multiple overlays open when route composition allows it.

## Non-goals

- Do not replace the shared overlay hook with a more primitive per-overlay hook API.
- Do not introduce a global modal registry or URL-backed overlay state.
- Do not redesign route composition or shared modal, drawer, and confirmation wrappers.
- Do not change role, tenant, or business lifecycle behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `shared-overlay-orchestration`: change the shared hook contract from single-active overlay orchestration to independent named overlay scopes that may coexist within one hook instance.

## Impact

- Affected code:
  - `src/shared/hooks/use-overlay.ts`
  - `src/shared/hooks/__tests__/use-overlay.test.ts`
  - `docs/implementation/FRONTEND.md`
- Public API impact:
  - Route code keeps the existing `overlay.create/edit/details/delete/restore` surface.
  - `activeKey` can no longer represent hook state truthfully and must be replaced or removed.
- Dependencies:
  - No new runtime dependency.
- Roles and multi-tenant impact:
  - No role or tenant behavior changes.

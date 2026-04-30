## Why

Entity detail drawers currently suspend the surrounding route while the detail query is still fetching. When a user opens a details drawer from a list screen, the background table disappears or flickers until the query resolves, which breaks list-context preservation and makes the interface feel unstable.

This should be corrected now because the documented route and overlay pattern already requires list context to remain visible while overlays are open, and the current implementation violates that interaction contract across multiple entity screens.

## What Changes

- Keep entity list content visible while detail drawers load entity data.
- Show a skeleton fallback inside the detail drawer instead of allowing the route body to suspend.
- Standardize the detail-drawer loading pattern across clients, employees, contracts, fees, and remunerations.
- Add focused verification for the shared detail-overlay loading contract.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `shared-overlay-orchestration`: detail drawers must isolate loading UI to the drawer content so route list context remains visible while detail data fetches.

## Impact

- Affected code: shared detail drawer wrapper, feature detail components for clients, employees, contracts, fees, and remunerations, and route-orchestration tests.
- APIs: no server API or query contract changes.
- Dependencies: no new dependencies.

## Non-goals

- Changing list-route loaders or primary table query behavior.
- Reworking delete, restore, create, or edit overlays.
- Introducing a new global loading system for overlays.

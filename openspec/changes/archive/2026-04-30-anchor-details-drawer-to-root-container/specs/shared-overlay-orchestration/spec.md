## MODIFIED Requirements

### Requirement: Shared overlay hook preserves entity route API compatibility
The shared overlay hook SHALL keep the existing route-facing API shape so entity routes and feature components can continue using the documented overlay composition pattern, and detail drawers SHALL preserve visible list context while their entity data is still loading. Detail drawers SHALL anchor their overlay and sliding panel to the root authenticated app container instead of the global viewport.

#### Scenario: Route opens and renders overlays through named scopes
- **WHEN** an entity route consumes the hook
- **THEN** it SHALL be able to call named `create`, `edit`, `details`, `delete`, and `restore` scopes
- **AND** each scope SHALL expose `isOpen`, `open`, `close`, and `render` behavior compatible with existing route composition

#### Scenario: Shared components receive stable overlay state
- **WHEN** a render callback mounts a form modal, confirmation dialog, or details drawer
- **THEN** the callback SHALL receive an overlay state object with `isOpen`, `onOpenChange`, and `close`
- **AND** that object SHALL remain compatible with shared modal, alert-dialog, and drawer wrappers

#### Scenario: Detail drawer loading stays local to the drawer
- **WHEN** a user opens a details overlay whose entity query is not yet in cache
- **THEN** the route's list content SHALL remain visible behind the drawer
- **AND** the drawer SHALL render skeleton-style loading feedback inside the overlay until the entity data resolves

#### Scenario: Detail drawer shows loaded content after suspense resolves
- **WHEN** the detail query resolves successfully
- **THEN** the drawer SHALL replace the loading skeleton with the entity detail content
- **AND** the route SHALL continue preserving the same list context while the drawer is open

#### Scenario: Detail drawer opens from the app container edge
- **WHEN** a user opens a details overlay on a centered authenticated page
- **THEN** the overlay backdrop SHALL cover only the root app container bounds
- **AND** the drawer panel SHALL slide from the container's edge toward its center instead of from the browser viewport edge

#### Scenario: Overlay orchestration stays route-local
- **WHEN** separate route sections or components create separate hook instances
- **THEN** each hook instance SHALL manage its own active overlay independently
- **AND** no global modal registry SHALL be required for entity overlay composition

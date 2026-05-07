## MODIFIED Requirements

### Requirement: Shared overlay hook controls route-local named overlays independently
The system SHALL provide a shared overlay hook for entity route composition that controls create, edit, details, delete, and restore overlays within the hook instance that opened them. Each named overlay scope SHALL keep its own open state, and opening one scope MUST NOT implicitly close another scope in the same hook instance.

#### Scenario: Create overlay opens without entity data
- **WHEN** route code opens the create overlay
- **THEN** the create overlay SHALL become open without requiring entity data
- **AND** create rendering SHALL receive overlay state compatible with shared wrappers

#### Scenario: Entity overlay opens with selected data
- **WHEN** route code opens edit, details, delete, or restore with selected entity data
- **THEN** that overlay SHALL become open with the selected entity data
- **AND** rendering for that overlay SHALL receive the selected entity data and overlay state

#### Scenario: Opening another overlay keeps existing overlays mounted
- **WHEN** one overlay is already open and route code opens another overlay in the same hook instance
- **THEN** the previously open overlay SHALL remain renderable until it is explicitly closed
- **AND** the newly opened overlay SHALL also become renderable

#### Scenario: Closing one overlay leaves other open overlays intact
- **WHEN** one open overlay is closed through its close function or `onOpenChange(false)`
- **THEN** only that overlay SHALL stop rendering
- **AND** any other open overlay in the same hook instance SHALL remain open

#### Scenario: Unrelated close signal is ignored for closed overlays
- **WHEN** a closed overlay receives `onOpenChange(false)`
- **THEN** the currently open overlays in the same hook instance SHALL remain unchanged

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
- **AND** the skeleton field groups SHALL preserve the same vertical spacing and line heights used by the final detail field layout while keeping their existing width pattern

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
- **THEN** each hook instance SHALL manage its own overlay scopes independently
- **AND** no global modal registry SHALL be required for entity overlay composition

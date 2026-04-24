# shared-overlay-orchestration Specification

## Purpose

Define the shared route-local overlay orchestration contract used by entity routes and nested entity sections.

## Requirements

### Requirement: Shared overlay hook controls one route-local overlay at a time
The system SHALL provide a shared overlay hook for entity route composition that controls create, edit, details, delete, and restore overlays within the hook instance that opened them.

#### Scenario: Create overlay opens without entity data
- **WHEN** route code opens the create overlay
- **THEN** only the create overlay SHALL be active
- **AND** create rendering SHALL receive overlay state without requiring entity data

#### Scenario: Entity overlay opens with selected data
- **WHEN** route code opens edit, details, delete, or restore with selected entity data
- **THEN** only that overlay SHALL be active
- **AND** rendering for that overlay SHALL receive the selected entity data and overlay state

#### Scenario: Opening another overlay replaces the active overlay
- **WHEN** one overlay is active and route code opens another overlay in the same hook instance
- **THEN** the previous overlay SHALL no longer render
- **AND** the newly opened overlay SHALL become the only active overlay

#### Scenario: Closing active overlay clears state
- **WHEN** the active overlay is closed through its close function or `onOpenChange(false)`
- **THEN** no overlay SHALL remain active
- **AND** render callbacks for all overlay scopes SHALL return no content

#### Scenario: Unrelated close signal is ignored
- **WHEN** an inactive overlay receives `onOpenChange(false)`
- **THEN** the currently active overlay SHALL remain active

### Requirement: Shared overlay hook preserves entity route API compatibility
The shared overlay hook SHALL keep the existing route-facing API shape so entity routes and feature components can continue using the documented overlay composition pattern.

#### Scenario: Route opens and renders overlays through named scopes
- **WHEN** an entity route consumes the hook
- **THEN** it SHALL be able to call named `create`, `edit`, `details`, `delete`, and `restore` scopes
- **AND** each scope SHALL expose `isOpen`, `open`, `close`, and `render` behavior compatible with existing route composition

#### Scenario: Shared components receive stable overlay state
- **WHEN** a render callback mounts a form modal, confirmation dialog, or details drawer
- **THEN** the callback SHALL receive an overlay state object with `isOpen`, `onOpenChange`, and `close`
- **AND** that object SHALL remain compatible with shared modal, alert-dialog, and drawer wrappers

#### Scenario: Overlay orchestration stays route-local
- **WHEN** separate route sections or components create separate hook instances
- **THEN** each hook instance SHALL manage its own active overlay independently
- **AND** no global modal registry SHALL be required for entity overlay composition

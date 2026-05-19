## MODIFIED Requirements

### Requirement: Desktop sidebar is collapsible
On desktop (`md` and above), `AppLayout` SHALL render a persistent sidebar that can be toggled between expanded (icon + label) and collapsed (icon-only) states via a toggle button. The collapsed desktop state SHALL keep the sidebar mounted in a compact width so navigation icons remain visible and interactive instead of moving the entire sidebar off-canvas.

#### Scenario: User collapses sidebar on desktop
- **WHEN** the user clicks the collapse/expand toggle button on desktop
- **THEN** the sidebar width narrows to icon-only view
- **AND** route labels are hidden
- **AND** navigation icons remain visible and clickable inside the compact sidebar

#### Scenario: User expands sidebar on desktop
- **WHEN** the sidebar is in collapsed state and the user clicks the toggle button
- **THEN** the sidebar expands to show both icons and route labels

#### Scenario: Collapse does not remove navigation shell
- **WHEN** the sidebar enters collapsed state on desktop
- **THEN** the authenticated shell layout remains side-by-side with the main content
- **AND** the sidebar does not slide fully out of view

## MODIFIED Requirements

### Requirement: Mobile sidebar renders as a Drawer
On mobile (below `md` breakpoint), the persistent sidebar SHALL be hidden. A hamburger trigger button SHALL be visible. Tapping it SHALL open a shared UI Drawer from the left side containing the same navigation items.

#### Scenario: User opens mobile navigation
- **WHEN** the user taps the hamburger button on a mobile viewport
- **THEN** a Drawer slides in from the left containing all navigation items

#### Scenario: User closes mobile Drawer
- **WHEN** the Drawer is open and the user taps outside or taps a navigation item
- **THEN** the Drawer closes

# Spec: app-layout

## Purpose

`AppLayout` is the top-level shell component that wraps all authenticated page content. It renders the sidebar and the main content area side by side and manages responsive layout behaviour across desktop and mobile viewports.

---

## Requirements

### Requirement: Layout wraps all authenticated content
`AppLayout` SHALL be mounted by a TanStack Router pathless layout route at `_app/route.tsx` and SHALL render as the top-level shell for all authenticated product pages via `<Outlet />`. It SHALL contain the sidebar and the main content area side by side so that every post-login page is rendered inside the same authenticated container instead of mounting its own shell independently.

#### Scenario: All authenticated pages render inside AppLayout
- **WHEN** a signed-in user navigates to any authenticated product route
- **THEN** the route content is rendered inside the shared `AppLayout` main area alongside the sidebar

#### Scenario: Authenticated route leaves do not mount their own shell
- **WHEN** an authenticated route such as `/`, `/clientes`, or `/contratos` is rendered
- **THEN** the page content is provided through the `_app` layout `Outlet`
- **AND** the route leaf does not need to wrap itself with a second authenticated shell container

### Requirement: Container breakpoints applied
`AppLayout` SHALL wrap its content in a Tailwind `container` class element so that standard Tailwind breakpoints govern max-width and padding.

#### Scenario: Content respects container bounds
- **WHEN** the user views the app at any viewport width
- **THEN** the layout content is constrained by the `container` class breakpoints

### Requirement: Desktop sidebar is collapsible
On desktop (`md` and above), `AppLayout` SHALL render a persistent sidebar that can be toggled between expanded (icon + label) and collapsed (icon-only) states via a toggle button.

#### Scenario: User collapses sidebar on desktop
- **WHEN** the user clicks the collapse/expand toggle button on desktop
- **THEN** the sidebar width narrows to icon-only view and route labels are hidden

#### Scenario: User expands sidebar on desktop
- **WHEN** the sidebar is in collapsed state and the user clicks the toggle button
- **THEN** the sidebar expands to show both icons and route labels

### Requirement: Mobile sidebar renders as a Drawer
On mobile (below `md` breakpoint), the persistent sidebar SHALL be hidden. A hamburger trigger button SHALL be visible. Tapping it SHALL open a shared UI Drawer from the left side containing the same navigation items.

#### Scenario: User opens mobile navigation
- **WHEN** the user taps the hamburger button on a mobile viewport
- **THEN** a Drawer slides in from the left containing all navigation items

#### Scenario: User closes mobile Drawer
- **WHEN** the Drawer is open and the user taps outside or taps a navigation item
- **THEN** the Drawer closes

### Requirement: Sidebar collapse state is local
The sidebar collapsed/expanded state SHALL be managed as local component state. It SHALL NOT be persisted to `localStorage` or URL params.

#### Scenario: Collapse state resets on page reload
- **WHEN** the user reloads the page
- **THEN** the sidebar returns to its default state (expanded on desktop)

# Spec: sidebar-nav

## Purpose

`SidebarNav` is the navigation component rendered inside the sidebar shell. It displays all application routes as selectable list items with icons and labels, highlights the active route, and supports collapsed (icon-only) mode.

---

## Requirements

### Requirement: All ROUTES rendered as navigation items
`SidebarNav` SHALL render every entry from the `ROUTES` constant in `src/shared/config/routes.ts` as accessible navigation items through the shared UI layer. Each item SHALL display the route's icon and title.

#### Scenario: All routes appear in the sidebar
- **WHEN** the sidebar is rendered
- **THEN** all 8 routes (Dashboard, Clientes, Contratos, Honorários, Remunerações, Colaboradores, Configurações, Suporte) are visible as navigation items

#### Scenario: Each item shows icon and label
- **WHEN** the sidebar is in expanded mode
- **THEN** each navigation item displays its Lucide icon alongside its Portuguese title

### Requirement: Active route is visually highlighted
`SidebarNav` SHALL compare the current router pathname against each route's `url` and apply an active visual state to the matching shared navigation item.

#### Scenario: Current route item is highlighted
- **WHEN** the user is on the `/clientes` route
- **THEN** the "Clientes" item is visually highlighted as active

#### Scenario: Active state updates on navigation
- **WHEN** the user navigates to a different route
- **THEN** the previously active item loses its highlight and the new route item becomes highlighted

### Requirement: Navigation items use TanStack Router Link
Each `ListBox.Item` SHALL use TanStack Router's `Link` component to navigate to its route URL, enabling client-side SPA navigation without full page reloads.

#### Scenario: User clicks a navigation item
- **WHEN** the user clicks or presses Enter on a route item
- **THEN** TanStack Router navigates to the corresponding route without a full page reload

### Requirement: Collapsed mode shows icons only
When sidebar navigation enters collapsed desktop mode, route labels SHALL be hidden and only route icons SHALL be visible for primary navigation items. Icons SHALL remain visible, aligned, and interactive at all times, while non-essential group text may be hidden.

#### Scenario: Labels hidden in collapsed mode
- **WHEN** the sidebar is in collapsed desktop mode
- **THEN** route title text is not visible
- **AND** each primary navigation item still shows its icon

#### Scenario: Icons remain interactive in collapsed mode
- **WHEN** the sidebar is in collapsed desktop mode
- **THEN** a user can click or focus a route icon to navigate to its route

#### Scenario: Labels visible in expanded mode
- **WHEN** the sidebar is in expanded mode
- **THEN** both icon and title text are displayed for each route item

### Requirement: Keyboard navigation supported
Users SHALL be able to move focus between navigation items with keyboard controls and activate the focused item with Enter through accessible shared UI behavior.

#### Scenario: Keyboard navigation through items
- **WHEN** the sidebar has focus and the user presses the ArrowDown key
- **THEN** focus moves to the next navigation item

#### Scenario: Keyboard activation of item
- **WHEN** a navigation item has focus and the user presses Enter
- **THEN** the browser navigates to that route

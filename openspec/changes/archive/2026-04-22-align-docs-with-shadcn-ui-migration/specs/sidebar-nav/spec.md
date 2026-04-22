## MODIFIED Requirements

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

### Requirement: Keyboard navigation supported
Users SHALL be able to move focus between navigation items with keyboard controls and activate the focused item with Enter through accessible shared UI behavior.

#### Scenario: Keyboard navigation through items
- **WHEN** the sidebar has focus and the user presses the ArrowDown key
- **THEN** focus moves to the next navigation item

#### Scenario: Keyboard activation of item
- **WHEN** a navigation item has focus and the user presses Enter
- **THEN** the browser navigates to that route

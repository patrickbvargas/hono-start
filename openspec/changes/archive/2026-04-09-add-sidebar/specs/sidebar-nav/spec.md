## ADDED Requirements

### Requirement: All ROUTES rendered as navigation items
`SidebarNav` SHALL render every entry from the `ROUTES` constant in `src/shared/config/routes.ts` as a `ListBox.Item` using HeroUI's `ListBox` component. Each item SHALL display the route's icon and title.

#### Scenario: All routes appear in the sidebar
- **WHEN** the sidebar is rendered
- **THEN** all 8 routes (Dashboard, Clientes, Contratos, Honorários, Remunerações, Colaboradores, Configurações, Suporte) are visible as list items

#### Scenario: Each item shows icon and label
- **WHEN** the sidebar is in expanded mode
- **THEN** each navigation item displays its Lucide icon alongside its Portuguese title

### Requirement: Active route is visually highlighted
`SidebarNav` SHALL compare the current router pathname against each route's `url` and apply an active/selected visual state to the matching item using HeroUI's `ListBox` selection mechanism.

#### Scenario: Current route item is highlighted
- **WHEN** the user is on the `/clientes` route
- **THEN** the "Clientes" item is visually highlighted as selected in the ListBox

#### Scenario: Active state updates on navigation
- **WHEN** the user navigates to a different route
- **THEN** the previously active item loses its highlight and the new route item becomes highlighted

### Requirement: Navigation items use TanStack Router Link
Each `ListBox.Item` SHALL use TanStack Router's `Link` component to navigate to its route URL, enabling client-side SPA navigation without full page reloads.

#### Scenario: User clicks a navigation item
- **WHEN** the user clicks or presses Enter on a route item
- **THEN** TanStack Router navigates to the corresponding route without a full page reload

### Requirement: Collapsed mode shows icons only
When `SidebarNav` receives `isCollapsed={true}`, route labels SHALL be hidden and only icons SHALL be visible. Icons SHALL remain visible at all times.

#### Scenario: Labels hidden in collapsed mode
- **WHEN** `isCollapsed` is `true`
- **THEN** route title text is not visible but icons remain visible

#### Scenario: Labels visible in expanded mode
- **WHEN** `isCollapsed` is `false`
- **THEN** both icon and title text are displayed for each route item

### Requirement: Keyboard navigation supported
Users SHALL be able to navigate between items using arrow keys and activate the focused item with Enter, as provided by HeroUI `ListBox`'s built-in keyboard handling.

#### Scenario: Keyboard navigation through items
- **WHEN** the sidebar has focus and the user presses the ArrowDown key
- **THEN** focus moves to the next navigation item

#### Scenario: Keyboard activation of item
- **WHEN** a navigation item has focus and the user presses Enter
- **THEN** the browser navigates to that route

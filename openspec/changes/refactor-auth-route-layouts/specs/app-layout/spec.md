## MODIFIED Requirements

### Requirement: Layout wraps all authenticated content
`AppLayout` SHALL be mounted by a TanStack Router pathless layout route at `_app/route.tsx` and SHALL render as the top-level shell for all authenticated product pages via `<Outlet />`. It SHALL contain the sidebar and the main content area side by side so that every post-login page is rendered inside the same authenticated container instead of mounting its own shell independently.

#### Scenario: All authenticated pages render inside AppLayout
- **WHEN** a signed-in user navigates to any authenticated product route
- **THEN** the route content is rendered inside the shared `AppLayout` main area alongside the sidebar

#### Scenario: Authenticated route leaves do not mount their own shell
- **WHEN** an authenticated route such as `/`, `/clientes`, or `/contratos` is rendered
- **THEN** the page content is provided through the `_app` layout `Outlet`
- **AND** the route leaf does not need to wrap itself with a second authenticated shell container

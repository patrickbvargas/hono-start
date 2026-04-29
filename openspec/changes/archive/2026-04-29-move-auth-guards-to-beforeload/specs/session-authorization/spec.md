## ADDED Requirements

### Requirement: Protected route session enforcement happens before child route loading
The system SHALL require authenticated session access for protected TanStack Router layout routes in `beforeLoad` so protected child routes are blocked before their loaders and render paths continue. Shared session helpers used by route gating MUST remain the canonical source for route-level session decisions.

#### Scenario: Protected child route loader does not become the first auth gate
- **WHEN** a protected child route is entered through the authenticated layout
- **THEN** the layout-level `beforeLoad` check runs before child route data loading continues
- **AND** protected access does not depend on each child route repeating the same session redirect logic

#### Scenario: Shared session helper remains authoritative for route gating
- **WHEN** the router evaluates whether a protected layout route may continue
- **THEN** it uses the shared session helper contract from `src/shared/session`
- **AND** it does not introduce a separate route-local authentication source

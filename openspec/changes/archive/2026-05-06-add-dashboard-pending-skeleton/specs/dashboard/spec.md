## ADDED Requirements

### Requirement: Dashboard pending skeleton
The system SHALL render a dedicated structural skeleton while the authenticated dashboard route is pending before summary data finishes loading.

#### Scenario: User opens dashboard during initial loader pending
- **WHEN** an authenticated user opens `/` and the dashboard loader is still pending
- **THEN** the system renders a dashboard-specific skeleton instead of a standalone spinner
- **AND** the skeleton preserves the visible page structure of dashboard header, metric cards, financial evolution surface, remuneration table, and breakdown surfaces

#### Scenario: Dashboard skeleton mirrors analytical wrappers
- **WHEN** the dashboard pending skeleton is visible
- **THEN** each analytical placeholder uses the same outer `Card` visual wrapper pattern as the loaded dashboard surfaces
- **AND** the main dashboard pending content stays inside the shared wrapper body with internal scroll behavior preserved

#### Scenario: Dashboard skeleton avoids visual jump on hydration
- **WHEN** the dashboard loader resolves and replaces the pending skeleton with loaded content
- **THEN** the visible block order, spacing rhythm, and responsive grouping stay aligned with the loaded dashboard layout
- **AND** the transition does not introduce placeholder borders or decorative shapes absent from the final UI

#### Scenario: Dashboard pending skeleton stays role-agnostic
- **WHEN** administrators and regular users load the dashboard
- **THEN** both roles see the same structural dashboard skeleton during initial pending
- **AND** role-scoped data differences only appear after the real dashboard data resolves

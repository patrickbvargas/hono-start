## ADDED Requirements

### Requirement: Shared chart helpers stay behind the shared UI boundary
The application MUST expose reusable chart helpers through `@/shared/components/ui` so route and feature code can compose Recharts charts without importing vendor UI helper modules directly.

#### Scenario: Feature renders shared chart helpers
- **WHEN** a route or feature component needs chart container, tooltip, or legend helpers
- **THEN** it imports those helpers from `@/shared/components/ui`
- **AND** it does not import chart helper modules from vendor-specific paths outside the shared UI layer

#### Scenario: Dashboard renders financial evolution chart
- **WHEN** the dashboard feature renders the monthly financial evolution chart
- **THEN** it consumes shared chart helpers from `@/shared/components/ui`
- **AND** it composes them with Recharts chart primitives inside the feature

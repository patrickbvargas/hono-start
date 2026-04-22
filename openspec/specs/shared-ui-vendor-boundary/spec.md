# shared-ui-vendor-boundary Specification

## Purpose
TBD - created by archiving change remove-heroui-from-project. Update Purpose after archive.
## Requirements
### Requirement: Live UI code uses shared shadcn UI boundary
The application SHALL consume reusable UI components from `@/shared/components/ui` or existing shared composites instead of the HeroUI compatibility layer.

#### Scenario: Feature code imports UI components
- **WHEN** a route or feature component needs reusable UI primitives
- **THEN** it imports them from `@/shared/components/ui` or a shared composite that itself follows the shared UI boundary

#### Scenario: HeroUI compatibility imports are searched
- **WHEN** live application source is searched for `@/shared/components/Hui`, `src/shared/components/Hui`, or `shared/components/Hui`
- **THEN** no route, feature, or live shared component imports those paths

### Requirement: HeroUI compatibility layer is removed
The repository SHALL NOT keep the temporary `src/shared/components/Hui` compatibility folder after all live consumers have migrated.

#### Scenario: Compatibility folder lookup
- **WHEN** the repository tree is inspected after the migration
- **THEN** `src/shared/components/Hui` is absent

### Requirement: HeroUI packages are absent from runtime dependencies
The package manifest and lockfile SHALL NOT include HeroUI packages after the migration.

#### Scenario: Package files are searched
- **WHEN** package files are searched for `@heroui/react`, `@heroui/styles`, `heroui`, or `HeroUI`
- **THEN** no live dependency entry references HeroUI packages

### Requirement: Existing UI workflows are preserved
The migration SHALL preserve existing user-facing workflows while replacing the underlying UI primitives.

#### Scenario: Entity list action menus
- **WHEN** a user opens an entity table row action menu
- **THEN** the same available view, edit, delete, and restore actions remain available according to the existing lifecycle rules

#### Scenario: Entity forms and filters
- **WHEN** a user opens entity create/edit forms or list filters
- **THEN** required fields, validation messages, disabled states, filter controls, and submit/reset behavior remain equivalent to the pre-migration behavior

#### Scenario: Contract tabbed form
- **WHEN** a user edits contract data, assignments, or revenues
- **THEN** tab selection, hidden-section validation indicators, dynamic row add/remove controls, and maximum-row disabled states remain available

#### Scenario: Dashboard summary
- **WHEN** a user views the dashboard
- **THEN** summary cards, scoped badge, tone indicators, comparisons, breakdowns, and recent activity remain visible with equivalent content


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

### Requirement: Entity row actions use a shared menu component
Entity list tables SHALL render repeated view, edit, restore, and delete row action menus through a shared component under `src/shared/components` while preserving feature-owned lifecycle and permission decisions.

#### Scenario: Standard active entity row actions render

- **WHEN** an entity table row is active and the feature allows viewing, editing, and deletion
- **THEN** the row action menu presents `Visualizar`, `Editar`, and `Excluir` in the standard order
- **AND** the delete action uses the destructive visual treatment

#### Scenario: Soft-deleted entity row actions render

- **WHEN** an entity table row is soft-deleted and the feature allows restoration
- **THEN** the row action menu presents `Visualizar` and `Restaurar`
- **AND** unavailable edit and delete actions are not shown

#### Scenario: Feature-specific edit blocking is preserved

- **WHEN** a feature determines that a row cannot be edited because of domain lifecycle state
- **THEN** the shared row action menu omits `Editar` according to the feature-provided action state
- **AND** the shared component does not recalculate that domain rule itself

#### Scenario: Shared UI boundary is preserved

- **WHEN** feature table code renders row action menus
- **THEN** it consumes the shared entity action menu component
- **AND** feature table code does not import dropdown primitives directly solely to render the standard entity row actions

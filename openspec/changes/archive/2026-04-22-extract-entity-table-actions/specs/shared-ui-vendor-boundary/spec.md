## ADDED Requirements

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

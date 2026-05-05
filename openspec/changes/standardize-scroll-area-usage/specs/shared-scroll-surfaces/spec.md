## ADDED Requirements

### Requirement: Internal shared content surfaces use the shared ScrollArea boundary
The system SHALL render internal product content regions that own sustained vertical scrolling through the shared `ScrollArea` component exposed by `@/shared/components/ui` instead of ad hoc native overflow containers.

#### Scenario: Shared wrapper owns a long internal content region
- **WHEN** a shared wrapper such as a detail drawer body, sidebar content region, or equivalent overlay body can exceed the available vertical space
- **THEN** that wrapper SHALL render its scrollable region through the shared `ScrollArea`
- **AND** the wrapper SHALL keep sizing classes needed for bounded scrolling, such as `min-h-0` and available flex growth, inside the shared implementation rather than pushing them to each consumer

#### Scenario: Feature code consumes a shared scrollable wrapper
- **WHEN** a feature renders an internal scrollable region through a shared wrapper that already owns the pattern
- **THEN** the feature SHALL consume the wrapper contract
- **AND** the feature SHALL NOT recreate a second ad hoc overflow container for the same scrolling responsibility

### Requirement: Popup primitives remain outside the shared scroll-surface pattern
The system SHALL keep vendor-managed popup list scrolling outside this pattern unless a future change explicitly standardizes those surfaces.

#### Scenario: User opens a command, select, combobox, or dropdown popup
- **WHEN** popup content exceeds the available viewport height
- **THEN** the popup MAY keep its existing primitive-managed overflow behavior
- **AND** the repository SHALL NOT treat that popup as a contract violation of the shared internal scroll-surface pattern

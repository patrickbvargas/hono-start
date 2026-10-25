## MODIFIED Requirements

### Requirement: Default inline contract navigation
Inline contract references in the contract collection SHALL open the contract workspace by default. Contract-list entry SHALL preserve validated return filters; explicit Ver detalhes menu actions SHALL retain drawer consultation. Singular contract relationships from other entity pages or drawers SHALL open the existing contextual contract drawer without leaving the originating record.

#### Scenario: Open process from contract list
- **WHEN** a user activates an inline contract process or identifier in the contract collection
- **THEN** the workspace overview opens with list return context and no detail drawer

#### Scenario: Inspect a related contract
- **WHEN** a user activates a singular contract relationship from a fee or remuneration record
- **THEN** its contract drawer opens with permitted actions while retaining the originating page and selected tab

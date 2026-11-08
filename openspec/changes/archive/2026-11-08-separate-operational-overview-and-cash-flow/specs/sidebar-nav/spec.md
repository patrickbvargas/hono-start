# sidebar-nav Specification Delta

## MODIFIED Requirements

### Requirement: Sidebar Navigation Structure
The system SHALL display `Visão operacional` under `Operacional` pointing to `/visao-operacional` and `Visão financeira` under `Financeiro` pointing to `/visao-financeira`.

#### Scenario: User navigates sidebar
- **WHEN** an authenticated user inspects the sidebar
- **THEN** the `Operacional` group contains `Visão operacional` linked to `/visao-operacional`
- **AND** the `Financeiro` group contains `Visão financeira` linked to `/visao-financeira`

## ADDED Requirements

### Requirement: Dashboard quick create menu
The system SHALL provide a quick-create action in the dashboard header so authenticated users can start supported creation overlays without navigating to the corresponding list routes first.

#### Scenario: Authenticated user opens dashboard quick-create menu
- **WHEN** an authenticated user opens the dashboard header on `/`
- **THEN** the system shows a `Novo` action
- **AND** activating that action opens a dropdown menu with the creation entries allowed for that session

#### Scenario: User creates client from dashboard
- **WHEN** an authenticated user selects `Cliente` from the dashboard quick-create menu
- **THEN** the system opens the existing client create overlay from the dashboard route
- **AND** successful submission closes the overlay and keeps the user on the dashboard

#### Scenario: User creates contract from dashboard
- **WHEN** an authenticated user selects `Contrato` from the dashboard quick-create menu
- **THEN** the system opens the existing contract create overlay from the dashboard route
- **AND** successful submission closes the overlay and keeps the user on the dashboard

#### Scenario: User creates fee from dashboard
- **WHEN** an authenticated user selects `Honorário` from the dashboard quick-create menu
- **THEN** the system opens the existing fee create overlay from the dashboard route
- **AND** successful submission closes the overlay and keeps the user on the dashboard

#### Scenario: Administrator creates collaborator from dashboard
- **WHEN** an administrator selects `Colaborador` from the dashboard quick-create menu
- **THEN** the system opens the existing collaborator create overlay from the dashboard route
- **AND** successful submission closes the overlay and keeps the user on the dashboard

#### Scenario: Regular user opens dashboard quick-create menu
- **WHEN** a regular user opens the dashboard quick-create menu
- **THEN** the menu does not expose the collaborator creation entry
- **AND** the available entries remain limited to behaviors already permitted for that session

#### Scenario: Unsupported direct-create entities stay absent
- **WHEN** an authenticated user opens the dashboard quick-create menu
- **THEN** the menu does not expose direct-create entries for remuneration, attachment, or standalone revenue creation

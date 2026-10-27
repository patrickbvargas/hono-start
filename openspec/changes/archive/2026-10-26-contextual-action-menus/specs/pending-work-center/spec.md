## ADDED Requirements

### Requirement: Pending work provides contextual contract actions
Pending-work table rows SHALL offer a context menu and visible overflow menu. Mobile cards SHALL expose the equivalent overflow menu. Actions SHALL be Abrir página followed by Ver resumo, with page navigation targeting the issue's destination tab. Page actions SHALL retain validated pending-list return filters, sorting and pagination. Primary row click SHALL retain its existing finance navigation.

#### Scenario: Team destination
- **WHEN** an issue targets team and the user selects Abrir página
- **THEN** the correct contract team tab SHALL open with pendingReturnTo context

#### Scenario: Financial destination
- **WHEN** an issue targets finance and the user selects Abrir página
- **THEN** the contract finance tab SHALL open with pendingReturnTo context

#### Scenario: Contextual inspection
- **WHEN** Ver resumo is selected from a row or card menu
- **THEN** the contract summary SHALL open without replacing the list URL and dismissal SHALL preserve list state

#### Scenario: Menu parity and access
- **WHEN** an authorized user opens the context menu by right click or keyboard, or opens overflow
- **THEN** equivalent permitted actions SHALL be shown, nested controls SHALL retain their behavior and Escape SHALL restore trigger focus

## MODIFIED Requirements

### Requirement: Authorized contextual navigation
The system MUST enforce authenticated firm, contract assignment visibility and independent financial read scopes before returning rows or counts. Primary row actions SHALL open the contract finance tab; explicit page menu actions SHALL target the issue finance/team tab and summary menu actions SHALL retain contextual inspection. Permitted entity links SHALL retain contextual drawers.

#### Scenario: Restricted financial subject
- **WHEN** the actor lacks financial read scope for a contract
- **THEN** none of its financial issues or related counts SHALL be returned

#### Scenario: Automatic resolution
- **WHEN** the originating data is corrected through existing workflows
- **THEN** refreshed data SHALL remove resolved alerts without manual dismissal

## ADDED Requirements

### Requirement: Dashboard rows expose equivalent action menus
Dashboard drilldown rows SHALL offer Abrir página followed by Ver resumo through right-click and visible overflow menus, including narrow viewports. Direct navigation SHALL target the row's persisted record without first mounting a summary. Existing read grants and protected entity routes SHALL remain enforced. Primary click and Enter/Space SHALL retain summary opening.

#### Scenario: Mixed financial records
- **WHEN** the user selects Abrir página for a receipt, remuneration or expense row
- **THEN** its corresponding record page SHALL open with that record's ID

#### Scenario: Contract-based movements
- **WHEN** the user selects an action for planned/outstanding installments or a down payment
- **THEN** the action SHALL target their contract

#### Scenario: Inspect and return
- **WHEN** Ver resumo is selected in either menu
- **THEN** the existing summary SHALL open above the modal and dismissal SHALL preserve its filters, sorting, pagination and scroll

#### Scenario: Accessible and authorized menu
- **WHEN** an authorized user uses Shift+F10 or ContextMenu on a row, or opens its overflow button
- **THEN** the same two actions SHALL be available; Escape SHALL dismiss the menu and restore trigger focus
- **AND** unavailable read grants SHALL omit the actions

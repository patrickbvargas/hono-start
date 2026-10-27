# dashboard-row-summary Specification

## Purpose

Enable contextual entity inspection from dashboard drilldown rows while preserving analysis context and existing authorization.

## Requirements

### Requirement: Contextual summaries from dashboard modal rows
The system SHALL open the existing entity summary on click or Enter/Space activation of a dashboard drilldown row, with a Ver resumo tooltip. Receipts MUST target their persisted fee, remunerations and expenses their own record, and planned/outstanding installments and down payments their contract. Interactive controls MUST retain their own behavior.

#### Scenario: Mixed movements
- **WHEN** a user activates a receipt, remuneration or expense in a result modal
- **THEN** the corresponding record drawer opens using its real ID

#### Scenario: Planned installment
- **WHEN** a user activates a planned or outstanding installment or initial down payment
- **THEN** its contract summary opens

### Requirement: Preserve analysis context and access
The system SHALL retain the parent modal, filters, sorting, pagination and scroll while a summary is open. Summary dismissal MUST reveal the same analysis. Existing tenant/resource permissions SHALL remain enforced, with safe failure feedback for inaccessible records.

#### Scenario: Return to analysis
- **WHEN** a user closes the summary
- **THEN** the original modal remains open with its table state intact

#### Scenario: Inaccessible record
- **WHEN** the protected detail request fails
- **THEN** a dismissible safe error appears without exposing record data or closing the analysis

#### Scenario: Nested overlay
- **WHEN** a summary opens over the modal
- **THEN** the drawer is visible and interactive above it and Escape closes the summary first

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

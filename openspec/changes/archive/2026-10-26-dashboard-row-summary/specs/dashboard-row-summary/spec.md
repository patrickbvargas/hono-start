## ADDED Requirements

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

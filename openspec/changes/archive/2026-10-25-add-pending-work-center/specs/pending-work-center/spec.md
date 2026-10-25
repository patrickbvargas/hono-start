## ADDED Requirements

### Requirement: Central operational queue
The system SHALL show Pendências below Contratos, using shared dashboard-style summary cards, URL filters, checkbox multi-selection and server pagination. Summary counts SHALL distinguish issues and contracts.

#### Scenario: Filter queue
- **WHEN** the user searches or selects severity, type, client or collaborator
- **THEN** rows and counts SHALL share the filters, with OR within each multiselect and AND between fields, and the page SHALL reset to one

### Requirement: Actionable financial alerts
The system SHALL derive high severity overdue revenue or remaining balance after all installments are recorded, medium severity next unpaid installment due between today and seven calendar days ahead inclusive, and low severity review for active ACTIVE contracts with at least one active revenue and all active revenues settled. Missing responsible or revenues SHALL NOT generate alerts. Remuneration/expense reconciliation SHALL NOT be inferred.

#### Scenario: Exhausted plan
- **WHEN** all installment numbers have active receipts but a positive remaining balance exists
- **THEN** one high severity remaining-balance issue SHALL appear, replacing any overdue/upcoming issue for that revenue

#### Scenario: Seven day window
- **WHEN** the next unpaid installment falls today or within seven calendar days
- **THEN** an operational contract SHALL receive one medium alert; a later date SHALL not alert

#### Scenario: Review settled contract
- **WHEN** an active ACTIVE contract has all active revenues settled
- **THEN** one low severity review SHALL appear without changing status or claiming an error

#### Scenario: Lifecycle
- **WHEN** an inactive contract has overdue debt
- **THEN** overdue and exhausted-plan issues SHALL remain visible, while upcoming and settled-review alerts SHALL be omitted; deleted contracts SHALL never appear

### Requirement: Server ordering
The queue SHALL support ascending/descending ordering by severity, issue title, contract, client and due date through shared table headers and validated URL search. Severity SHALL sort by high, medium, low; null due dates SHALL remain last. Stable contract/issue identity tiebreakers SHALL prevent pagination drift.

#### Scenario: Sort full collection
- **WHEN** a user orders by contract descending from page two
- **THEN** the server SHALL order the full filtered collection before pagination, reset the page to one and preserve filters

### Requirement: Authorized contextual navigation
The system MUST enforce authenticated firm, contract assignment visibility and independent financial read scopes before returning rows or counts. Actions SHALL open the contract finance tab; permitted entity links SHALL retain contextual drawers.

#### Scenario: Restricted financial subject
- **WHEN** the actor lacks financial read scope for a contract
- **THEN** none of its financial issues or related counts SHALL be returned

#### Scenario: Automatic resolution
- **WHEN** the originating data is corrected through existing workflows
- **THEN** refreshed data SHALL remove resolved alerts without manual dismissal

### Requirement: Clear balance and calendar delay
The queue SHALL show one monetary column named Saldo a receber, representing total remaining value including future installments, and the earliest unpaid due date with calendar days overdue beneath it. A separate Saldo vencido column SHALL NOT be displayed. Rows without overdue dates SHALL omit delay text. Calculation SHALL retain decimal precision and the America/Sao_Paulo reference day.

#### Scenario: Partial receipts
- **WHEN** an installment has partial active receipts
- **THEN** its due date SHALL remain open, its elapsed calendar days SHALL be shown when overdue, and Saldo a receber SHALL reflect the remaining revenue balance

### Requirement: Actionable summary and contextual return
Severity summary cards SHALL apply a single severity filter and reset the page while preserving all other filters, sort and page size. The Pendências card SHALL clear only severity. Contract inline references and finance actions SHALL carry validated pending-list search; the workspace return link SHALL restore those filters, sort and page after tab changes or reloads. Existing contract-list return behavior SHALL remain available when the origin is not Pendências.

#### Scenario: Return from a contract
- **WHEN** a user opens a contract from page two of a filtered and sorted queue, changes tabs and chooses Voltar para pendências
- **THEN** the same validated queue context SHALL be restored

#### Scenario: Filter through a card
- **WHEN** the user selects Média criticidade
- **THEN** severity SHALL become medium and page one while retaining type/client/collaborator/text filters, sort and limit

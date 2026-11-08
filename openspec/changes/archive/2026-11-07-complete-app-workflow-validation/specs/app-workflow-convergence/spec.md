## ADDED Requirements

### Requirement: Current financial entry points
The app SHALL load dashboard and pending-work from current profiles, titles, settlements and bridges, without executable dependencies on removed models. Legacy financial URLs SHALL redirect to canonical collections without reusing incompatible record identifiers.

#### Scenario: Open financial work after migration
- **WHEN** an authorized user opens the dashboard, pending-work or a legacy financial bookmark
- **THEN** current scoped data or the canonical destination is displayed without querying removed entities

### Requirement: Financial projections respect events and scope
All aggregates SHALL apply branch and user authorization before aggregation. Projected amounts SHALL use actual title due dates; realized cash SHALL use effective settlement amounts and negative reversal events on their respective effective dates. Operational deletion SHALL NOT remove existing obligations from financial reads.

#### Scenario: Discounted receipt reversed in another month
- **WHEN** principal 100 is received with discount 10 and reversed in the next month
- **THEN** the first month contains cash 90, the reversal month contains cash -90, and the principal balance is reopened independently

#### Scenario: Member requests another employee
- **WHEN** a Member modifies employee filters or drilldown selection
- **THEN** other employees' remuneration is excluded before options, rows, totals and charts

### Requirement: One operational to financial workflow
Revenue editing SHALL collect negotiated operational data only. Title planning SHALL occur in the existing generation form. Title lists within operational records SHALL include entries, installments, extras and cancelled records, while cancelled obligations SHALL NOT contribute to active balances.

#### Scenario: Entry plus installments
- **WHEN** a contract has an entry of 100 and three installments of 300
- **THEN** its financial section displays all four titles and explains the total of 1000

### Requirement: Invalid amounts are not rewritten into transactions
Settlement UI SHALL preserve invalid amounts for validation and SHALL NOT silently clamp them into a valid principal. Both request boundary and persisted-state checks MUST continue rejecting invalid financial operations.

#### Scenario: Zero principal
- **WHEN** a user types zero and submits a settlement
- **THEN** no movement is created and a clear validation error is displayed

### Requirement: Mutation results are immediately consistent
Successful settlement and reversal flows SHALL synchronize title balance, movement state, available actions, operational summaries and audit without a manual reload.

#### Scenario: Reverse a receipt
- **WHEN** a valid reversal is confirmed
- **THEN** the original receipt displays its reversal, has no second reversal action and the title balance is recomputed

### Requirement: Consistent navigation and language
Authorized audit navigation SHALL be visible; user-facing financial labels, settings guidance and recovery controls SHALL follow the current pt-BR workflow. Audit display translation SHALL NOT modify persisted historical events.

#### Scenario: Audit a financial reversal
- **WHEN** an authorized user opens audit or a title history
- **THEN** action/entity labels are localized and describe the current event

### Requirement: Evidence based validation
Verification SHALL include lint, typecheck, meaningful automated regressions, production build and available browser workflows. TODO.md SHALL distinguish verified fixes from live environment checks that were not executed.

#### Scenario: Missing Member session
- **WHEN** only an Admin and one organization are available
- **THEN** the report retains live Member and organization-switch checks as unverified instead of declaring complete coverage

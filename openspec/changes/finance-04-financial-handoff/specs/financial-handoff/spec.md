## ADDED Requirements

### Requirement: Editable acerto
Acerto SHALL inherit origin amount, preview entry/installments, and allow row edits before atomic confirmation.

#### Scenario: Rounding
- **WHEN** 100 is split into three installments
- **THEN** preview contains 33.33, 33.33 and 33.34

#### Scenario: Monthly dates
- **WHEN** first due day is January 31
- **THEN** following dates use February last day and March 31 without weekend adjustment

### Requirement: Exact agreed total at handoff
Negotiated amount SHALL remain separate from financial total. At generation the sum of all preview titles, including down payment, SHALL equal the current agreed total exactly in cents. Client and server SHALL enforce equality; the server SHALL revalidate within the generation transaction. A justification SHALL NOT bypass a mismatch.

#### Scenario: Shortfall or excess
- **WHEN** reference is 10000 and preview totals 9500 or 10500, even with justification
- **THEN** confirmation is blocked and no generation or titles are persisted

#### Scenario: Entry included in total
- **WHEN** agreed total is 100 and preview has entry20 and installments40 and40
- **THEN** equality validation succeeds and generation may proceed under the remaining checks

#### Scenario: Agreed amount changed concurrently
- **WHEN** the agreed amount changes after preview and no longer matches at confirmation
- **THEN** server rejects generation atomically and requires a refreshed matching preview

#### Scenario: Adjustment after generation
- **WHEN** an authorized user adjusts a generated title or adds an extra with justification and audit
- **THEN** the existing post-generation adjustment rules apply, a difference may be shown, and reference is not automatically rewritten

### Requirement: No competence period
This version SHALL NOT introduce month/year competence fields or competence-based reporting. Forecast SHALL use due dates and realized cash SHALL use effective settlement/reversal dates.

#### Scenario: Settlement in another month
- **WHEN** a title due in November is actually settled in October
- **THEN** realized cash belongs to October, without creating or inferring a competence period

### Requirement: Idempotent financial handoff
Repeated generation SHALL not duplicate titles and operational cancellation SHALL preserve valid financial obligations.

#### Scenario: Duplicate submit
- **WHEN** same origin confirmation is retried
- **THEN** only one generation and its title set exist

#### Scenario: Cancelled contract
- **WHEN** Contract is cancelled after generation
- **THEN** authorized finance may still settle valid outstanding titles

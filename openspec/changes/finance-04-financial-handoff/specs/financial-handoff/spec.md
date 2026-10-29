## ADDED Requirements

### Requirement: Editable acerto
Acerto SHALL inherit origin amount, preview entry/installments, and allow row edits before atomic confirmation.

#### Scenario: Rounding
- **WHEN** 100 is split into three installments
- **THEN** preview contains 33.33, 33.33 and 33.34

#### Scenario: Monthly dates
- **WHEN** first due day is January 31
- **THEN** following dates use February last day and March 31 without weekend adjustment

### Requirement: Reference difference
Negotiated amount SHALL remain separate from financial total and a nonzero difference SHALL require justification.

#### Scenario: Extra amount
- **WHEN** reference is 10000 and preview totals 10500
- **THEN** confirmation preserves reference, stores reason and exposes difference

### Requirement: Idempotent financial handoff
Repeated generation SHALL not duplicate titles and operational cancellation SHALL preserve valid financial obligations.

#### Scenario: Duplicate submit
- **WHEN** same origin confirmation is retried
- **THEN** only one generation and its title set exist

#### Scenario: Cancelled contract
- **WHEN** Contract is cancelled after generation
- **THEN** authorized finance may still settle valid outstanding titles

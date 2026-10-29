## ADDED Requirements

### Requirement: Principal and cash allocation
Receipt SHALL abate P principal with effective cash P minus D plus J plus M; partial balances retain original due date.

#### Scenario: Partial discount
- **WHEN** title 100 receives P50 D5 J2 M0
- **THEN** cash is 47, principal balance is 50 and original due date remains

#### Scenario: Full discount
- **WHEN** P100 D100 J0 M0 is confirmed with reason
- **THEN** title settles with zero cash and no remuneration

### Requirement: Atomic grouped receipts
A batch SHALL use one Person, Firm, date and actual method; all selected titles and downstream effects SHALL commit or none SHALL.

#### Scenario: Concurrent change
- **WHEN** one selected title balance changes before commit
- **THEN** whole operation rolls back with actionable safe feedback

#### Scenario: Future date
- **WHEN** effective date is after business today
- **THEN** save is rejected without cash events

#### Scenario: Out of order
- **WHEN** future title is selected while an older one is overdue
- **THEN** authorized allocation is allowed

### Requirement: Immutable receipt reversal
Confirmed receipts SHALL be corrected only by dated reasoned reversal and new receipt, with unique reversal and downstream payment guard.

#### Scenario: Paid remuneration
- **WHEN** any related remuneration has a valid payment
- **THEN** receipt reversal is blocked

#### Scenario: Accidental reversal
- **WHEN** user wants to undo a confirmed reversal
- **THEN** original and reversal remain and correction is a new receipt

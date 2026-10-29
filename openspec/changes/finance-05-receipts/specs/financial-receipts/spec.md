## ADDED Requirements

### Requirement: Principal and cash allocation
Receipt SHALL abate P principal with effective cash P minus D plus J plus M; partial balances retain original due date.

#### Scenario: Partial discount
- **WHEN** title 100 receives P50 D5 J2 M0
- **THEN** cash is 47, principal balance is 50 and original due date remains

#### Scenario: Full discount
- **WHEN** P100 D100 J0 M0 is confirmed with reason
- **THEN** title settles with zero cash and no remuneration

### Requirement: Atomic multi-selection receipts without lots
Users SHALL select N authorized Receivables across Persons/origins in one Firm, adjust each line and confirm once. Each selected title SHALL create one independent Receipt. No ReceiptBatch, lot, person subgroup or same-Person restriction SHALL exist. All events, audit and downstream remuneration SHALL commit or none SHALL. Duplicate title IDs SHALL be rejected and retries SHALL be idempotent.

#### Scenario: Several debtors
- **WHEN** an authorized user selects three titles for different Persons in the same Firm and adjusts one partial amount
- **THEN** three independent Receipts commit atomically, each abating only its source title and retaining its residual balance as applicable

#### Scenario: Denied or cross-Firm line
- **WHEN** any selected title lacks permission or belongs to another Firm
- **THEN** the entire confirmation rejects without partial receipts, cash, audit or remuneration

#### Scenario: Mixed eligible origins
- **WHEN** contract and direct titles are selected with remuneration generation enabled
- **THEN** only eligible positive contract Receipts generate remuneration using each Receipt cash base, without leaking generated collaborator values in responses

### Requirement: Actual payment method on each settlement
Each Receipt SHALL store its effective date and actual PaymentMethod and remuneration-generation choice. The UI SHALL copy common date/method and generation choice from confirmation to each Receipt. Receivable expected PaymentMethod remains separate. Both receipt and payment directions SHALL use the same global PaymentMethod catalog.

#### Scenario: Actual method differs
- **WHEN** two Receivables expected cash but are confirmed with actual Pix
- **THEN** both Receipts record Pix and the title expected methods are not silently rewritten

### Requirement: Individual receipt evidence
Optional proof SHALL belong to each Receipt, including after multi-selection. Reversal SHALL operate on individual events or an explicitly selected atomic set without a persisted lot; Member SHALL never gain access to other parties' evidence through technical correlation.

#### Scenario: One receipt reversal
- **WHEN** one Receipt from a multi-selection action is reversed under its downstream guards
- **THEN** only its monetary effects and related remuneration are reversed/cancelled, other Receipts and their proofs remain intact

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

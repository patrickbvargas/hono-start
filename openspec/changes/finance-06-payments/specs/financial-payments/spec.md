## ADDED Requirements

### Requirement: Payments use title balances
Payments SHALL support N partial settlements per Payable and the same principal/discount/charges formula as receipts.

#### Scenario: Part payment
- **WHEN** Payable 100 is abated by principal 50 with discount 5 and interest 2
- **THEN** cash outflow is 47 and payable balance is 50

### Requirement: Atomic multi-selection without payment grouping
Payment confirmation SHALL accept selected Payables across beneficiaries and origins in one Firm, with a common effective date and actual method copied to each Payment. Each selected Payable SHALL create its own Payment with per-line principal/adjustments. There SHALL be no PaymentBatch, lot entity, beneficiary subgroups or same-Person restriction. Authority, balance, date, idempotency and transaction-wide validation remain mandatory.

#### Scenario: Multiple lawyers
- **WHEN** an authorized user selects ten Payables for several lawyers totaling5000 and confirms the prefilled balances
- **THEN** one atomic action records ten Payments totaling5000 against the correct Payables, without payment groups

#### Scenario: Partial line
- **WHEN** the user reduces one selected principal allocation below its outstanding balance
- **THEN** that title retains its residual balance and all selected valid lines commit together

#### Scenario: Cross Firm or stale line
- **WHEN** any selected Payable belongs to another Firm or its balance is no longer sufficient
- **THEN** the complete action is rejected without partial Payments or audit effects

#### Scenario: Duplicate IDs and retries
- **WHEN** one request repeats a Payable ID or a successful request is retried
- **THEN** repeated IDs are rejected and an idempotent retry does not create duplicate Payments

#### Scenario: Independent evidence and reversal
- **WHEN** one Payment is consulted or reversed after multi-selection
- **THEN** its proof and immutable event history remain individual, no lot is required, and Member cannot access another beneficiary's amounts, proof or operation totals

#### Scenario: Denied line
- **WHEN** one line lacks permission
- **THEN** no lines, cash or audit effects partially commit

### Requirement: Payment reversal
Payment reversal SHALL restore principal and adjustment effects exactly once on its own event date.

#### Scenario: Different month
- **WHEN** October payment is reversed in November
- **THEN** October outflow remains and November records reversal cash

#### Scenario: Full-discount payment
- **WHEN** remuneration was settled entirely by discount
- **THEN** valid payment still blocks source receipt reversal until itself reversed

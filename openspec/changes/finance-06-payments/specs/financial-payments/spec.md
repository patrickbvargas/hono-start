## ADDED Requirements

### Requirement: Payments use title balances
Payments SHALL support N partial settlements per Payable and the same principal/discount/charges formula as receipts.

#### Scenario: Part payment
- **WHEN** Payable 100 is abated by principal 50 with discount 5 and interest 2
- **THEN** cash outflow is 47 and payable balance is 50

### Requirement: Grouped payment integrity
Payment batches SHALL enforce Person/Firm/date/method and transaction-wide authority and balance validation.

#### Scenario: Mixed beneficiary
- **WHEN** user selects obligations for two Persons
- **THEN** system rejects grouping before confirmation

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

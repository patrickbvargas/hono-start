## ADDED Requirements

### Requirement: Receipt-only remuneration
Only positive actual cash receipts from Contract Revenues with generation enabled SHALL generate remuneration.

#### Scenario: Interest included
- **WHEN** receipt cash contains interest and penalty after discount
- **THEN** snapshot base equals effective cash and eligible percentages follow established rules

#### Scenario: Direct receipt
- **WHEN** a direct-entry receipt is settled
- **THEN** no remuneration obligation is generated

### Requirement: Separate calculation evidence
Each receipt/participation SHALL generate at most one Payable with separate immutable calculation evidence.

#### Scenario: Manual adjustment
- **WHEN** finance adjusts generated obligation with permission and reason
- **THEN** original calculation remains available and payable floor respects principal already abated

### Requirement: Monthly due and reversal dependency
Remuneration SHALL use configured monthly cutoff/due dates and preserve settled dependencies on reversal.

#### Scenario: Default cutoff
- **WHEN** receipt is dated October 25 versus October 26
- **THEN** default dates are November 5 versus December 5

#### Scenario: Unpaid reversal
- **WHEN** receipt is reversed and no related payable has valid payments
- **THEN** receipt reversal and generated-title cancellations commit together

#### Scenario: Paid reversal
- **WHEN** one related payable has a valid payment
- **THEN** entire requested receipt reversal is rejected

## ADDED Requirements

### Requirement: Optional installment disclosure
Revenue cards SHALL expose an initially collapsed, keyboard-accessible installment accordion to users with receipt read access, preserving summary and actions.

#### Scenario: Expand and collapse
- **WHEN** user activates Ver parcelas
- **THEN** schedule appears inside the revenue card and can be collapsed again

#### Scenario: Restricted reader
- **WHEN** user lacks receipt read access
- **THEN** receipt detail disclosure is absent

### Requirement: Accurate installment schedule
Details SHALL show installment number, planned amount, due date, actual receipt date and amount, remaining balance and status. Calendar dates and rounding SHALL match existing plan semantics. Inactive/deleted receipts SHALL be excluded. Amounts SHALL respect masking.

#### Scenario: Future unpaid installment
- **WHEN** installment has no receipt and its due date has not passed
- **THEN** status is Pendente and receipt date is absent

#### Scenario: Overdue partial installment
- **WHEN** due date has passed and received amount is below planned amount
- **THEN** status is Em atraso and remaining balance is shown

#### Scenario: Settled installment
- **WHEN** received amount covers planned amount
- **THEN** status is Recebida and actual receipt date and amount are shown even for a late receipt

#### Scenario: Partial receipt before due date
- **WHEN** positive received amount is below planned amount before due date
- **THEN** status is Parcial

#### Scenario: Entry and rounding
- **WHEN** revenue has entry and a non-divisible principal
- **THEN** entry is deducted before allocating installments, final row absorbs rounding remainder, and no entry receipt date is invented

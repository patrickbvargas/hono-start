## ADDED Requirements

### Requirement: Forecast and realized separation
Forecast SHALL use outstanding principal by due date; realized cash SHALL use settlement and reversal effective event dates.

#### Scenario: Discounted settlement
- **WHEN** 100 title is fully discounted
- **THEN** forecast balance is zero and realized cash is zero, with discount separately explained

#### Scenario: Late outstanding
- **WHEN** unpaid title due date precedes selected month
- **THEN** overdue amount remains discoverable outside future month buckets

### Requirement: Origin financial completion
Contract SHALL be financially settled only when all active revenues have generated finance and all valid related receivables have zero balance.

#### Scenario: Ungenerated revenue
- **WHEN** one active revenue has not generated titles
- **THEN** Contract is not reported financially settled

#### Scenario: Reopened title
- **WHEN** authorized adjustment or reversal reopens balance
- **THEN** financial state changes but operational andamento does not

### Requirement: Scoped reporting
Reports SHALL filter authorized source records before totals and never expose another collaborator remuneration to Member.

#### Scenario: Double count risk
- **WHEN** Expense generated Payable later receives Payment
- **THEN** realized outflow counts only Payment event, not expense and obligation again

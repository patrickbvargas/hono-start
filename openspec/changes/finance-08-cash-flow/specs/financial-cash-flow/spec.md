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

### Requirement: Person balances
Person statements SHALL expose separate authorized receivable and payable outstanding balances in the current Firm, without automatic offset. Member remuneration confidentiality SHALL apply before aggregation.

#### Scenario: Both directions
- **WHEN** an authorized financial user consults a Person with receivable100 and payable40 outstanding
- **THEN** the statement shows receivable100 and payable40 separately, without creating an offset or settlement

#### Scenario: Restricted remuneration
- **WHEN** a Member consults permitted Person-related information
- **THEN** totals and counts exclude other collaborators' remuneration and do not broaden assigned-contract scope

### Requirement: Date basis without competence
This version SHALL NOT add month/year competence fields or competence reports. Due dates SHALL NOT automatically create settlements.

#### Scenario: Early partial settlement
- **WHEN** a November title of100 receives principal40 in October without charges or discount
- **THEN** October realized cash is40, remaining principal60 retains November due date, and no competence period is inferred

### Requirement: Independent payment reporting
Reports SHALL count each Payment exactly once regardless of multi-selection confirmation, without requiring payment lots. Member confidentiality SHALL filter records before serialization and aggregation, including technically correlated events and proofs.

#### Scenario: Several lawyers paid together
- **WHEN** ten Payments for several lawyers totaling5000 are confirmed in one action
- **THEN** authorized actual cash shows5000 once, each Person statement includes only its Payments, and Member cannot infer other beneficiaries or the operation total

### Requirement: Origin-derived contract dimensions
Title lists and financial reports SHALL support filter/grouping by LegalArea, RevenueType and AssignmentType in addition to FinancialAnalytic, deriving dimensions through validated origin relationships without contract-specific columns on generic titles. Receipt/Payment/reversal projections SHALL resolve the same dimensions through their origin. Expense/direct titles SHALL expose “Sem vínculo com contrato”. Same-dimension selections SHALL combine with OR and different dimensions with AND. Authorization SHALL precede options, aggregation, pagination and exports.

#### Scenario: Exact remuneration assignment
- **WHEN** a contract has several assignment types and one Payable was generated for a specific participation
- **THEN** its assignment dimension is only that RemunerationCalculation source participation, with legal area/revenue type from the source receipt's Revenue/Contract

#### Scenario: Receivable with multiple matching participants
- **WHEN** a receivable100 belongs to a contract with two assignments of the same type and another selected type
- **THEN** filtered rows count one title and grand total100; each distinct assignment-type group includes it once and overlapping groups are labelled non-additive, never summed into a grand total or treated as remuneration allocation

#### Scenario: Unrelated origins
- **WHEN** authorized Expense or direct titles are queried without a contract-dimension restriction
- **THEN** their values remain visible under “Sem vínculo com contrato”, without fabricated contract dimensions

#### Scenario: Restricted dimensions
- **WHEN** Member requests dimension options, grouped totals, export or drilldown
- **THEN** only authorized source records contribute, with no other beneficiary remuneration, hidden professional percentages or supplier/collaborator management data exposed

#### Scenario: Monetary measures remain distinct
- **WHEN** a partially settled title and a dated reversal are filtered by contract area and revenue type
- **THEN** forecast uses remaining principal by due date and realized cash uses dated events exactly once, without multiplying either through assignment joins

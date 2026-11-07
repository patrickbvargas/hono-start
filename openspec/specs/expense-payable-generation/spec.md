# expense-payable-generation

## Purpose

Generate payable titles from operational expenses through atomic, tenant-scoped bridges.

## Requirements

### Requirement: Expense Payable Generation
The system SHALL generate pure `Payable` titles from an operational `Expense` and link each generated payable to the expense via `ExpensePayable` bridge records.

#### Scenario: Successful Expense Settlement Generation
- **WHEN** user confirms financial settlement for an active `Expense` with $N$ titles whose sum of `amount` exactly equals `expense.negotiatedAmount`
- **THEN** system creates $N$ `Payable` records with kind (`DOWN_PAYMENT`, `INSTALLMENT`, `EXTRA`), `beneficiaryId` matching the expense supplier's `SupplierProfile.id`, `firmId` matching expense firm, and creates $N$ `ExpensePayable` bridge records linking each payable to the `expenseId`.

#### Scenario: Rejection When Balance Does Not Equal Negotiated Amount
- **WHEN** user attempts to confirm titles whose sum of `amount` differs from `expense.negotiatedAmount`
- **THEN** system rejects generation with a closure balance error without writing any titles or bridge records.

#### Scenario: Rejection When Beneficiary SupplierProfile Is Inactive
- **WHEN** the expense's supplier profile is inactive
- **THEN** system rejects generation with an inactive counterparty error.

### Requirement: Financial Balance Explanation
The Saldo a receber and Saldo a pagar labels in financial cards SHALL offer a concise explanatory tooltip on hover or keyboard focus: "Valor dos títulos menos principal já abatido. Sem títulos gerados, saldo zero."

#### Scenario: Inspect balance explanation
- **WHEN** an authorized operator hovers or focuses the balance label
- **THEN** the concise calculation explanation is displayed without changing the balance

### Requirement: Consistent Financial Card Status
Revenue and expense financial cards SHALL display a header chip for authorized title readers with Quitado, Pendente or Em atraso. Quitado requires active generated titles with no remaining principal. Em atraso requires outstanding principal due before the current São Paulo calendar date. Other cases SHALL be Pendente, including no generated titles and partial payments without overdue debt.

#### Scenario: Entry and cash adjustments
- **WHEN** an entry remains overdue or a settlement includes interest, discounts or reversal
- **THEN** the card status considers all active titles including entry and unreversed principal abated, independently of effective cash

#### Scenario: Protected status
- **WHEN** the operator lacks read authority for the financial titles
- **THEN** the card exposes no financial status chip

### Requirement: Expense Financial Workspace
The system SHALL expose expense title generation and inspection in the Financeiro tab using the same visual and planning flow as contract revenues.

#### Scenario: Generate an expense schedule
- **WHEN** an authorized operator opens an active, non-deleted expense without generated titles
- **THEN** Gerar parcelas opens entry, installment count, due dates, category and expected payment method fields with an automatic editable title preview
- **AND** confirmation requires the preview sum to exactly equal the negotiated amount in cents
- **AND** successful generation refreshes the financial summary and replaces generation with expandable title inspection

#### Scenario: Missing generation authority or unavailable source
- **WHEN** the operator lacks payable generation or expense write authority, or the expense is inactive or deleted
- **THEN** generation is unavailable and server authorization remains enforced

#### Scenario: Direction-specific options
- **WHEN** an operator requests expense generation options with payable generation authority
- **THEN** options load without requiring receivable generation authority
- **AND** missing payable generation authority rejects the request

### Requirement: Expense Financial Balances
The system SHALL read persisted expense-linked titles within the current Firm and require expense and payable read authority. The view SHALL show negotiated amount, generation state, effective cash paid, remaining principal and expandable titles with due date, amount, latest valid payment date, effective cash paid, balance and status.

#### Scenario: Payments with adjustments and reversals
- **WHEN** linked titles have discounts, interest, partial payments or reversed payments
- **THEN** remaining debt equals face value minus unreversed principal abated using exact monetary arithmetic
- **AND** effective cash paid is reported separately and reversed payments are ignored

#### Scenario: Entry, extra and cancelled titles
- **WHEN** the expense has entry, installment, extra or cancelled titles
- **THEN** every linked title remains inspectable in due-date/id order
- **AND** cancelled titles do not contribute to outstanding debt or permit regeneration

#### Scenario: Unauthorized financial inspection
- **WHEN** the operator lacks payable read permission or requests another Firm's expense
- **THEN** the server denies financial inspection and the UI exposes no protected payment totals

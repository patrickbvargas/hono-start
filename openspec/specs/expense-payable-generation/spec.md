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

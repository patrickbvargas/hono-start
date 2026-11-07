## ADDED Requirements

### Requirement: Revenue Receivable Generation
The system SHALL generate pure `Receivable` titles from an operational `Revenue` and link each generated receivable to the revenue and contract via `ContractRevenueReceivable` bridge records.

#### Scenario: Successful Contract Revenue Settlement Generation
- **WHEN** user confirms financial settlement for an active `Revenue` with $N$ titles whose sum of `amount` exactly equals `revenue.negotiatedAmount`
- **THEN** system creates $N$ `Receivable` records with kind (`DOWN_PAYMENT`, `INSTALLMENT`, `EXTRA`), `debtorId` matching the contract client's `ClientProfile.id`, `firmId` matching contract firm, and creates $N$ `ContractRevenueReceivable` bridge records linking each receivable to the `revenueId` and `contractId`.

#### Scenario: Rejection When Balance Does Not Equal Negotiated Amount
- **WHEN** user attempts to confirm titles whose sum of `amount` differs by any amount from `revenue.negotiatedAmount`
- **THEN** system rejects the generation request with a closure balance error without writing any titles or bridge records.

#### Scenario: Rejection When Debtor ClientProfile Is Inactive
- **WHEN** the contract's client profile is inactive or deleted
- **THEN** system rejects generation with an inactive counterparty error.

### Requirement: Editable Contract Installment Preview
The system SHALL offer title generation from contract details and workspaces, separately from receipt settlement, using the canonical form and overlay patterns.

#### Scenario: Automatic Preview
- **WHEN** the operator supplies or changes entry amount/date, installment count, first due date, analytic category or expected method
- **THEN** the editable table automatically rebuilds the plan using exact integer cents and monthly dates clamped to the last valid day, without a separate preview button.

#### Scenario: Manual Adjustments and Closure Feedback
- **WHEN** the operator edits a title in the table
- **THEN** the edit remains until schedule parameters change, and an accessible amber chip indicates divergent or invalid values while a green chip indicates exact closure against the negotiated amount.

#### Scenario: Invalid Schedule or Cleared Selection
- **WHEN** schedule parameters become invalid or a single selection is cleared
- **THEN** stale preview rows are cleared, a single selection remains a scalar empty string, and validation messages guide the operator in pt-BR without technical type errors.

#### Scenario: Separate Generation and Settlement
- **WHEN** the operator opens the contract financial section
- **THEN** authorized writable, unbridged revenues offer title generation and neither the legacy Fee form nor its receipt-registration action is offered there.

#### Scenario: Concurrent or Repeated Generation
- **WHEN** requests try to generate titles from an already bridged revenue
- **THEN** a source lock and a transactional bridge check reject duplicate generation without partial titles or audit writes.

#### Scenario: Demonstration Contract Seed
- **WHEN** the contract-generation seed runs against a marked demonstration database
- **THEN** it creates identifiable contracts with client, team and an unbridged R$ 1,000 revenue in demo Firms 1 and 2, preserving existing contracts and financial history on reruns without resetting data.

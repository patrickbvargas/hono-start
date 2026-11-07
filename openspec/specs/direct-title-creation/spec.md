# direct-title-creation

## Purpose

Create justified manual financial titles without operational bridge records.

## Requirements

### Requirement: Direct Manual Title Creation
The system SHALL support creating unbridged `Receivable` and `Payable` titles for manual financial operations.

#### Scenario: Successful Direct Receivable Creation
- **WHEN** authorized user creates a manual `Receivable` with valid debtor (`ClientProfile`), analytic category, payment method, kind, amount, and justification notes
- **THEN** system creates the `Receivable` record scoped to `firmId` without any record in `contract_revenue_receivables` and records an audit log.

#### Scenario: Successful Direct Payable Creation
- **WHEN** authorized user creates a manual `Payable` with valid beneficiary (`SupplierProfile`), analytic category, payment method, kind, amount, and justification notes
- **THEN** system creates the `Payable` record scoped to `firmId` without any record in `expense_payables` and records an audit log.

#### Scenario: Rejection When Manual Notes Are Omitted
- **WHEN** user attempts to create a direct manual title without notes / justification
- **THEN** system rejects creation with a validation error.

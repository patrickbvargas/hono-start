# Financial redesign UML — proposed target

Approved 2026-10-29; read [workflow and invariants](FINANCIAL_SYSTEM.md) and [authorization](FINANCIAL_AUTHORIZATION.md). Diagrams describe target design, not implemented schema. No grouping boxes. Repeated names across diagrams denote the same entity.

No month/year competence field in this version. Due dates drive forecast; effective settlement/reversal dates drive realized cash. Financial generation validates that all preview titles, including entry, exactly equal the agreed total; later authorized adjustments may change title totals without rewriting the agreement.

## Core classes

```mermaid
classDiagram
direction TB
class Person {
  id
  personTypeId
  name
  document
  isCustomer
  isSupplier
  isEmployee
}
class EmployeeProfile {
  personId
  employeeTypeId
  oabNumber
  remunerationPercentage
  referralPercentage
}
class Contract {
  firmId
  customerId
  legalAreaId
  statusId
  processNumber
  notes
}
class ContractAssignment {
  contractId
  employeeProfileId
  assignmentTypeId
}
class Revenue {
  contractId
  revenueTypeId
  negotiatedAmount
  notes
}
class Expense {
  firmId
  supplierId
  negotiatedAmount
  notes
}
class Receivable {
  firmId
  debtorId
  amount
  dueDate
  analyticId
  expectedPaymentMethodId
  titleKindId
  notes
  balance_derived
  isSettled_derived
}
class Payable {
  firmId
  beneficiaryId
  amount
  dueDate
  analyticId
  expectedPaymentMethodId
  titleKindId
  notes
  balance_derived
  isSettled_derived
}
class Receipt {
  receivableId
  effectiveDate
  actualPaymentMethodId
  generatesRemuneration
  principalAbated
  discount
  interest
  penalty
  effectiveAmount
}
class Payment {
  payableId
  effectiveDate
  actualPaymentMethodId
  principalAbated
  discount
  interest
  penalty
  effectiveAmount
}
class RemunerationCalculation {
  payableId
  receiptId
  contractAssignmentId
  calculationBase
  effectivePercentage
  ruleSnapshot
}
class ReceiptReversal {
  receiptId
  reversedAt
  reason
}
class PaymentReversal {
  paymentId
  reversedAt
  reason
}
Person "1" --> "0..1" EmployeeProfile
Person "1" <-- "0..*" Contract : customer
Person "1" <-- "0..*" Expense : counterparty
Contract "1" --> "0..*" Revenue
Contract "1" --> "0..*" ContractAssignment
EmployeeProfile "1" <-- "0..*" ContractAssignment
Revenue "0..1" --> "0..*" Receivable : current origin
Expense "0..1" --> "0..*" Payable : current origin
Person "1" <-- "0..*" Receivable : debtor
Person "1" <-- "0..*" Payable : beneficiary
Receivable "1" --> "0..*" Receipt
Payable "1" --> "0..*" Payment
Receipt "1" --> "0..1" ReceiptReversal
Payment "1" --> "0..1" PaymentReversal
Payable "1" --> "0..1" RemunerationCalculation
Receipt "1" <-- "0..*" RemunerationCalculation
ContractAssignment "1" <-- "0..*" RemunerationCalculation
```

## Lookups, evidence and ownership

```mermaid
classDiagram
direction LR
class PersonType {
  <<lookup>>
}
class EmployeeType {
  <<lookup>>
}
class LegalArea {
  <<lookup>>
}
class ContractStatus {
  <<lookup>>
}
class AssignmentType {
  <<lookup>>
}
class RevenueType {
  <<lookup>>
}
class TitleKind {
  <<lookup>>
}
class PaymentMethod {
  <<lookup>>
}
class FinancialAnalytic {
  <<catalog>>
}
class AttachmentType {
  <<lookup>>
}
class Attachment {
  owner reference
}
class AuditLog {
  immutable event
}
class FinancialGeneration {
  idempotent origin handoff
}
class DirectFinancialEntry {
  explicit direct origin
}
class Firm {
  remunerationCutoffDay
  remunerationDueDay
}
class CashFlow {
  <<view>>
}
PersonType "1" <-- "0..*" Person
EmployeeType "1" <-- "0..*" EmployeeProfile
LegalArea "1" <-- "0..*" Contract
ContractStatus "1" <-- "0..*" Contract
AssignmentType "1" <-- "0..*" ContractAssignment
RevenueType "1" <-- "0..*" Revenue
TitleKind "1" <-- "0..*" Receivable
TitleKind "1" <-- "0..*" Payable
FinancialAnalytic "1" <-- "0..*" Receivable
FinancialAnalytic "1" <-- "0..*" Payable
PaymentMethod "1" <-- "0..*" Receivable : expected
PaymentMethod "1" <-- "0..*" Payable : expected
PaymentMethod "1" <-- "0..*" Receipt : actual
PaymentMethod "1" <-- "0..*" Payment : actual
AttachmentType "1" <-- "0..*" Attachment
Attachment ..> Person : shared owner
Attachment ..> Contract : owner
Attachment ..> Expense : owner
Attachment ..> Receipt : proof owner
Attachment ..> Payment : proof owner
AuditLog ..> Person
AuditLog ..> Receivable
AuditLog ..> Payable
AuditLog ..> Receipt
AuditLog ..> Payment
Revenue ..> FinancialGeneration
Expense ..> FinancialGeneration
FinancialGeneration ..> Receivable
FinancialGeneration ..> Payable
DirectFinancialEntry ..> Receivable
DirectFinancialEntry ..> Payable
Firm "1" --> "0..*" Contract
Firm "1" --> "0..*" Expense
Firm "1" --> "0..*" Receivable
Firm "1" --> "0..*" Payable
CashFlow ..> Receivable : balance by due date
CashFlow ..> Payable : balance by due date
CashFlow ..> Receipt : cash by event date
CashFlow ..> Payment : cash by event date
CashFlow ..> ReceiptReversal : reverse cash
CashFlow ..> PaymentReversal : reverse cash
```

Lookups use id/value/label/isActive; global analytics evolve ExpenseCategory. ADMIN_ASSISTANT and existing PAYROLL_LAWYERS/PAYROLL_STAFF values are preserved. Generated titles require exactly one validated origin; optional Revenue/Expense edges do NOT mean untracked origin is allowed. DirectFinancialEntry and FinancialGeneration are proposed integrity/grouping records, not additional user-facing operational modules. Concrete FK layout is resolved in phase 03 with database-enforced exclusivity. Title kind and origin kind are different concepts.

All operational/financial children retain Firm isolation and timestamps/audit; common fields omitted. Each Attachment has exactly one enforced owner, not multiple simultaneous owners. Each Receipt/Payment owns its proof; neither ReceiptBatch nor PaymentBatch or person grouping exists. Multi-selection creates independent settlements atomically across authorized Persons in one direction and Firm, copying the common effective date and actual PaymentMethod to each event. Receipt also records the remuneration-generation choice. Technical idempotency/audit correlation is not a business lot. Other existing owner attachments remain preserved during cutover. Settlement reversals are append-only, unique per settlement, with actor/reason and event date. Financial totals/status are derived, not independently editable flags.

UI projections remain separate: Clientes, Fornecedores and Colaboradores all reference Person; Colaboradores additionally manages EmployeeProfile under explicit authorization. No separate duplicate customer/supplier/employee identity tables are implied. Member cannot use these shared relationships to read supplier/collaborator management or professional/percentage/access fields.

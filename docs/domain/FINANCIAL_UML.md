# Financial System UML — Target Decoupled Architecture

Este documento define os diagramas canônicos da arquitetura desacoplada do sistema.
Toda a modelagem baseia-se no isolamento estrito entre contextos de negócio e uso de tabelas de ponte.

---

## 1. Visão de Bounded Contexts

```mermaid
flowchart TB
    subgraph IdentityContext ["Contexto de Identidade (Global)"]
        Person["Person"]
        ClientProfile["ClientProfile"]
        SupplierProfile["SupplierProfile"]
        EmployeeProfile["EmployeeProfile"]
        Person --> ClientProfile
        Person --> SupplierProfile
        Person --> EmployeeProfile
    end

    subgraph OperationalContext ["Contexto Operacional"]
        Contract["Contract"]
        Revenue["Revenue"]
        ContractAssignment["ContractAssignment"]
        Expense["Expense"]
        Contract --> Revenue
        Contract --> ContractAssignment
    end

    subgraph BridgeContext ["Contexto de Pontes (Tabelas de Ligação)"]
        CRR["ContractRevenueReceivable<br/>(revenueId, receivableId UNIQUE)"]
        EP["ExpensePayable<br/>(expenseId, payableId UNIQUE)"]
        RP["RemunerationPayable<br/>(receiptId, contractAssignmentId, payableId UNIQUE)"]
    end

    subgraph FinancialCoreContext ["Contexto Financeiro Puro (Agnóstico e Desacoplado)"]
        Receivable["Receivable<br/>(Sem FK de origem)"]
        Payable["Payable<br/>(Sem FK de origem)"]
        Receipt["Receipt"]
        Payment["Payment"]
        ReceiptReversal["ReceiptReversal"]
        PaymentReversal["PaymentReversal"]
        
        Receivable --> Receipt --> ReceiptReversal
        Payable --> Payment --> PaymentReversal
    end

    subgraph ManualEntry ["Lançamentos Manuais Diretos"]
        DirectRec["Recebível Avulso"] -.->|Insere direto sem ponte| Receivable
        DirectPay["Pagável Avulso (ex: Conta de Luz)"] -.->|Insere direto sem ponte| Payable
    end

    %% Ligações entre contextos
    ClientProfile -.->|debtorId| Receivable
    ClientProfile -.->|customerId| Contract
    SupplierProfile -.->|beneficiaryId| Payable
    SupplierProfile -.->|supplierId| Expense
    EmployeeProfile -.->|employeeProfileId| ContractAssignment

    Revenue --> CRR --> Receivable
    Expense --> EP --> Payable
    Receipt -.->|dispara| RP
    ContractAssignment -.->|regras| RP
    RP --> Payable
```

---

## 2. Diagrama de Classes do Domínio

```mermaid
classDiagram
direction TB

namespace IdentityContext {
  class Person {
    +Int id
    +String fullName
    +String document
    +Boolean isGeneric
    +String seedKey
    +Boolean isActive
    +Int personTypeId
  }
  class ClientProfile {
    +Int id
    +Int personId
    +Boolean isActive
  }
  class SupplierProfile {
    +Int id
    +Int personId
    +Boolean isActive
  }
  class EmployeeProfile {
    +Int id
    +Int personId
    +Int employeeTypeId
    +String oabNumber
    +Decimal remunerationPercentage
    +Decimal referralPercentage
    +Boolean isActive
  }
}

namespace OperationalContext {
  class Firm {
    +Int id
    +String name
    +Int remunerationCutoffDay
    +Int remunerationDueDay
  }
  class Contract {
    +Int id
    +Int firmId
    +Int customerId
    +String processNumber
    +Decimal feePercentage
    +Int legalAreaId
    +Int statusId
  }
  class Revenue {
    +Int id
    +Int firmId
    +Int contractId
    +Int revenueTypeId
    +Decimal negotiatedAmount
    +String notes
  }
  class ContractAssignment {
    +Int id
    +Int firmId
    +Int contractId
    +Int employeeProfileId
    +Int assignmentTypeId
  }
  class Expense {
    +Int id
    +Int firmId
    +Int supplierId
    +Decimal negotiatedAmount
    +String notes
  }
}

namespace BridgeContext {
  class ContractRevenueReceivable {
    +Int id
    +Int firmId
    +Int contractId
    +Int revenueId
    +Int receivableId_unique
    +DateTime createdAt
  }
  class ExpensePayable {
    +Int id
    +Int firmId
    +Int expenseId
    +Int payableId_unique
    +DateTime createdAt
  }
  class RemunerationPayable {
    +Int id
    +Int firmId
    +Int receiptId
    +Int contractAssignmentId
    +Int payableId_unique
    +Decimal calculationBase
    +Decimal effectivePercentage
    +Decimal calculatedAmount
    +Date computedDueDate
    +Json ruleSnapshot
    +DateTime createdAt
  }
}

namespace FinancialCoreContext {
  class Receivable {
    +Int id
    +Int firmId
    +Int debtorId
    +Decimal amount
    +Date dueDate
    +Int analyticId
    +Int expectedPaymentMethodId
    +Enum kind
    +String notes
    +DateTime cancelledAt
  }
  class Payable {
    +Int id
    +Int firmId
    +Int beneficiaryId
    +Decimal amount
    +Date dueDate
    +Int analyticId
    +Int expectedPaymentMethodId
    +Enum kind
    +String notes
    +DateTime cancelledAt
  }
  class Receipt {
    +Int id
    +Int firmId
    +Int receivableId
    +Date effectiveDate
    +Decimal principalAbated
    +Decimal discount
    +Decimal interest
    +Decimal penalty
    +Decimal effectiveAmount
    +Int actualPaymentMethodId
    +Boolean generatesRemuneration
    +String requestKey
    +Int actorId
  }
  class Payment {
    +Int id
    +Int firmId
    +Int payableId
    +Date effectiveDate
    +Decimal principalAbated
    +Decimal discount
    +Decimal interest
    +Decimal penalty
    +Decimal effectiveAmount
    +Int actualPaymentMethodId
    +String requestKey
    +Int actorId
  }
  class ReceiptReversal {
    +Int id
    +Int firmId
    +Int receiptId_unique
    +Date effectiveDate
    +String reason
    +String requestKey
    +Int actorId
  }
  class PaymentReversal {
    +Int id
    +Int firmId
    +Int paymentId_unique
    +Date effectiveDate
    +String reason
    +String requestKey
    +Int actorId
  }
}

namespace CrossCuttingContext {
  class Attachment {
    +Int id
    +Int firmId
    +Int typeId
    +String storagePath
    +String fileName
    +Int fileSize
  }
  class AuditLog {
    +Int id
    +Int firmId
    +String action
    +String entityType
    +String entityId
    +Json changeData
    +Int actorId
    +DateTime createdAt
  }
}

%% Relacionamentos de Identidade
Person "1" --> "0..1" ClientProfile
Person "1" --> "0..1" SupplierProfile
Person "1" --> "0..1" EmployeeProfile
EmployeeProfile ..> SupplierProfile : exige mesmo personId ativo

%% Relacionamentos Operacionais
Firm "1" --> "0..*" Contract
Firm "1" --> "0..*" Expense
ClientProfile "1" <-- "0..*" Contract : customer
Contract "1" --> "0..*" Revenue
Contract "1" --> "0..*" ContractAssignment
EmployeeProfile "1" <-- "0..*" ContractAssignment
SupplierProfile "1" <-- "0..*" Expense : supplier

%% Relacionamentos com as Pontes
Revenue "1" --> "0..*" ContractRevenueReceivable
ContractRevenueReceivable "0..1" --> "1" Receivable : receivableId unique

Expense "1" --> "0..*" ExpensePayable
ExpensePayable "0..1" --> "1" Payable : payableId unique

Receipt "1" <-- "0..*" RemunerationPayable : triggers
ContractAssignment "1" <-- "0..*" RemunerationPayable : rules
RemunerationPayable "0..1" --> "1" Payable : payableId unique

%% Relacionamentos do Core Financeiro
Firm "1" --> "0..*" Receivable
Firm "1" --> "0..*" Payable
Firm "1" --> "0..*" Receipt
Firm "1" --> "0..*" Payment
ClientProfile "1" <-- "0..*" Receivable : debtor
SupplierProfile "1" <-- "0..*" Payable : beneficiary
Receivable "1" --> "0..*" Receipt
Payable "1" --> "0..*" Payment
Receipt "1" --> "0..1" ReceiptReversal
Payment "1" --> "0..1" PaymentReversal

%% Relacionamentos Transversais
Firm "1" --> "0..*" Attachment
Firm "1" --> "0..*" AuditLog
```

---

## 3. Catálogos Globais (`ref_*`)

```mermaid
classDiagram
direction LR

class RefPersonType {
  +INDIVIDUAL
  +COMPANY
}
class RefEmployeeType {
  +LAWYER
  +ADMIN_ASSISTANT
  +INTERN
  +COORDINATOR
  +MANAGER
  +ACCOUNTANT
  +LEGAL_ASSISTANT
  +OTHER
}
class RefLegalArea {
  +SOCIAL_SECURITY
  +CIVIL
  +FAMILY
  +LABOR
  +OTHER
}
class RefContractStatus {
  +ACTIVE
  +COMPLETED
  +CANCELLED
}
class RefAssignmentType {
  +RESPONSIBLE
  +RECOMMENDING
  +RECOMMENDED
  +ADMIN_ASSISTANT
}
class RefRevenueType {
  +ADMINISTRATIVE
  +JUDICIAL
  +SUCCUMBENCY
}
class RefFinancialAnalytic {
  +catalogId
}
class RefPaymentMethod {
  +CASH
  +BANK_TRANSFER
  +PIX
  +CREDIT_CARD
  +BOLETO
  +CHECK
}
class RefAttachmentType {
  +CONTRACT
  +DOCUMENT
  +RECEIPT
  +OUTFLOW_PROOF
}

RefPersonType "1" <-- "0..*" Person
RefEmployeeType "1" <-- "0..*" EmployeeProfile
RefLegalArea "1" <-- "0..*" Contract
RefContractStatus "1" <-- "0..*" Contract
RefAssignmentType "1" <-- "0..*" ContractAssignment
RefRevenueType "1" <-- "0..*" Revenue
RefFinancialAnalytic "1" <-- "0..*" Receivable
RefFinancialAnalytic "1" <-- "0..*" Payable
RefPaymentMethod "1" <-- "0..*" Receivable
RefPaymentMethod "1" <-- "0..*" Payable
RefPaymentMethod "1" <-- "0..*" Receipt
RefPaymentMethod "1" <-- "0..*" Payment
RefAttachmentType "1" <-- "0..*" Attachment
```

---

## 4. Invariantes da Arquitetura Desacoplada

1. **Pureza de Título**: `Receivable` e `Payable` não contêm colunas FK de `Revenue`, `Expense`, `Contract` ou código de geração.
2. **Classificação Nativa (`kind`)**: Classificação do título é um enum estrito no título (`DOWN_PAYMENT`, `INSTALLMENT`, `EXTRA`), sem tabela externa de lookup.
3. **Ponte Única por Título**: `receivableId` em `ContractRevenueReceivable` e `payableId` em `ExpensePayable`/`RemunerationPayable` são restritos por `UNIQUE`. Um título pertence a no máximo uma origem operacional.
4. **Títulos Manuais**: Lançamentos financeiros manuais não geram linha em nenhuma tabela de ponte.
5. **Eliminação de Entidades Fantasmas**: `FinancialGeneration` e `DirectFinancialEntry` foram removidas do modelo canônico.

# Hono — Legal Fee Management System

## Data Model Document

> **Version:** 1.0 — 2026

---

# 1. Core Principles

## 1.1 ID Strategy

* All primary keys:

  * `id: Int` (auto-increment)
* All foreign keys use `Int`
* IDs are internal
* Avoid exposing raw IDs externally (optional future: publicId)

---

## 1.2 Multi-Tenancy

* Every entity includes `firmId`
* All queries MUST filter by `firmId`
* `firmId` comes from session — never from client input
* All relations MUST belong to the same `firmId`

---

## 1.3 Soft Delete

All entities include:

```
deletedAt: Date | null
```

* `null` → active
* not null → deleted
* Default queries must filter `deletedAt = null`

---

## 1.4 Timestamps

```
createdAt: Date
updatedAt: Date
```

---

## 1.5 Financial Precision

* Use **Decimal (Prisma Decimal)**
* Never use `number` for money
* Round:

  * 2 decimal places
  * HALF_UP

---

## 1.6 Lookup Tables Strategy

All enums are replaced by lookup tables.

Each lookup table:

```
id: Int
value: string (stable key)
label: string (pt-BR)
```

Rules:

* Sorted by `label`
* Seeded (mandatory)
* Immutable (no UI edits)
* No soft delete

---

# 2. Lookup Tables

## EmployeeType

* LAWYER → Advogado
* ADMIN_ASSISTANT → Assistente Administrativo

## UserRole

* ADMIN → Administrador
* USER → Usuário

## ClientType

* INDIVIDUAL → Pessoa Física
* COMPANY → Pessoa Jurídica

## LegalArea

* SOCIAL_SECURITY → Previdenciário
* CIVIL → Cível
* FAMILY → Família
* LABOR → Trabalhista
* OTHER → Outros

## ContractStatus

* ACTIVE → Ativo
* COMPLETED → Concluído
* CANCELLED → Cancelado

## RevenueType

* ADMINISTRATIVE → Administrativo
* JUDICIAL → Judicial
* SUCCUMBENCY → Sucumbência

## AssignmentType

* RESPONSIBLE → Responsável
* RECOMMENDING → Indicante
* RECOMMENDED → Indicado
* ADDITIONAL → Adicional
* ADMIN_ASSISTANT → Assistente Administrativo

## AttachmentType

* PDF → PDF
* JPG → JPG
* PNG → PNG

---

# 3. Core Entities

## Firm

```
Firm {
  id: Int
  name: string

  createdAt: Date
  updatedAt: Date
}
```

---

## Employee

```
Employee {
  id: Int
  firmId: Int

  fullName: string
  email: string (unique)
  passwordHash: string

  typeId: Int        // FK → EmployeeType
  roleId: Int        // FK → UserRole

  oabNumber: string | null

  remunerationPercentage: Decimal
  referralPercentage: Decimal

  avatarUrl: string | null

  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
```

Constraints:

* email unique
* oabNumber unique per firm
* referral ≤ remuneration

---

## Client

```
Client {
  id: Int
  firmId: Int

  typeId: Int

  fullName: string
  document: string

  email: string | null
  phone: string | null

  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
```

Constraints:

* document unique per firm

---

## Contract

```
Contract {
  id: Int
  firmId: Int

  clientId: Int

  processNumber: string

  legalAreaId: Int
  statusId: Int

  feePercentage: Decimal

  allowStatusChange: boolean

  notes: string | null

  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
```

Constraints:

* processNumber unique per firm

---

## ContractEmployee

```
ContractEmployee {
  id: Int
  firmId: Int

  contractId: Int
  employeeId: Int

  assignmentTypeId: Int

  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
```

Constraints:

* unique (contractId, employeeId)

---

## Revenue

```
Revenue {
  id: Int
  firmId: Int

  contractId: Int

  typeId: Int

  totalValue: Decimal
  downPayment: Decimal

  paymentStartDate: Date
  totalInstallments: Int

  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
```

Constraints:

* unique (contractId, typeId)
* downPayment ≤ totalValue

---

## Fee

```
Fee {
  id: Int
  firmId: Int

  revenueId: Int

  paymentDate: Date
  amount: Decimal

  installmentNumber: Int

  generateRemuneration: boolean

  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
```

Constraints:

* unique (revenueId, installmentNumber)
* amount > 0

---

## Remuneration

```
Remuneration {
  id: Int
  firmId: Int

  feeId: Int
  contractEmployeeId: Int

  percentage: Decimal
  amount: Decimal

  paymentDate: Date

  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
```

Rules:

* always generated from Fee
* editable only by ADMIN

---

## Attachment

```
Attachment {
  id: Int
  firmId: Int

  clientId: Int | null
  employeeId: Int | null
  contractId: Int | null

  fileName: string
  fileUrl: string

  fileTypeId: Int

  fileSize: Int

  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
```

Rule:

* exactly one of (clientId, employeeId, contractId) must be set

---

## AuditLog

```
AuditLog {
  id: Int
  firmId: Int

  userId: Int

  entityType: string
  entityId: Int

  action: string

  changes: Json

  createdAt: Date
}
```

Rules:

* immutable
* append-only

---

# 4. Relationships

* Firm 1:N Employee

* Firm 1:N Client

* Firm 1:N Contract

* Client 1:N Contract

* Contract 1:N ContractEmployee

* Contract 1:N Revenue

* Revenue 1:N Fee

* Fee 1:N Remuneration

* Employee 1:N ContractEmployee

* ContractEmployee 1:N Remuneration

---

# 5. Derived Fields (NOT persisted)

```
Revenue.installmentsPaid =
  count(Fee where deletedAt = null)

Contract.isFullyPaid =
  all Revenues paid
```

---

# 6. Cascade Rules (Soft Delete)

| Action           | Effect                                  |
| ---------------- | --------------------------------------- |
| Fee deleted      | Remunerations deleted                   |
| Fee restored     | Remunerations restored                  |
| Revenue deleted  | Fees + Remunerations deleted            |
| Contract deleted | Revenues + Fees + Remunerations deleted |

---

# 7. Indexing Strategy

## Required

* firmId (all tables)
* deletedAt

## Composite

* (firmId, document)
* (firmId, processNumber)
* (contractId, typeId)
* (revenueId, installmentNumber)

---

# 10. Notes

* Prefer explicit relation names in Prisma
* Always enforce business rules at service layer

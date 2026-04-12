# Hono — Legal Fee Management System

## Data Model Document

> **Version:** 1.0 — 2026

---

## Table of Contents

1. [Core Principles](#1-core-principles)
2. [Prisma Configuration](#2-prisma-configuration)
3. [Lookup Tables](#3-lookup-tables)
4. [Core Entities](#4-core-entities)
5. [Authentication Tables](#5-authentication-tables)
6. [Relationships](#6-relationships)
7. [Derived Fields](#7-derived-fields)
8. [Soft Delete Cascade Rules](#8-soft-delete-cascade-rules)
9. [Deletion Protection](#9-deletion-protection)
10. [Indexing Strategy](#10-indexing-strategy)
11. [Filter Strategy](#11-filter-strategy)
12. [Sorting Strategy](#12-sorting-strategy)
13. [Remuneration Calculation Reference](#13-remuneration-calculation-reference)
14. [Seed Data](#14-seed-data)
15. [Notes](#15-notes)

---

# 1. Core Principles

## 1.1 ID Strategy

- All primary keys: `id Int @id @default(autoincrement())`
- All foreign keys: `Int`
- IDs are internal — avoid exposing raw IDs externally (optional future: publicId)

---

## 1.2 Multi-Tenancy

- Every business entity includes `firmId Int`
- All queries **must** filter by `firmId`
- `firmId` comes from the authenticated session — **never** from client input
- All referenced relations **must** belong to the same `firmId`
- Lookup tables and the Firm table itself do **not** have `firmId`

---

## 1.3 Soft Delete

All business entities (except Firm, lookup tables, and AuditLog) include:

```
deletedAt DateTime?
```

- `null` → record has never been deleted or has been restored
- not null → record was explicitly soft-deleted
- Default queries **must** filter `deletedAt: null`
- Soft delete and active/inactive status are **independent** — a record can be inactive (`isActive = false`) without being deleted, and a deleted record retains its last `isActive` value for when it is restored

---

## 1.4 Timestamps

All tables include:

```
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

Exception: `AuditLog` has only `createdAt` (immutable — no updates).

---

## 1.5 Financial Precision

- Use **Prisma `Decimal`** for all monetary and percentage values — never JavaScript `number`
- Percentages are stored as decimal fractions: `0.3000` = 30%
- Percentage precision: `@db.Decimal(5, 4)` — allows values from `0.0000` to `9.9999`
- Monetary precision: `@db.Decimal(14, 2)` — allows values up to `999,999,999,999.99`
- Rounding: 2 decimal places, HALF_UP
- Use a decimal arithmetic library (e.g., `decimal.js` or Prisma's built-in Decimal) — never convert to `number` for financial calculations

---

## 1.6 Lookup Tables Strategy

All categorical values are stored as lookup tables with foreign key references — **never** as enums or string literals.

Each lookup table follows this structure:

```
id       Int     @id @default(autoincrement())
value    String  @unique    // stable code key (UPPER_SNAKE_CASE)
label    String             // pt-BR display label
isActive Boolean @default(true)
```

Rules:

- Sorted by `label` when displayed
- Seeded via `prisma/seed.ts` (mandatory before app can run)
- `value` and `label` are immutable — no create, update, or delete via the UI
- `isActive` can be toggled by admins to keep a lookup option visible but disabled in form dropdowns without removing the record
- No soft delete (`deletedAt`)
- No `firmId` — lookup values are global across all firms
- **Lookup-table form option queries** return all rows and rely on the form control to disable entries where `isActive = false`

---

## 1.7 Database Naming Convention

- Prisma model names: `PascalCase` singular (e.g., `Employee`, `ContractEmployee`)
- Database table names: `snake_case` plural via `@@map()` (e.g., `employees`, `contract_employees`)
- Prisma field names: `camelCase` (e.g., `fullName`, `firmId`)
- Database column names: Prisma default (matches field names)

---

## 1.8 Active/Inactive Status

All business entities and lookup tables (except Firm, AuditLog, and Session/Account) include:

```
isActive Boolean @default(true)
```

- `true` → record is active and visible in form options, dropdowns, and default list views
- `false` → record is inactive: still exists in the database, visible in admin lists (with filter), but excluded from form dropdowns and option selectors
- This is **independent of soft-delete** — an inactive record is not deleted; for lookup tables it remains visible but disabled in selection UIs
- For business entities, the `isActive` checkbox is always present in the create and edit forms; for lookup tables, `isActive` is managed via an admin-only settings panel (lookup tables have no other mutable fields)
- **Business entity form options / dropdowns** must always filter: `deletedAt: null AND isActive: true`
- **Lookup table form options / dropdowns** must always return all rows; inactive rows remain visible but disabled (lookup tables have no `deletedAt`)
- **Tables / lists** default to non-deleted records; `isActive` can be filtered via the `active` URL search param

---

# 2. Prisma Configuration

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

- Schema file location: `prisma/schema.prisma`
- Migrations directory: `prisma/migrations/` (generated — do NOT edit)
- Seed script: `prisma/seed.ts`

---

# 3. Lookup Tables

All lookup tables follow the identical Prisma model pattern. The only difference between them is the table name, the relation field, and the seed data.

### Prisma model pattern

```prisma
model EmployeeType {
  id       Int     @id @default(autoincrement())
  value    String  @unique
  label    String
  isActive Boolean @default(true)

  employees Employee[]

  @@map("employee_types")
}

model UserRole {
  id       Int     @id @default(autoincrement())
  value    String  @unique
  label    String
  isActive Boolean @default(true)

  employees Employee[]

  @@map("user_roles")
}

model ClientType {
  id       Int     @id @default(autoincrement())
  value    String  @unique
  label    String
  isActive Boolean @default(true)

  clients Client[]

  @@map("client_types")
}

model LegalArea {
  id       Int     @id @default(autoincrement())
  value    String  @unique
  label    String
  isActive Boolean @default(true)

  contracts Contract[]

  @@map("legal_areas")
}

model ContractStatus {
  id       Int     @id @default(autoincrement())
  value    String  @unique
  label    String
  isActive Boolean @default(true)

  contracts Contract[]

  @@map("contract_statuses")
}

model RevenueType {
  id       Int     @id @default(autoincrement())
  value    String  @unique
  label    String
  isActive Boolean @default(true)

  revenues Revenue[]

  @@map("revenue_types")
}

model AssignmentType {
  id       Int     @id @default(autoincrement())
  value    String  @unique
  label    String
  isActive Boolean @default(true)

  contractEmployees ContractEmployee[]

  @@map("assignment_types")
}

model AttachmentType {
  id       Int     @id @default(autoincrement())
  value    String  @unique
  label    String
  isActive Boolean @default(true)

  attachments Attachment[]

  @@map("attachment_types")
}
```

### Seed values

#### EmployeeType

| id | value | label | isActive |
|----|-------|-------|---------|
| 1 | LAWYER | Advogado | true |
| 2 | ADMIN_ASSISTANT | Assistente Administrativo | true |

#### UserRole

| id | value | label | isActive |
|----|-------|-------|---------|
| 1 | ADMIN | Administrador | true |
| 2 | USER | Usuário | true |

#### ClientType

| id | value | label | isActive |
|----|-------|-------|---------|
| 1 | INDIVIDUAL | Pessoa Física | true |
| 2 | COMPANY | Pessoa Jurídica | true |

#### LegalArea

| id | value | label | isActive |
|----|-------|-------|---------|
| 1 | SOCIAL_SECURITY | Previdenciário | true |
| 2 | CIVIL | Cível | true |
| 3 | FAMILY | Família | true |
| 4 | LABOR | Trabalhista | true |
| 5 | OTHER | Outros | true |

#### ContractStatus

| id | value | label | isActive |
|----|-------|-------|---------|
| 1 | ACTIVE | Ativo | true |
| 2 | COMPLETED | Concluído | true |
| 3 | CANCELLED | Cancelado | true |

#### RevenueType

| id | value | label | isActive |
|----|-------|-------|---------|
| 1 | ADMINISTRATIVE | Administrativo | true |
| 2 | JUDICIAL | Judicial | true |
| 3 | SUCCUMBENCY | Sucumbência | true |

#### AssignmentType

| id | value | label | isActive |
|----|-------|-------|---------|
| 1 | RESPONSIBLE | Responsável | true |
| 2 | RECOMMENDING | Indicante | true |
| 3 | RECOMMENDED | Indicado | true |
| 4 | ADDITIONAL | Adicional | true |
| 5 | ADMIN_ASSISTANT | Assistente Administrativo | true |

#### AttachmentType

| id | value | label | isActive |
|----|-------|-------|---------|
| 1 | PDF | PDF | true |
| 2 | JPG | JPG | true |
| 3 | PNG | PNG | true |

---

# 4. Core Entities

## 4.1 Firm

```prisma
model Firm {
  id   Int    @id @default(autoincrement())
  name String

  additionalEmployeeId Int?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  additionalEmployee Employee?  @relation("FirmAdditionalEmployee", fields: [additionalEmployeeId], references: [id])
  employees          Employee[] @relation("FirmEmployee")
  clients            Client[]
  contracts          Contract[]
  contractEmployees  ContractEmployee[]
  revenues           Revenue[]
  fees               Fee[]
  remunerations      Remuneration[]
  attachments        Attachment[]
  auditLogs          AuditLog[]

  @@map("firms")
}
```

Notes:

- The tenant root — no `firmId` on itself
- No soft delete — firms are permanent
- No `deletedAt`
- `additionalEmployeeId` references the designated lawyer who receives a fixed 10% remuneration on Social Security contracts. Set via database seed — not configurable via UI. See §4.5 for the auto-assignment rule.

---

## 4.2 Employee

```prisma
model Employee {
  id     Int @id @default(autoincrement())
  firmId Int

  fullName String
  email    String @unique

  typeId Int
  roleId Int

  oabNumber String?

  remunerationPercentage Decimal @db.Decimal(5, 4)
  referralPercentage     Decimal @db.Decimal(5, 4)

  avatarUrl String?

  isActive  Boolean   @default(true)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  // Relations
  firm           Firm          @relation("FirmEmployee", fields: [firmId], references: [id])
  firmAdditional Firm?         @relation("FirmAdditionalEmployee")
  type           EmployeeType  @relation(fields: [typeId], references: [id])
  role           UserRole      @relation(fields: [roleId], references: [id])

  contractEmployees ContractEmployee[]
  attachments       Attachment[]
  auditLogs         AuditLog[]
  sessions          Session[]
  accounts          Account[]

  @@unique([firmId, oabNumber])
  @@index([firmId])
  @@index([deletedAt])
  @@index([isActive])
  @@map("employees")
}
```

**Database constraints:**

- `email` globally unique (`@unique`)
- `oabNumber` unique per firm (`@@unique([firmId, oabNumber])` — PostgreSQL allows multiple NULLs)

**Business constraints (service layer):**

- `remunerationPercentage >= 0` and `referralPercentage >= 0` — both can be zero. An employee with 0% remunerationPercentage receives R$ 0.00 remunerations. `referralPercentage = 0` is the default for employees who never act as referrers.
- `referralPercentage <= remunerationPercentage`
- `oabNumber` format: 2 uppercase letters + 6 digits (e.g., `RS123456`)
- `oabNumber` is required when `typeId` = LAWYER, forbidden when ADMIN_ASSISTANT
- Password minimum 8 characters (enforced by BetterAuth at account creation — credentials are stored in the Account table, not on Employee)
- Employee serves as the user entity for BetterAuth (see Section 5)

---

## 4.3 Client

```prisma
model Client {
  id     Int @id @default(autoincrement())
  firmId Int

  typeId Int

  fullName String
  document String

  email String?
  phone String?

  isActive  Boolean   @default(true)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  // Relations
  firm Firm       @relation(fields: [firmId], references: [id])
  type ClientType @relation(fields: [typeId], references: [id])

  contracts   Contract[]
  attachments Attachment[]

  @@unique([firmId, document])
  @@index([firmId])
  @@index([deletedAt])
  @@index([isActive])
  @@map("clients")
}
```

**Database constraints:**

- `document` unique per firm (`@@unique([firmId, document])`)

**Business constraints (service layer):**

- INDIVIDUAL (Pessoa Física): `document` is a valid CPF (11 digits)
- COMPANY (Pessoa Jurídica): `document` is a valid CNPJ (14 digits)
- `typeId` is fixed at creation — cannot be changed after the client is created
- Label adapts by type: "Nome" for individuals, "Razão Social" for companies

---

## 4.4 Contract

```prisma
model Contract {
  id     Int @id @default(autoincrement())
  firmId Int

  clientId Int

  processNumber String

  legalAreaId Int
  statusId    Int

  feePercentage Decimal @db.Decimal(5, 4)

  allowStatusChange Boolean @default(true)

  notes String?

  isActive  Boolean   @default(true)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  // Relations
  firm      Firm           @relation(fields: [firmId], references: [id])
  client    Client         @relation(fields: [clientId], references: [id])
  legalArea LegalArea      @relation(fields: [legalAreaId], references: [id])
  status    ContractStatus @relation(fields: [statusId], references: [id])

  contractEmployees ContractEmployee[]
  revenues          Revenue[]
  attachments       Attachment[]

  @@unique([firmId, processNumber])
  @@index([firmId])
  @@index([clientId])
  @@index([deletedAt])
  @@index([isActive])
  @@map("contracts")
}
```

**Database constraints:**

- `processNumber` unique per firm (`@@unique([firmId, processNumber])`)

**Business constraints (service layer):**

- Must have at least one assigned employee at creation
- Must have at least one revenue plan at creation
- May have up to 3 revenues (one per RevenueType)
- Status transitions:
  - **Active → Completed**: automatic when all revenues are fully paid
  - **Active → Cancelled**: manual, admin only
- If `allowStatusChange = false`, **no** status transitions are allowed — including the automatic completion
- Only admins can set `allowStatusChange`
- **Cancelled and Completed contracts are read-only.** No fees can be recorded, no revenues can be added or edited, no team changes are allowed. The only permitted action is restore by an admin (which returns the contract to Active status).

---

## 4.5 ContractEmployee

```prisma
model ContractEmployee {
  id     Int @id @default(autoincrement())
  firmId Int

  contractId       Int
  employeeId       Int
  assignmentTypeId Int

  isActive  Boolean   @default(true)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  // Relations
  firm           Firm           @relation(fields: [firmId], references: [id])
  contract       Contract       @relation(fields: [contractId], references: [id])
  employee       Employee       @relation(fields: [employeeId], references: [id])
  assignmentType AssignmentType @relation(fields: [assignmentTypeId], references: [id])

  remunerations Remuneration[]

  @@index([firmId])
  @@index([contractId])
  @@index([employeeId])
  @@index([deletedAt])
  @@index([isActive])
  @@map("contract_employees")
}
```

**Business constraints (service layer):**

- **EmployeeType ↔ AssignmentType constraint:** Employees with type LAWYER can only hold Responsible, Recommending, Recommended, or Additional assignments. Employees with type ADMIN_ASSISTANT can only hold the Admin Assistant assignment. Reject mismatches with a validation error.
- Same employee cannot be assigned to the same contract more than once (among active records)
- ADDITIONAL assignment is only valid on Social Security (Previdenciário) contracts
- ADDITIONAL assignment is auto-assigned by the system — not user-selectable
- **Additional auto-assignment rule:** When a Social Security contract is created, the system reads `firm.additionalEmployeeId` and auto-creates a ContractEmployee with `assignmentTypeId = ADDITIONAL`. If the designated employee is already assigned to the contract in another role (Responsible, Recommending, or Recommended), the Additional assignment is **skipped** for that contract.
- **Assignment type is editable** — but only if the employee has no active remunerations on that contract. If active remunerations exist, the assignment type is locked (since changing it would invalidate the calculation formula used to generate those remunerations).
- Cannot remove an employee who has active remunerations on that contract
- Referral constraint: when a Recommending + Recommended pair exists, the recommending employee's `referralPercentage` must **not** exceed the recommended employee's `remunerationPercentage`

**Uniqueness note:** `(contractId, employeeId)` must be unique among active records only. Requires a partial unique index (see Section 10).

---

## 4.6 Revenue

```prisma
model Revenue {
  id     Int @id @default(autoincrement())
  firmId Int

  contractId Int

  typeId Int

  totalValue  Decimal @db.Decimal(14, 2)
  downPayment Decimal @db.Decimal(14, 2) @default(0)

  paymentStartDate DateTime @db.Date
  totalInstallments Int

  isActive  Boolean   @default(true)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  // Relations
  firm     Firm        @relation(fields: [firmId], references: [id])
  contract Contract    @relation(fields: [contractId], references: [id])
  type     RevenueType @relation(fields: [typeId], references: [id])

  fees Fee[]

  @@index([firmId])
  @@index([contractId])
  @@index([deletedAt])
  @@index([isActive])
  @@map("revenues")
}
```

**Business constraints (service layer):**

- `(contractId, typeId)` unique among active records (partial unique index — see Section 10)
- `downPayment <= totalValue`
- `totalInstallments >= 1`
- A contract may have at most 3 revenues (one per RevenueType)
- **Revenue editing rules:** All fields are editable after creation, with the following guards:
  - `totalInstallments` cannot be reduced below the current `installmentsPaid`
  - `totalValue` cannot be reduced below the current `totalPaid` (downPayment + sum of fee amounts)
  - `typeId` change must still respect the one-per-type-per-contract uniqueness rule
  - `downPayment` must still satisfy `downPayment <= totalValue` after any edit

---

## 4.7 Fee

```prisma
model Fee {
  id     Int @id @default(autoincrement())
  firmId Int

  revenueId Int

  paymentDate DateTime @db.Date
  amount      Decimal  @db.Decimal(14, 2)

  installmentNumber Int

  generateRemuneration Boolean @default(true)

  isActive  Boolean   @default(true)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  // Relations
  firm    Firm    @relation(fields: [firmId], references: [id])
  revenue Revenue @relation(fields: [revenueId], references: [id])

  remunerations Remuneration[]

  @@index([firmId])
  @@index([revenueId])
  @@index([deletedAt])
  @@index([isActive])
  @@map("fees")
}
```

**Business constraints (service layer):**

- `(revenueId, installmentNumber)` unique among active records (partial unique index — see Section 10)
- `amount > 0`
- `installmentNumber >= 1`
- Block fee creation when `installmentsPaid == totalInstallments` for the target revenue — the system must not allow more fees than the expected number of installments
- When `generateRemuneration = true`, system auto-creates one Remuneration record per assigned employee
- **Bulk creation:** Multiple fees can be created at once for the **same revenue**. The form presents N rows, each with its own payment date, amount, and installment number. The entire batch is validated and saved as an **all-or-nothing transaction** — if any row fails validation, the whole batch is rejected. Remunerations are generated per-fee within the same transaction.

**Fee lifecycle side effects:**

| Event | System behavior |
|---|---|
| Fee created (`generateRemuneration = true`) | Remuneration records created for all assigned employees |
| Fee created (`generateRemuneration = false`) | No remunerations generated |
| Fee updated (`generateRemuneration = true`) | All linked remunerations are recalculated |
| Fee updated (`generateRemuneration = false`) | Existing remunerations remain unchanged |
| Fee soft-deleted | All linked remunerations are also soft-deleted |
| Fee restored | All linked remunerations are also restored |
| All fees across all revenues on a contract are paid | Contract status auto-transitions to Completed (if `allowStatusChange = true`) |

---

## 4.8 Remuneration

```prisma
model Remuneration {
  id     Int @id @default(autoincrement())
  firmId Int

  feeId              Int
  contractEmployeeId Int

  percentage  Decimal  @db.Decimal(5, 4)
  amount      Decimal  @db.Decimal(14, 2)

  paymentDate DateTime @db.Date

  isActive  Boolean   @default(true)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  // Relations
  firm             Firm             @relation(fields: [firmId], references: [id])
  fee              Fee              @relation(fields: [feeId], references: [id])
  contractEmployee ContractEmployee @relation(fields: [contractEmployeeId], references: [id])

  @@index([firmId])
  @@index([feeId])
  @@index([contractEmployeeId])
  @@index([deletedAt])
  @@index([isActive])
  @@map("remunerations")
}
```

**Business constraints (service layer):**

- Always system-generated from a Fee record — never manually created by users
- Only ADMIN role can edit percentage and amount
- `paymentDate` is copied from the originating Fee
- Calculation formulas defined in Section 13

---

## 4.9 Attachment

```prisma
model Attachment {
  id     Int @id @default(autoincrement())
  firmId Int

  clientId   Int?
  employeeId Int?
  contractId Int?

  fileName String
  fileUrl  String

  fileTypeId Int

  fileSize Int

  isActive  Boolean   @default(true)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  // Relations
  firm     Firm           @relation(fields: [firmId], references: [id])
  client   Client?        @relation(fields: [clientId], references: [id])
  employee Employee?      @relation(fields: [employeeId], references: [id])
  contract Contract?      @relation(fields: [contractId], references: [id])
  fileType AttachmentType @relation(fields: [fileTypeId], references: [id])

  @@index([firmId])
  @@index([clientId])
  @@index([employeeId])
  @@index([contractId])
  @@index([deletedAt])
  @@index([isActive])
  @@map("attachments")
}
```

**Business constraints (service layer):**

- Exactly one of (`clientId`, `employeeId`, `contractId`) must be set — the other two must be `null`
- Maximum file size: 10 MB (10,485,760 bytes)
- Accepted formats: PDF, JPG, PNG (validated against AttachmentType lookup)
- All authenticated users can upload and view attachments
- Only ADMIN role can delete attachments
- Files are stored in Supabase Storage; `fileUrl` stores the storage path/URL

---

## 4.10 AuditLog

```prisma
model AuditLog {
  id     Int @id @default(autoincrement())
  firmId Int

  userId Int

  entityType String
  entityId   Int

  action String

  changes Json

  createdAt DateTime @default(now())

  // Relations
  firm Firm     @relation(fields: [firmId], references: [id])
  user Employee @relation(fields: [userId], references: [id])

  @@index([firmId])
  @@index([userId])
  @@index([entityType, entityId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

**Rules:**

- **Immutable** — no update or delete operations
- **Append-only** — only `INSERT` is allowed
- No `updatedAt` or `deletedAt` fields
- `action` values: `CREATE`, `UPDATE`, `DELETE`, `RESTORE`
- `changes` stores a JSON diff: `{ before: {...}, after: {...} }` for updates; full entity snapshot for creates/deletes
- `entityType` values: `Employee`, `Client`, `Contract`, `ContractEmployee`, `Revenue`, `Fee`, `Remuneration`, `Attachment`
- Only visible to ADMIN role
- Filterable by: date range, user, action type, entity type

---

# 5. Authentication Tables

Authentication is managed by **BetterAuth** with the Prisma adapter. BetterAuth requires the following tables, which are separate from the business data model:

```prisma
model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  userId    Int

  user Employee @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("sessions")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                Int
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?

  user Employee @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("accounts")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("verifications")
}
```

**Notes:**

- Session and Account IDs use `String` (BetterAuth convention) — this is the **only exception** to the Int ID rule
- `Employee` serves as the user entity — `userId` in Session/Account references `Employee.id`
- **OAB login implementation:** The login form accepts either an email or OAB number. If the input matches OAB format (2 uppercase letters + 6 digits), the system looks up the employee by `oabNumber` to resolve their `email`, then authenticates via BetterAuth's standard email + password flow. If no employee is found for that OAB number, return a generic "invalid credentials" error (do not reveal whether the OAB exists).
- Default session duration: 24 hours
- "Remember me" extends session to 7 days
- Rate limiting: 5 failed login attempts per minute per identifier triggers a temporary block
- Password reset via email verification link
- The exact BetterAuth table schema may vary by version — always follow BetterAuth's Prisma adapter documentation for the definitive schema

---

# 6. Relationships

### Business entity relationships

```
Firm              1 ── N  Employee
Firm              1 ── 0..1  Employee        (additionalEmployee)
Firm              1 ── N  Client
Firm              1 ── N  Contract
Client            1 ── N  Contract
Contract          1 ── N  ContractEmployee
Contract          1 ── N  Revenue          (max 3 — one per RevenueType)
Contract          1 ── N  Attachment
Employee          1 ── N  ContractEmployee
Employee          1 ── N  Attachment
Employee          1 ── N  AuditLog
ContractEmployee  1 ── N  Remuneration
Revenue           1 ── N  Fee
Fee               1 ── N  Remuneration
Client            1 ── N  Attachment
```

### Lookup table references

```
EmployeeType      1 ── N  Employee
UserRole          1 ── N  Employee
ClientType        1 ── N  Client
LegalArea         1 ── N  Contract
ContractStatus    1 ── N  Contract
RevenueType       1 ── N  Revenue
AssignmentType    1 ── N  ContractEmployee
AttachmentType    1 ── N  Attachment
```

### Authentication relationships

```
Employee          1 ── N  Session
Employee          1 ── N  Account
```

---

# 7. Derived Fields (NOT persisted)

These values are computed at query time — they are **never** stored in the database:

| Field | Computation |
|---|---|
| `Revenue.installmentsPaid` | `COUNT(fees WHERE revenueId = revenue.id AND deletedAt IS NULL)` |
| `Revenue.totalPaid` | `downPayment + SUM(fees.amount WHERE revenueId = revenue.id AND deletedAt IS NULL)` |
| `Revenue.remainingValue` | `totalValue - Revenue.totalPaid` |
| `Revenue.isFullyPaid` | `installmentsPaid >= totalInstallments AND totalPaid >= totalValue` |
| `Contract.isFullyPaid` | All revenues on the contract have `isFullyPaid = true` |

---

# 8. Soft Delete Cascade Rules

When an entity is soft-deleted, all its dependents must also be soft-deleted in the same transaction. When restored, all previously cascaded dependents must also be restored.

**Attachments are never cascaded.** When a Client, Employee, or Contract is soft-deleted, their attachments remain active and accessible. This ensures files are always available for legal and compliance purposes regardless of the parent entity's status.

| Action | Cascaded effect |
|---|---|
| Fee soft-deleted | All linked Remunerations soft-deleted |
| Fee restored | All linked Remunerations restored |
| Revenue soft-deleted | All linked Fees + their Remunerations soft-deleted |
| Revenue restored | All linked Fees + their Remunerations restored |
| Contract soft-deleted | All linked Revenues + Fees + Remunerations + ContractEmployees soft-deleted |
| Contract restored | All linked Revenues + Fees + Remunerations + ContractEmployees restored |
| Employee soft-deleted | All active ContractEmployee assignments (with no active remunerations) soft-deleted. All active sessions invalidated (deleted from Session table). Attachments are **not** cascaded — they remain accessible. |
| Employee restored | All previously cascaded ContractEmployee assignments restored. User can log in again. |

**Implementation:** Cascade soft deletes are **not** automatic in Prisma — they must be implemented in the service layer using `prisma.$transaction()` to ensure atomicity. Employee soft-delete must also hard-delete all rows from the `sessions` table for that user to force logout.

---

# 9. Deletion Protection

Entities with active dependents **cannot** be soft-deleted. The service layer must check for active dependents before proceeding:

| Entity | Blocked when |
|---|---|
| Client | Has active contracts (`deletedAt IS NULL`) |
| Employee (account) | Has any active ContractEmployee assignment that has active remunerations |
| Contract | Has active revenues |
| Revenue | Has active fees |
| Fee | Has active remunerations |
| Employee (from contract) | Has active remunerations on that contract |

"Active" means `deletedAt IS NULL`. Return a user-friendly Portuguese error message when deletion is blocked.

---

# 10. Indexing Strategy

All indexes are defined in the Prisma models (Section 4). This section provides a summary and covers indexes that require raw SQL.

### Single-column indexes (all tenant-scoped tables)

| Index | Purpose |
|---|---|
| `firmId` | Fast tenant filtering on every query |
| `deletedAt` | Fast filtering of active vs. soft-deleted records |
| `isActive` | Fast filtering of active vs. inactive records for form options and list queries |

### Unique constraints (Prisma-enforced)

| Table | Constraint | Scope |
|---|---|---|
| `employees` | `@unique email` | Global |
| `employees` | `@@unique([firmId, oabNumber])` | Per firm (NULLs allowed) |
| `clients` | `@@unique([firmId, document])` | Per firm |
| `contracts` | `@@unique([firmId, processNumber])` | Per firm |

### Additional indexes

| Table | Index | Purpose |
|---|---|---|
| `contracts` | `@@index([clientId])` | Fast client → contracts lookup |
| `contract_employees` | `@@index([contractId])` | Fast contract → team lookup |
| `contract_employees` | `@@index([employeeId])` | Fast employee → assignments lookup |
| `audit_logs` | `@@index([entityType, entityId])` | Fast entity history lookup |
| `audit_logs` | `@@index([createdAt])` | Fast date-range queries |

### Partial unique indexes (raw SQL migration)

Prisma does **not** support partial unique indexes declaratively. These must be added via a raw SQL migration after the initial schema is created:

```sql
-- Active-only uniqueness: one assignment per employee per contract
CREATE UNIQUE INDEX uq_contract_employee_active
  ON contract_employees (contract_id, employee_id)
  WHERE deleted_at IS NULL;

-- Active-only uniqueness: one revenue per type per contract
CREATE UNIQUE INDEX uq_revenue_contract_type_active
  ON revenues (contract_id, type_id)
  WHERE deleted_at IS NULL;

-- Active-only uniqueness: one installment number per revenue
CREATE UNIQUE INDEX uq_fee_revenue_installment_active
  ON fees (revenue_id, installment_number)
  WHERE deleted_at IS NULL;
```

Additionally, enforce these constraints at the service layer (check before insert) as a defense-in-depth measure.

---

# 11. Filter Strategy

All list queries support **server-side filtering** via URL search params, validated by Zod schemas. Each entity defines the filter fields accepted by its list API.

> **Filter conventions:** The `status` param (mapped to `deletedAt`) and the `active` param (mapped to `isActive`) are independent. A query for `status=active` returns all non-deleted records regardless of `isActive`; `active=true` returns only `isActive = true` records regardless of `deletedAt`. Business-entity form option queries apply both `deletedAt: null` and `isActive: true`; lookup-table option queries return all rows and disable inactive values in the UI.

## 11.1 Employee

| Filter key | Field / relation | Type |
|---|---|---|
| `type` | `typeId` | Lookup ID (EmployeeType) |
| `role` | `roleId` | Lookup ID (UserRole) |
| `status`  | `deletedAt` | `active` \| `inactive` \| `all` (default: `active`) |
| `active`  | `isActive`  | `true` \| `false` \| `all` (default: `all`)          |

## 11.2 Client

| Filter key | Field / relation | Type |
|---|---|---|
| `search` | `fullName`, `document` | Text (partial match) |
| `type` | `typeId` | Lookup ID (ClientType) |
| `status`  | `deletedAt` | `active` \| `inactive` \| `all` (default: `active`) |
| `active`  | `isActive`  | `true` \| `false` \| `all` (default: `all`)          |

## 11.3 Contract

| Filter key | Field / relation | Type |
|---|---|---|
| `clientId` | `clientId` | Entity ID |
| `legalArea` | `legalAreaId` | Lookup ID (LegalArea) |
| `contractStatus` | `statusId` | Lookup ID (ContractStatus) |
| `status`  | `deletedAt` | `active` \| `inactive` \| `all` (default: `active`) |
| `active`  | `isActive`  | `true` \| `false` \| `all` (default: `all`)          |

## 11.4 Fee

| Filter key | Field / relation | Type |
|---|---|---|
| `contractId` | `revenue.contractId` | Entity ID |
| `revenueId` | `revenueId` | Entity ID |
| `dateFrom` | `paymentDate >=` | Date |
| `dateTo` | `paymentDate <=` | Date |

## 11.5 Remuneration

| Filter key | Field / relation | Type |
|---|---|---|
| `employeeId` | `contractEmployee.employeeId` | Entity ID |
| `contractId` | `contractEmployee.contract.id` | Entity ID |
| `dateFrom` | `paymentDate >=` | Date |
| `dateTo` | `paymentDate <=` | Date |

## 11.6 AuditLog

| Filter key | Field / relation | Type |
|---|---|---|
| `userId` | `userId` | Entity ID |
| `action` | `action` | `CREATE` \| `UPDATE` \| `DELETE` \| `RESTORE` |
| `entityType` | `entityType` | Entity type string |
| `dateFrom` | `createdAt >=` | Date |
| `dateTo` | `createdAt <=` | Date |

---

# 12. Sorting Strategy

All list queries support **server-side sorting** via Prisma `orderBy`. Sorting state lives in URL search params (`column` + `direction`) and is validated by Zod schemas before reaching the database.

Each entity defines:

- **Sortable columns** — the values accepted in the URL `column` param
- **Prisma mapping** — how each column translates to a `Prisma.XOrderByWithRelationInput`
- **Default sort** — applied when no column is specified
- **Tiebreaker** — always append `{ id: "asc" }` as a secondary sort for deterministic pagination

---

## 12.1 Employee

**Default:** `fullName` asc

| Column key | Prisma `orderBy` | Type |
|---|---|---|
| `fullName` | `{ fullName: dir }` | Direct |
| `email` | `{ email: dir }` | Direct |
| `type` | `{ type: { label: dir } }` | Relation |
| `role` | `{ role: { label: dir } }` | Relation |
| `createdAt` | `{ createdAt: dir }` | Direct |

---

## 12.2 Client

**Default:** `fullName` asc

| Column key | Prisma `orderBy` | Type |
|---|---|---|
| `fullName` | `{ fullName: dir }` | Direct |
| `document` | `{ document: dir }` | Direct |
| `type` | `{ type: { label: dir } }` | Relation |
| `createdAt` | `{ createdAt: dir }` | Direct |

---

## 12.3 Contract

**Default:** `createdAt` desc

| Column key | Prisma `orderBy` | Type |
|---|---|---|
| `processNumber` | `{ processNumber: dir }` | Direct |
| `client` | `{ client: { fullName: dir } }` | Relation |
| `legalArea` | `{ legalArea: { label: dir } }` | Relation |
| `status` | `{ status: { label: dir } }` | Relation |
| `feePercentage` | `{ feePercentage: dir }` | Direct |
| `createdAt` | `{ createdAt: dir }` | Direct |

---

## 12.4 Revenue

**Default:** `createdAt` desc

| Column key | Prisma `orderBy` | Type |
|---|---|---|
| `type` | `{ type: { label: dir } }` | Relation |
| `totalValue` | `{ totalValue: dir }` | Direct |
| `paymentStartDate` | `{ paymentStartDate: dir }` | Direct |
| `totalInstallments` | `{ totalInstallments: dir }` | Direct |
| `createdAt` | `{ createdAt: dir }` | Direct |

---

## 12.5 Fee

**Default:** `paymentDate` desc

| Column key | Prisma `orderBy` | Type |
|---|---|---|
| `paymentDate` | `{ paymentDate: dir }` | Direct |
| `amount` | `{ amount: dir }` | Direct |
| `installmentNumber` | `{ installmentNumber: dir }` | Direct |
| `createdAt` | `{ createdAt: dir }` | Direct |

---

## 12.6 Remuneration

**Default:** `paymentDate` desc

| Column key | Prisma `orderBy` | Type |
|---|---|---|
| `paymentDate` | `{ paymentDate: dir }` | Direct |
| `amount` | `{ amount: dir }` | Direct |
| `percentage` | `{ percentage: dir }` | Direct |
| `employee` | `{ contractEmployee: { employee: { fullName: dir } } }` | Nested relation |
| `createdAt` | `{ createdAt: dir }` | Direct |

---

## 12.7 AuditLog

**Default:** `createdAt` desc

| Column key | Prisma `orderBy` | Type |
|---|---|---|
| `createdAt` | `{ createdAt: dir }` | Direct |
| `user` | `{ user: { fullName: dir } }` | Relation |
| `entityType` | `{ entityType: dir }` | Direct |
| `action` | `{ action: dir }` | Direct |

---

## 12.8 Implementation Pattern

Each feature defines a **type-safe sort map** in its API layer that converts URL search params into Prisma `orderBy` objects:

```typescript
import type { Prisma } from "@prisma/client";

// constants/index.ts — allowed sort columns
export const EMPLOYEE_ALLOWED_SORT_COLUMNS = [
  "fullName",
  "email",
  "type",
  "role",
  "createdAt",
] as const;

export type EmployeeSortColumn = (typeof EMPLOYEE_ALLOWED_SORT_COLUMNS)[number];

// api/get.ts — sort map
const employeeSortMap: Record<
  EmployeeSortColumn,
  (dir: Prisma.SortOrder) => Prisma.EmployeeOrderByWithRelationInput
> = {
  fullName: (dir) => ({ fullName: dir }),
  email: (dir) => ({ email: dir }),
  type: (dir) => ({ type: { label: dir } }),
  role: (dir) => ({ role: { label: dir } }),
  createdAt: (dir) => ({ createdAt: dir }),
};

// Usage in server function handler
const orderBy = employeeSortMap[search.column ?? "fullName"](search.direction);

const [items, total] = await prisma.$transaction([
  prisma.employee.findMany({
    where: { firmId, deletedAt: null },
    orderBy: [orderBy, { id: "asc" }],  // tiebreaker for deterministic pagination
    skip: (search.page - 1) * search.limit,
    take: search.limit,
    include: { type: true, role: true },
  }),
  prisma.employee.count({
    where: { firmId, deletedAt: null },
  }),
]);
```

**Key points:**

- The sort map is a `Record<SortColumn, (dir) => OrderByInput>` — fully type-safe via Prisma generated types
- Relation sorts traverse FK joins: `{ type: { label: dir } }` sorts by the lookup table's display label
- Nested relation sorts are supported: `{ contractEmployee: { employee: { fullName: dir } } }`
- Always append `{ id: "asc" }` as a tiebreaker for stable, deterministic pagination
- Use `prisma.$transaction([findMany, count])` for consistent paginated results

---

# 13. Remuneration Calculation Reference

When a Fee is created with `generateRemuneration = true`, the system creates one Remuneration record for **each** employee assigned to the contract. The formula depends on the employee's assignment type:

| Assignment type | Percentage source | Formula |
|---|---|---|
| **Responsible** | `employee.remunerationPercentage` | `fee.amount × employee.remunerationPercentage` |
| **Recommending** | `employee.referralPercentage` | `fee.amount × employee.referralPercentage` |
| **Recommended** | `employee.remunerationPercentage − recommending.referralPercentage` | `fee.amount × (employee.remunerationPercentage − recommending.referralPercentage)` |
| **Additional** | Fixed `0.10` (10%) | `fee.amount × 0.10` |
| **Admin Assistant** | `employee.remunerationPercentage` | `fee.amount × employee.remunerationPercentage` |

**Rules:**

- The `percentage` field on the Remuneration record stores the effective percentage used in the calculation
- The `amount` field stores the calculated result, rounded to 2 decimal places (HALF_UP)
- The `paymentDate` is copied from the originating Fee
- When a Fee is updated and `generateRemuneration = true`, all linked Remunerations are recalculated using the new `fee.amount`
- Only ADMIN role may manually override a Remuneration's `percentage` and `amount`

---

# 14. Seed Data

Lookup tables **must** be seeded before the application can run. Use Prisma's seed mechanism:

**File:** `prisma/seed.ts`

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.employeeType.createMany({
    data: [
      { id: 1, value: "LAWYER", label: "Advogado" },
      { id: 2, value: "ADMIN_ASSISTANT", label: "Assistente Administrativo" },
    ],
    skipDuplicates: true,
  });

  await prisma.userRole.createMany({
    data: [
      { id: 1, value: "ADMIN", label: "Administrador" },
      { id: 2, value: "USER", label: "Usuário" },
    ],
    skipDuplicates: true,
  });

  await prisma.clientType.createMany({
    data: [
      { id: 1, value: "INDIVIDUAL", label: "Pessoa Física" },
      { id: 2, value: "COMPANY", label: "Pessoa Jurídica" },
    ],
    skipDuplicates: true,
  });

  await prisma.legalArea.createMany({
    data: [
      { id: 1, value: "SOCIAL_SECURITY", label: "Previdenciário" },
      { id: 2, value: "CIVIL", label: "Cível" },
      { id: 3, value: "FAMILY", label: "Família" },
      { id: 4, value: "LABOR", label: "Trabalhista" },
      { id: 5, value: "OTHER", label: "Outros" },
    ],
    skipDuplicates: true,
  });

  await prisma.contractStatus.createMany({
    data: [
      { id: 1, value: "ACTIVE", label: "Ativo" },
      { id: 2, value: "COMPLETED", label: "Concluído" },
      { id: 3, value: "CANCELLED", label: "Cancelado" },
    ],
    skipDuplicates: true,
  });

  await prisma.revenueType.createMany({
    data: [
      { id: 1, value: "ADMINISTRATIVE", label: "Administrativo" },
      { id: 2, value: "JUDICIAL", label: "Judicial" },
      { id: 3, value: "SUCCUMBENCY", label: "Sucumbência" },
    ],
    skipDuplicates: true,
  });

  await prisma.assignmentType.createMany({
    data: [
      { id: 1, value: "RESPONSIBLE", label: "Responsável" },
      { id: 2, value: "RECOMMENDING", label: "Indicante" },
      { id: 3, value: "RECOMMENDED", label: "Indicado" },
      { id: 4, value: "ADDITIONAL", label: "Adicional" },
      { id: 5, value: "ADMIN_ASSISTANT", label: "Assistente Administrativo" },
    ],
    skipDuplicates: true,
  });

  await prisma.attachmentType.createMany({
    data: [
      { id: 1, value: "PDF", label: "PDF" },
      { id: 2, value: "JPG", label: "JPG" },
      { id: 3, value: "PNG", label: "PNG" },
    ],
    skipDuplicates: true,
  });

  // --- Firm + first Admin + designated Additional employee ---
  // The single firm, its first administrator, and the Additional lawyer
  // must be seeded before the application can be used.

  const firm = await prisma.firm.create({
    data: { name: "Escritório Principal" },
  });

  // First admin account (password is set via BetterAuth Account table)
  const admin = await prisma.employee.create({
    data: {
      firmId: firm.id,
      fullName: "Administrador",
      email: "admin@hono.com",
      typeId: 1,  // LAWYER
      roleId: 1,  // ADMIN
      remunerationPercentage: 0,
      referralPercentage: 0,
    },
  });

  // Designated Additional lawyer (fixed 10% on Social Security contracts)
  const additional = await prisma.employee.create({
    data: {
      firmId: firm.id,
      fullName: "Adicional",
      email: "adicional@hono.com",
      typeId: 1,  // LAWYER
      roleId: 2,  // USER
      remunerationPercentage: 0.10,
      referralPercentage: 0,
    },
  });

  await prisma.firm.update({
    where: { id: firm.id },
    data: { additionalEmployeeId: additional.id },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Configuration in `package.json`:**

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Run:** `pnpm prisma db seed`

---

# 15. Notes

- **Prisma relation names:** Use explicit relation names only when Prisma requires disambiguation (e.g., multiple relations between the same models). Otherwise, let Prisma infer them.
- **Business rule enforcement:** Always enforce business rules (constraints, validations, cascades) at the service layer. Database constraints are a safety net, not the primary validation mechanism.
- **Soft delete cascades:** Implement all cascade soft deletes as Prisma transactions (`prisma.$transaction()`) to ensure atomicity.
- **Financial arithmetic:** Never convert `Decimal` to JavaScript `number` for monetary calculations. Use `decimal.js` or Prisma's built-in Decimal type for all arithmetic.
- **Multi-tenancy guard:** Every query must include `firmId` from the session. Never trust `firmId` from client input. Consider a Prisma middleware or wrapper to enforce this globally.
- **Lookup table references in code:** Reference lookup rows by their `value` field (e.g., `"LAWYER"`, `"SOCIAL_SECURITY"`) — never by `id` — since IDs may differ across environments. Query by `value` to get the `id` when needed, or use a cached lookup map.
- **Authentication:** BetterAuth manages Session, Account, and Verification tables. Their exact schema follows BetterAuth's Prisma adapter conventions and may evolve with library updates.
- **Partial unique indexes:** The three raw SQL indexes (Section 10) must be created via a manual Prisma migration after the initial schema push. Use `prisma migrate dev --create-only` to generate an empty migration, then add the SQL.

# Hono — Legal Fee Management System

## Product Requirements Document

> **Version:** 1.0 — 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Non-goals](#3-non-goals)
4. [Domain Glossary](#4-domain-glossary)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Features](#6-features)
7. [User Stories](#7-user-stories)
8. [Functional Requirements](#8-functional-requirements)
9. [Business Rules](#9-business-rules)
10. [User Flows](#10-user-flows)
11. [Edge Cases](#11-edge-cases)

---

## 1. Overview

### 1.1 What Is Hono?

**Hono** is an internal web application for a law firm specializing in Social Security Law (_Direito Previdenciário_). It automates the management of legal fees and lawyer remuneration calculations, replacing the manual, error-prone spreadsheet workflow currently in use.

### 1.2 Who Is It For?

- **Firm administrators** who manage employees, clients, contracts, and financial data across the firm.
- **Lawyers and assistants** who need visibility into their own contracts, fees, and remunerations.

### 1.3 Why Does It Exist?

| Problem | Impact |
|---|---|
| Manual fee calculations via spreadsheets | Human errors in lawyer payouts |
| No indexed, searchable records | Impossible to audit historical data |
| Sensitive data without access control | Privacy and compliance risks |
| No consolidated financial visibility | Cannot analyze revenue by legal area, period, or lawyer |

### 1.4 Multi-Firm Support

The system supports multiple firm branches (filiais). All business data is isolated per firm — users in one firm cannot see or modify data belonging to another.

### 1.5 Language Policy

- **User interface:** Portuguese (pt-BR) — all labels, messages, buttons, and copy.
- **Internal codebase:** English.

---

## 2. Goals & Success Metrics

| Goal | Success Metric |
|---|---|
| Eliminate manual calculation errors | Zero payout discrepancies after system adoption |
| Full audit trail for all business data | 100% of create, update, and delete actions logged with user attribution |
| Enable financial reporting | Administrators can generate revenue and remuneration reports filtered by period, legal area, and lawyer |
| Reduce administrative overhead | Fee-to-remuneration calculation is fully automated — no manual step required |
| Protect sensitive data | Role-based access enforced: regular users see only their own financial data |

---

## 3. Non-goals

The following are explicitly out of scope for this system:

- **Client portal** — clients have no access to the system; it is strictly internal.
- **Notifications** — the system does not send email or push notifications for any business event.
- **External integrations** — no integration with accounting systems, court systems, or any third-party platform.
- **Case management** — the system manages fees and remunerations only; deadlines, hearings, and procedural documents are out of scope.

---

## 4. Domain Glossary

| Term (English) | Term (Portuguese) | Definition |
|---|---|---|
| Employee | Colaborador | A lawyer or administrative assistant at the firm |
| Client | Cliente | A person (Pessoa Física) or company (Pessoa Jurídica) seeking legal services |
| Contract | Contrato | A legal case/process linked to a client |
| Revenue | Receita | A payment plan attached to a contract (e.g., administrative, judicial, or succumbency) |
| Fee | Honorário | An individual installment payment received from the client |
| Remuneration | Remuneração | A payment owed to an employee, calculated automatically from a fee |
| Attachment | Anexo | A file (PDF, JPG, PNG) attached to a client, employee, or contract |
| Firm | Escritório | A law firm branch (tenant) in the system |
| OAB | OAB | Brazilian Bar Association registration number (e.g., RS123456) |
| Responsible | Responsável | The lawyer with full responsibility for a contract |
| Recommending | Indicante | The lawyer who referred the client or case |
| Recommended | Indicado | The lawyer assigned to handle a referred case |
| Additional | Adicional | A lawyer automatically assigned to Social Security contracts at a fixed 10% rate |
| Admin Assistant | Assistente Administrativo | Administrative support staff assigned to a contract |

---

## 5. User Roles & Permissions

### 4.1 Roles

| Role | Description |
|---|---|
| **Administrator** | Full system access — manages all data and all users |
| **User** | Lawyer or assistant — sees own contracts, fees, and remunerations; has full access to all clients |

### 4.2 Permission Matrix

| Capability | Administrator | User |
|---|---|---|
| View and update own profile | ✅ | ✅ |
| View all employees | ✅ | ❌ |
| Create, update, or delete employees | ✅ | ❌ |
| View all clients | ✅ | ✅ |
| Create or update clients | ✅ | ✅ |
| Delete or restore clients | ✅ | ❌ |
| View all contracts | ✅ | Only contracts they are assigned to |
| Create or update contracts | ✅ | ✅ |
| Assign or remove employees from a contract | ✅ | ✅ (blocked if active remunerations exist) |
| Delete or restore contracts | ✅ | ❌ |
| View revenues and fees | ✅ (all) | Only from their own contracts |
| Create or update revenues and fees | ✅ | ✅ |
| Delete or restore revenues and fees | ✅ | ❌ |
| View own remunerations | ✅ | ✅ |
| View all remunerations | ✅ | ❌ |
| Edit, delete, or restore remunerations | ✅ | ❌ |
| Dashboard and analytics | ✅ (firm-wide) | ✅ (own data only) |
| Export reports | ✅ (firm-wide) | ✅ (own data only) |
| Upload and view attachments | ✅ | ✅ |
| Delete attachments | ✅ | ❌ |
| View audit logs | ✅ | ❌ |
| Manage users | ✅ | ❌ |

### 4.3 Authentication

- Login via **email** or **OAB number** combined with a password.
- Password reset via email link.
- "Remember me" option extends the session to 7 days (default session: 24 hours).
- After 5 failed login attempts within one minute for the same identifier, further attempts are temporarily blocked.
- All pages except Login and Password Reset require an authenticated session.

---

## 6. Features

### 5.1 Client Management

Create, view, edit, and soft-delete clients. Clients are either individuals (Pessoa Física, identified by CPF) or companies (Pessoa Jurídica, identified by CNPJ). The form adapts dynamically based on client type. Each client's detail view shows related contracts and file attachments.

#### Attributes

| Field | Required | Notes |
|---|---|---|
| Type | Yes | Individual or Company — fixed at creation |
| Full name | Yes | "Nome" for individuals; "Razão Social" for companies |
| Document | Yes | CPF (11 digits) for individuals; CNPJ (14 digits) for companies — unique per firm |
| Email | No | |
| Phone | No | Mobile phone |

### 5.2 Contract Management

Create and manage legal contracts linked to a client. Each contract has a unique process number, a legal area, a fee percentage, and a team of assigned employees with defined roles. Contracts include one or more revenue plans (up to three, one per revenue type). Administrators can lock status changes on individual contracts.

#### Attributes

| Field | Required | Notes |
|---|---|---|
| Client | Yes | Reference to an existing client |
| Process number | Yes | Unique identifier per firm (Número do Processo - text without mask) |
| Legal area | Yes | Social Security, Civil, Family, Labor, or Other |
| Fee percentage | Yes | Overall legal fee percentage for this contract |
| Status | Yes | Active (default), Completed, or Cancelled |
| Allow status change | Yes | Flag controlled by administrators; defaults to true |
| Team | Yes | At least one employee with an assignment type |
| Revenues | Yes | At least one revenue plan at creation |
| Notes | No | Free-text observations |

### 5.3 Revenue Tracking

Define payment plans on contracts. Each revenue specifies a total value, optional down payment, payment start date, and number of installments. The system tracks how many installments have been paid.

#### Attributes

| Field | Required | Notes |
|---|---|---|
| Contract | Yes | Reference to the parent contract |
| Type | Yes | Administrative, Judicial, or Succumbency — unique per contract |
| Total value | Yes | Total amount to be received |
| Down payment | No | Must not exceed total value; defaults to zero |
| Payment start date | Yes | |
| Total installments | Yes | Number of expected installment payments |

### 5.4 Fee Recording

Record individual fee payments (installments) against a revenue. Fees can optionally trigger automatic remuneration generation. Bulk fee creation is supported for efficiency.

#### Attributes

| Field | Required | Notes |
|---|---|---|
| Revenue | Yes | Reference to the parent revenue |
| Payment date | Yes | |
| Amount | Yes | Must be positive |
| Installment number | Yes | Must be unique within the same revenue |
| Generate remuneration | Yes | Defaults to true; controls whether remuneration records are created |

### 5.5 Automated Remuneration Calculation

When a fee is recorded with remuneration generation enabled, the system automatically calculates and creates remuneration records for every employee assigned to that contract, using their configured percentages and assignment type. Administrators can manually adjust remuneration records.

#### Attributes

| Field | Required | Notes |
|---|---|---|
| Fee | Yes | Reference to the originating fee |
| Contract employee | Yes | Reference to the employee assignment on the contract |
| Percentage | Yes | Decimal percentage applied in the calculation |
| Amount | Yes | Calculated result |
| Payment date | Yes | Copied from the originating fee |

### 5.6 Dashboard & Analytics

A summary dashboard showing revenue totals, remuneration totals, monthly comparisons, and recent activity. Charts for revenue by legal area and revenue type. Regular users see only their own data; administrators see firm-wide data.

### 5.7 Report Export

Export remunerations, revenues, or fees as PDF or Excel files, filtered by date range. Scoped by role (own data for users, firm-wide for administrators).

### 5.8 File Attachments

Upload and manage file attachments (PDF, JPG, PNG; max 10 MB) on clients, employees, and contracts. Administrators can delete attachments; all authenticated users can upload and view.

#### Attributes

| Field | Required | Notes |
|---|---|---|
| Entity type | Yes | Client, employee, or contract |
| Entity | Yes | Reference to the parent entity |
| File | Yes | PDF, JPG, or PNG; max 10 MB |

### 5.9 User Management (Admin)

Administrators can create, edit, soft-delete, and restore employee accounts. Each employee has a name, email, optional OAB number, role, type (lawyer or assistant), individual remuneration percentage, and referral percentage.

#### Attributes

| Field | Required | Notes |
|---|---|---|
| Full name | Yes | |
| Email | Yes | Unique across the system |
| Password | Yes | Minimum 8 characters |
| Type | Yes | Lawyer or Admin Assistant |
| Role | Yes | Administrator or User |
| OAB number | No | Lawyers only — format: two uppercase letters followed by 6 digits (e.g. RS123456) |
| Remuneration percentage | Yes | Individual percentage used in remuneration calculations |
| Referral percentage | Yes | Percentage applied when the employee acts as a referrer |
| Avatar | No | Profile photo |

### 5.10 Audit Log (Admin)

An immutable log of all data changes across the system. Each entry records who made the change, when, what entity was affected, and what changed. Filterable by date, user, action, and entity type.

---

## 7. User Stories

### Authentication

- As a **lawyer**, I want to log in using my OAB number so that I don't need to remember a separate email credential.
- As a **user**, I want to check "Remember me" so that I stay logged in for a week without re-entering my password.
- As a **user**, I want to reset my password via email so that I can regain access if I forget it.

### Client Management

- As a **user**, I want to register a new client so that I can associate them with legal contracts.
- As a **user**, I want to search and filter the client list by name, document number, or type so that I can quickly find who I'm looking for.
- As a **user**, I want to view a client's details and related contracts in a side panel so that I don't lose my place in the list.

### Contract Management

- As a **user**, I want to create a contract with assigned lawyers, at least one revenue plan, and a legal area so that fee tracking can begin immediately.
- As a **user**, I want to see which lawyers are assigned to a contract and their roles so that responsibilities are clear.
- As an **administrator**, I want to lock a contract's status so that it cannot be changed accidentally.

### Fee & Remuneration

- As a **user**, I want to record a fee payment and have remunerations calculated automatically so that I don't need to compute each lawyer's share manually.
- As a **user**, I want to record a fee without generating remunerations so that I can handle exceptional cases where payouts are managed separately.
- As a **user**, I want to create multiple fees at once (bulk) so that I can efficiently process a batch of payments.
- As an **administrator**, I want to manually adjust a remuneration record so that I can correct edge cases the formula doesn't cover.

### Reporting & Visibility

- As a **user**, I want to see my total remunerations on the dashboard so that I know how much I've earned.
- As an **administrator**, I want to see firm-wide revenue and remuneration summaries so that I can assess the firm's financial health.
- As an **administrator**, I want to export remuneration data as an Excel file filtered by date range so that I can share it with accounting.

### Administration

- As an **administrator**, I want to create new employee accounts with a defined role and remuneration percentages so that new hires can start using the system.
- As an **administrator**, I want to view the audit log so that I can investigate any data discrepancies.
- As an **administrator**, I want to soft-delete a client, contract, or employee and later restore them so that data is never permanently lost.

---

## 8. Functional Requirements

### 8.1 Authentication

| ID | Requirement |
|---|---|
| FR-AUTH-01 | The system must allow login via email or OAB number combined with a password. |
| FR-AUTH-02 | The system must validate OAB numbers against the accepted format: two letters followed by six digits (e.g., SP123456). |
| FR-AUTH-03 | The system must enforce a minimum password length of 8 characters. |
| FR-AUTH-04 | The "Remember me" option must extend the session duration to 7 days; the default session lasts 24 hours. |
| FR-AUTH-05 | After 5 failed login attempts within one minute for the same identifier, the system must temporarily block further attempts. |
| FR-AUTH-06 | The system must support password reset via an email link. |
| FR-AUTH-07 | The system must prevent access to any page except Login and Password Reset without an authenticated session. |

### 8.2 Clients

| ID | Requirement |
|---|---|
| FR-CLI-01 | The system must support two client types: Individual (Pessoa Física) and Company (Pessoa Jurídica). |
| FR-CLI-02 | The system must validate that individual clients have a valid CPF and company clients have a valid CNPJ. |
| FR-CLI-03 | The system must prevent two clients in the same firm from sharing the same CPF or CNPJ. |
| FR-CLI-04 | The client creation form must adapt its fields and labels based on the selected client type. |
| FR-CLI-05 | The system must allow users to search and filter the client list by name, document number, type, and active/inactive status. |
| FR-CLI-06 | The client detail view must show related contracts and attachments. |

### 8.3 Contracts

| ID | Requirement |
|---|---|
| FR-CON-01 | Every contract must be linked to exactly one client. |
| FR-CON-02 | The system must prevent two contracts from sharing the same process number within a firm. |
| FR-CON-03 | Every contract must have at least one assigned employee. |
| FR-CON-04 | Every contract must have at least one revenue plan at creation time. |
| FR-CON-05 | A contract may have up to three revenue plans, one per revenue type (Administrative, Judicial, Succumbency). Duplicate types are not allowed. |
| FR-CON-06 | Contract statuses are: Active, Completed, and Cancelled. |
| FR-CON-07 | A contract's status must automatically change to Completed when all its revenues have been fully paid. |
| FR-CON-08 | Administrators may manually cancel a contract, unless status changes have been locked. |
| FR-CON-09 | Administrators may lock a contract to prevent any status changes. |
| FR-CON-10 | The system must prevent regular users from viewing contracts they are not assigned to. |

### 8.4 Team Assignment

| ID | Requirement |
|---|---|
| FR-TEAM-01 | Each employee on a contract must have exactly one assignment type: Responsible, Recommending, Recommended, Additional, or Admin Assistant. |
| FR-TEAM-02 | The system must prevent the same employee from being assigned to the same contract more than once. |
| FR-TEAM-03 | The "Additional" assignment is only valid on Social Security (Previdenciário) contracts and is automatically assigned by the system. |
| FR-TEAM-04 | The system must prevent removing an employee from a contract if that employee has active remuneration records on that contract. |

### 8.5 Revenues

| ID | Requirement |
|---|---|
| FR-REV-01 | When creating a revenue plan, the system must capture its type, total value, optional down payment, payment start date, and total number of installments. |
| FR-REV-02 | The system must prevent the down payment from exceeding the total revenue value. |
| FR-REV-03 | The system must automatically track the number of installments paid and update it when fees are recorded. |
| FR-REV-04 | The system must prevent the same revenue type from appearing more than once on a contract. |

### 8.6 Fees

| ID | Requirement |
|---|---|
| FR-FEE-01 | The system must allow users to record a fee payment against a specific revenue, capturing the payment date, amount, and installment number. |
| FR-FEE-02 | The system must prevent fee amounts from being zero or negative. |
| FR-FEE-03 | The system must prevent duplicate installment numbers within the same revenue. |
| FR-FEE-04 | Each fee has a "Generate Remuneration" toggle (default: enabled). When enabled, remuneration records are automatically created for all employees assigned to the contract. |
| FR-FEE-05 | The system must support bulk creation of multiple fees at once. |
| FR-FEE-06 | The system must prevent regular users from viewing fees from contracts they are not assigned to. |

### 8.7 Remunerations

| ID | Requirement |
|---|---|
| FR-REM-01 | Remunerations must be generated automatically from fees — they are never created manually by users. |
| FR-REM-02 | Each remuneration must be traceable to the fee that originated it and must display the employee it belongs to, the percentage applied, and the resulting amount. |
| FR-REM-03 | Administrators may manually edit a remuneration's percentage and calculated amount. |
| FR-REM-04 | The system must prevent regular users from viewing remunerations that belong to other employees. |
| FR-REM-05 | The remuneration list must display a summary total. |

### 8.8 Attachments

| ID | Requirement |
|---|---|
| FR-ATT-01 | The system must allow files to be attached to clients, employees, or contracts. |
| FR-ATT-02 | The system must only accept files in PDF, JPG, or PNG format. |
| FR-ATT-03 | The system must prevent uploads larger than 10 MB. |
| FR-ATT-04 | All authenticated users may upload and view attachments. |
| FR-ATT-05 | Only administrators may delete attachments. |

### 8.9 Dashboard

| ID | Requirement |
|---|---|
| FR-DASH-01 | The dashboard must show: total revenue value, total remuneration value, monthly comparisons, and recent activity. |
| FR-DASH-02 | Regular users must see only data related to their own contracts. Administrators must see firm-wide data. |
| FR-DASH-03 | The dashboard must include revenue charts broken down by legal area and by revenue type. |

### 8.10 Export

| ID | Requirement |
|---|---|
| FR-EXP-01 | The system must allow users to export remunerations, revenues, or fees. |
| FR-EXP-02 | Supported export formats: PDF and Excel. |
| FR-EXP-03 | Exports must be filterable by date range. |
| FR-EXP-04 | Exports must be scoped by role: regular users export only their own data; administrators export firm-wide data. |

### 8.11 Audit Log

| ID | Requirement |
|---|---|
| FR-AUD-01 | Every create, update, soft-delete, and restore action on any business entity must be logged. |
| FR-AUD-02 | Each log entry must record when it occurred, who performed the action, what action was taken, which entity was affected, and what changed. |
| FR-AUD-03 | Audit log entries are immutable — they cannot be edited or deleted. |
| FR-AUD-04 | The audit log is accessible only to administrators. |
| FR-AUD-05 | The audit log must be filterable by date range, user, action type, and entity type. |

### 7.12 Data Management

| ID | Requirement |
|---|---|
| FR-DATA-01 | All deletions must be soft deletes — records are marked as inactive and never permanently removed. |
| FR-DATA-02 | Administrators may restore soft-deleted records. |
| FR-DATA-03 | The system must ensure that all data is fully isolated per firm — a user in one firm must never be able to access data belonging to another firm. |
| FR-DATA-04 | The system must require explicit user confirmation before executing any delete or restore action. |

### 7.13 Performance & Usability

| ID | Requirement |
|---|---|
| FR-PERF-01 | The system must feel responsive under normal usage — all common interactions (loading lists, viewing details, saving data) must complete without noticeable delay. |
| FR-PERF-02 | All lists must be paginated to keep the interface fast and manageable. |
| FR-PERF-03 | Sorting, filtering, and pagination state must be reflected in the URL so that views are shareable and bookmarkable. |

---

## 9. Business Rules

### 8.1 Employee Assignment Types on Contracts

Each employee assigned to a contract has a specific role that determines how their remuneration is calculated:

| Assignment | Who Can Hold It | Remuneration Basis |
|---|---|---|
| **Responsible** | Lawyer | Receives their full individual percentage of the fee |
| **Recommending** (Referrer) | Lawyer | Receives their referral percentage of the fee |
| **Recommended** (Referred) | Lawyer | Receives their individual percentage minus the referrer's percentage |
| **Additional** | Lawyer (auto-assigned) | Fixed 10% of the fee — only on Social Security contracts |
| **Admin Assistant** | Administrative staff | Receives their full individual percentage of the fee |

### 9.2 Valid Team Compositions

| Scenario | Team Composition |
|---|---|
| Solo | 1 Responsible |
| Referral | 1 Recommending + 1 Recommended |
| With Assistant | 1 Responsible + 1 Admin Assistant |
| Social Security Bonus | 1 Responsible + 1 Additional |
| Complex | 1 Recommending + 1 Recommended + 1 Admin Assistant + 1 Additional |

### 9.3 Remuneration Calculation

When a fee is recorded with remuneration generation enabled, the system creates one remuneration record for each employee assigned to that contract:

| Assignment | Formula |
|---|---|
| Responsible | Fee amount × employee's individual percentage |
| Recommending | Fee amount × employee's referral percentage |
| Recommended | Fee amount × (employee's individual percentage − referrer's referral percentage) |
| Additional | Fee amount × 10% |
| Admin Assistant | Fee amount × employee's individual percentage |

### 9.4 Fee Lifecycle & Side Effects

| Event | System Behavior |
|---|---|
| Fee created (remuneration enabled) | Remuneration records created for all assigned employees; installments-paid counter incremented |
| Fee created (remuneration disabled) | No remunerations generated; installments-paid counter incremented |
| Fee updated (remuneration enabled) | All remuneration amounts for that fee are recalculated |
| Fee updated (remuneration disabled) | Existing remunerations remain unchanged |
| Fee soft-deleted | All linked remunerations are also soft-deleted |
| Fee restored | All linked remunerations are also restored |
| All installments for all revenues on a contract are paid | Contract status automatically changes to Completed |

### 9.5 Deletion Protection Rules

Entities with active dependents cannot be deleted:

| Entity | Blocked When |
|---|---|
| Client | Has active contracts |
| Contract | Has active revenues |
| Revenue | Has active fees |
| Fee | Has active remunerations |
| Employee (from contract) | Has active remunerations on that contract |

### 9.6 Referral Percentage Constraint

When a Recommending + Recommended pair is assigned to a contract, the referrer's referral percentage must not exceed the recommended lawyer's individual percentage. If it does, the assignment must be rejected with a clear error message.

### 9.7 Contract Status Flow

- **Active** → **Completed**: Happens automatically when all revenues are fully paid.
- **Active** → **Cancelled**: Manual action by an administrator (must respect the status lock).
- The administrator may lock a contract to prevent any status transitions.

### 9.8 Data Formatting Standards

| Data Type | Display Format | Example |
|---|---|---|
| Currency | R$ with Brazilian thousand/decimal separators | R$ 1.234,56 |
| Date | DD/MM/YYYY | 25/12/2025 |
| CPF | 000.000.000-00 | 123.456.789-01 |
| CNPJ | 00.000.000/0000-00 | 12.345.678/0001-95 |
| OAB | XX 000.000 | RS 123.456 |
| Phone | (00) 00000-0000 | (11) 98765-4321 |
| Percentage | Displayed as a whole number with % symbol | 30% |

---

## 10. User Flows

### 10.1 Login

1. User opens the application and sees the login screen.
2. User enters their email or OAB number and password.
3. Optionally checks "Remember me."
4. Clicks "Entrar" (Sign In).
5. On success: redirected to the Dashboard.
6. On failure: a Portuguese error message is displayed (e.g., "Credenciais inválidas").
7. After 5 failed attempts in one minute, further attempts are temporarily blocked.

### 10.2 Register a New Client

1. User navigates to the Clients list.
2. Clicks "Novo Cliente" (New Client).
3. A modal opens. User selects client type (Individual or Company).
4. The form adapts: label changes ("Nome" vs. "Razão Social"), document field adjusts (CPF vs. CNPJ).
5. User fills in required fields and clicks "Salvar" (Save).
6. On success: toast confirmation, modal closes, client list refreshes.
7. On failure: inline validation errors displayed in Portuguese.

### 10.3 Create a Contract

1. User navigates to the Contracts list.
2. Clicks "Novo Contrato" (New Contract).
3. A modal opens with sections:
   - **Client**: searchable dropdown to select a client.
   - **Process Number**: unique text input.
   - **Legal Area**: dropdown (Social Security, Civil, Family, Labor, Other).
   - **Fee Percentage**: numeric input.
   - **Team**: assign at least one lawyer (Responsible). Optionally add Recommending, Admin Assistant.
   - **Revenues**: at least one revenue tab must be filled (Administrative, Judicial, or Succumbency). Each tab has: total value, down payment, start date, number of installments.
   - **Notes**: optional text area.
4. User clicks "Salvar."
5. On success: toast confirmation, modal closes, contract list refreshes.
6. If the legal area is Social Security, the system automatically assigns the Additional employee.

### 10.4 Record a Fee and Generate Remunerations

1. User navigates to the Fees list.
2. Clicks "Novo Honorário" (New Fee).
3. A modal opens. User selects a contract (searchable), then selects a revenue (filtered by the chosen contract).
4. User enters: payment date, amount, installment number.
5. "Generate Remuneration" checkbox is on by default.
6. User clicks "Salvar."
7. The system:
   a. Creates the fee record.
   b. Increments the installments-paid counter on the revenue.
   c. Creates one remuneration record per assigned employee, applying the appropriate formula.
   d. Checks if all installments across all revenues are paid; if so, marks the contract as Completed.
8. Toast confirmation displayed.

### 10.5 View and Export Remunerations

1. User navigates to the Remunerations list.
2. Regular users see only their own remunerations. Administrators see all.
3. A summary card at the top shows the total remuneration value.
4. User can filter by date range, contract, or employee.
5. User clicks "Exportar" (Export), selects format (PDF or Excel) and date range.
6. The system generates and downloads the file.

### 10.6 Soft-Delete and Restore

1. Administrator selects an entity (e.g., a client) and clicks "Excluir" (Delete).
2. A confirmation dialog appears: "Tem certeza que deseja excluir?"
3. If the entity has active dependents, the system blocks the deletion with an explanatory message.
4. If allowed, the entity is soft-deleted (marked as inactive).
5. The administrator can later find the deleted entity via a status filter and click "Restaurar" (Restore).

### 10.7 Upload an Attachment

1. User opens a client, employee, or contract detail view.
2. Scrolls to the Attachments section.
3. Clicks "Enviar Arquivo" (Upload File).
4. Selects a file (PDF, JPG, or PNG; max 10 MB).
5. On success: file appears in the attachments list.
6. On failure: error message (e.g., "Arquivo deve ter no máximo 10MB" or "Formato inválido").

---

## 11. Edge Cases

### 11.1 Authentication

| Scenario | Expected Behavior |
|---|---|
| User enters an OAB number in lowercase | The system normalizes it |
| User exceeds 5 login attempts in one minute | Further attempts are temporarily blocked; the user is informed to wait |
| Session expires while user is filling a form | On next action, user is redirected to login; unsaved data is lost (expected) |

### 11.2 Client Data

| Scenario | Expected Behavior |
|---|---|
| Two clients with the same CPF or CNPJ | The system rejects the duplicate with "Registro já existe" |
| Deleting a client who has active contracts | Deletion is blocked with an explanatory message |
| Client type changed from Individual to Company after creation | Not supported — client type is fixed at creation |

### 11.3 Contract & Team

| Scenario | Expected Behavior |
|---|---|
| Contract created with zero revenues | Rejected — at least one revenue is required |
| Two revenues of the same type on one contract | Rejected — each revenue type may only appear once |
| Recommending lawyer's referral % exceeds Recommended lawyer's individual % | Assignment rejected with a clear error ("O percentual do indicante não pode ser maior que o percentual do indicado") |
| Attempting to add "Additional" assignment to a non-Social Security contract | Rejected — Additional is only valid for Social Security |
| Removing an employee who has active remunerations on the contract | Blocked with message: "Colaborador possui remunerações ativas e não pode ser removido do contrato" |
| All installments for all revenues are paid | Contract status automatically transitions to Completed |
| Administrator locked a contract's status, then all fees are paid | Status change to Completed is blocked by the lock — administrator must unlock first |

### 11.4 Fees & Remunerations

| Scenario | Expected Behavior |
|---|---|
| Fee created with "Generate Remuneration" unchecked | No remunerations are created; the fee is recorded normally |
| Fee updated after remunerations were generated (remuneration toggle still on) | All linked remunerations are recalculated with the new fee amount |
| Fee updated with remuneration toggle turned off | Existing remunerations remain unchanged |
| Fee soft-deleted | All linked remunerations are also soft-deleted |
| Fee restored | All linked remunerations are also restored |
| Down payment exceeds total value | Rejected at input: "O valor de entrada não pode ser maior que o valor total" |
| Installment number duplicated within the same revenue | Rejected — installment numbers must be unique per revenue |
| Installments paid exceeds total installments | The system prevents this from occurring |

### 11.5 Attachments

| Scenario | Expected Behavior |
|---|---|
| File exceeds 10 MB | Rejected with "Arquivo deve ter no máximo 10MB" |
| Unsupported file type (e.g., .docx) | Rejected with "Formato inválido. Use PDF, JPG ou PNG" |

### 11.6 Multi-Tenancy

| Scenario | Expected Behavior |
|---|---|
| User from Firm A attempts to access a record from Firm B | Access denied — all data is scoped to the user's firm |
| User attempts to reference an entity from another firm in a form | Entity does not appear in search or dropdown results |

### 11.7 Audit & Compliance

| Scenario | Expected Behavior |
|---|---|
| Any business entity is created, updated, soft-deleted, or restored | An immutable audit log entry is recorded with full change details |
| A user attempts to modify or delete an audit log entry | Not possible — audit logs are append-only |

---

## Appendix A: Screens Overview

| Screen | Purpose | Access |
|---|---|---|
| Login | Email/OAB authentication | Public |
| Password Reset | Self-service password recovery | Public |
| Dashboard | Financial summaries and recent activity | Authenticated (scoped by role) |
| Clients | Client list, creation, and detail view | Authenticated |
| Contracts | Contract list, creation, team management, and detail view | Authenticated (scoped by role) |
| Fees | Fee list and recording | Authenticated (scoped by role) |
| Remunerations | Remuneration list and summaries | Authenticated (scoped by role) |
| User Management | Employee account administration | Administrator only |
| Audit Log | Immutable change history viewer | Administrator only |

### Screen Layout Conventions

- **Entity details** are displayed in a slide-in side panel (drawer) — never on a separate page.
- **Create and edit forms** are displayed in a modal overlay — never on a separate page.
- **Notifications** appear as toast messages at the top of the screen.
- **Data tables** support sortable columns and URL-driven filtering and pagination.
- **Loading states** use skeleton placeholders for tables and cards.
- **Empty states** display a helpful message in Portuguese (e.g., "Nenhum registro encontrado").
- **Buttons** show a loading spinner and are disabled during form submission.
- The application is **desktop-first**, with a collapsible sidebar navigation. Basic responsive support is provided for tablets and phones.

---

## Appendix B: Lookup Values

These are system-defined reference values. They are not editable through the application UI.

### Employee Types

| Value | Label (pt-BR) |
|---|---|
| Lawyer | Advogado |
| Admin Assistant | Assistente Administrativo |

### Client Types

| Value | Label (pt-BR) |
|---|---|
| Individual | Pessoa Física |
| Company | Pessoa Jurídica |

### Legal Areas

| Value | Label (pt-BR) |
|---|---|
| Social Security | Previdenciário |
| Civil | Cível |
| Family | Família |
| Labor | Trabalhista |
| Other | Outros |

### Contract Statuses

| Value | Label (pt-BR) |
|---|---|
| Active | Ativo |
| Completed | Concluído |
| Cancelled | Cancelado |

### Revenue Types

| Value | Label (pt-BR) |
|---|---|
| Administrative | Administrativo |
| Judicial | Judicial |
| Succumbency | Sucumbência |

### Employee Assignment Types

| Value | Label (pt-BR) |
|---|---|
| Responsible | Responsável |
| Recommending | Indicante |
| Recommended | Indicado |
| Additional | Adicional |
| Admin Assistant | Assistente Administrativo |

---

## Appendix C: Security & Compliance

| Concern | How It Is Addressed |
|---|---|
| Input validation | All user inputs are validated before being accepted by the system |
| Audit trail | All business data changes are logged with full user attribution and are immutable |
| Data isolation | All data is strictly scoped to the authenticated user's firm |
| Role enforcement | Access to every protected action is governed by the user's assigned role |
| Data retention | Data is never permanently removed — soft deletes support legal retention requirements |
| Sensitive data access | Financial data (fees, remunerations) is restricted based on role and contract assignment |
| Authentication security | Login attempts are rate-limited to prevent brute-force access |

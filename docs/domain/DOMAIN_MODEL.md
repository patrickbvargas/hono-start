# Domain Model

## Core Entities

- `Firm`: tenant root for all business data.
- `Employee`: a lawyer or administrative assistant who may also be a system user.
- `Client`: an individual or company represented by the firm.
- `Contract`: a legal engagement linked to one client.
- `ContractEmployee`: assignment of an employee to a contract with a specific role.
- `Revenue`: a payment plan attached to a contract.
- `Fee`: a concrete payment received against a revenue.
- `Remuneration`: an amount owed to an employee as the result of a fee.
- `Attachment`: a file associated with a client, employee, or contract.
- `AuditLog`: immutable record of business changes.

## Entity Responsibilities

- `Firm` defines tenant ownership and firm-level defaults.
- `Employee` represents both staff identity and operational participation in contracts.
- `Client` is the business party attached to legal work.
- `Contract` is the main business aggregate linking client, team, revenue plans, and lifecycle status.
- `Revenue` defines expected incoming value and payment schedule.
- `Fee` records actual incoming payments.
- `Remuneration` records outgoing employee compensation derived from fee events.

## Entity Contracts

### Firm

- Tenant root entity.
- Does not carry `firmId`.
- Does not use soft delete.

### Employee

- Carries firm-scoped identity and user-account semantics.
- Has employee type, user role, optional OAB number, remuneration percentage, referral percentage, optional avatar, active state, and soft-delete state.
- OAB number is required for lawyers.
- OAB number is unique per firm.
- Employee email is globally unique.
- `referralPercentage` must not exceed `remunerationPercentage`.

### Client

- Belongs to exactly one firm.
- Has fixed type after creation.
- Carries a firm-scoped unique document.
- Supports optional contact fields and active or deleted lifecycle state.

### Contract

- Belongs to one client and one firm.
- Carries unique process number per firm.
- Carries legal area, status, fee percentage, optional notes, and status-lock semantics.
- Owns assignments, revenues, and attachments as part of its working aggregate.

### ContractEmployee

- Connects an employee to a contract with one assignment type.
- Exists inside the tenant boundary.
- May accumulate remunerations through fee generation.

### Revenue

- Belongs to one contract and one firm.
- Carries type, total value, optional down payment, payment start date, installment count, and active or deleted lifecycle state.
- Active uniqueness is constrained by contract and revenue type.

### Fee

- Belongs to one revenue and one firm.
- Carries payment date, amount, installment number, remuneration-generation flag, and active or deleted lifecycle state.
- Active uniqueness is constrained by revenue and installment number.

### Remuneration

- Belongs to one fee, one contract assignment, and one firm.
- Stores effective percentage, amount, payment date, and lifecycle state.
- Is generated from fee behavior rather than manual user creation.

### Attachment

- Belongs to one firm and exactly one owner context among client, employee, or contract.
- Carries file name, file URL or path, attachment type, file size, and lifecycle state.

### AuditLog

- Belongs to one firm and one acting user.
- Records entity type, entity id, action, change payload, and immutable creation timestamp.
- Is append-only and never soft-deleted.

## Lookup Concepts

The system uses lookup tables for categorical values rather than hard-coded enums in product behavior:

- employee type
- user role
- client type
- legal area
- contract status
- revenue type
- assignment type
- attachment type

Lookup values are part of domain behavior and must remain stable by `value`.

## Lookup Families

- employee type
- user role
- client type
- legal area
- contract status
- revenue type
- assignment type
- attachment type

See `docs/domain/LOOKUP_VALUES.md` for the canonical allowed values and labels.

## Relationship Summary

- One `Firm` owns many employees, clients, contracts, revenues, fees, remunerations, attachments, and audit logs.
- One `Client` may own many contracts.
- One `Contract` must belong to one client and may own many assignments, revenues, and attachments.
- One `Revenue` belongs to one contract and may own many fees.
- One `Fee` may generate many remunerations.
- One `Employee` may participate in many contracts through `ContractEmployee`.

## Lifecycle Concepts

- Business entities support active and inactive status and soft delete as separate concerns.
- Lookup values support active and inactive status but not soft delete.
- Deleted records are not treated as permanently removed data.
- Remunerations are derived from fee events but become persisted records after generation.
- Completed and cancelled contracts are business read-only states.
- Cascading behavior matters across contracts, revenues, fees, remunerations, and assignments.

## Tenant Model

- Firm is the tenant boundary.
- Business records belong to exactly one firm.
- A user must never see or mutate data from another firm.

## Conceptual Rules For Status And Visibility

- `deleted` means removed from normal operation but still restorable.
- `inactive` means present but not eligible for normal selection flows.
- Business-entity option lists hide inactive and deleted items by default.
- Lookup values may remain visible but disabled when inactive.

## Financial Model

- Monetary values are first-class domain values and require precise decimal handling.
- Percentages drive remuneration logic and must preserve exact business semantics.
- Derived status such as fully paid or remaining value comes from persisted fee and revenue data rather than ad hoc manual overrides.

## Derived Domain State

- Revenue payment progress is derived from down payment, active fee records, and total expected value.
- `paidValue` for a revenue means `down payment + sum of active fee amounts for that revenue`.
- `installmentsPaid` means the count of active fee records for that revenue.
- `remainingValue` means `max(totalValue - paidValue, 0)`.
- A revenue is considered fully paid when `remainingValue = 0`.
- Fee creation must also respect the structural installment limit even if `remainingValue` is still greater than zero.
- Contract completion is derived from the payment state of all active revenues.
- A contract is considered fully paid only when every active revenue is fully paid.
- Assignment validity depends on both employee type and contract context.

## Authentication Entity Relationship

- `Employee` is the application user entity referenced by authentication records.
- Session and account state are authentication concerns that point to the employee identity.

## Conceptual Boundaries

- Client management, contract management, fee management, and remuneration calculation are separate concerns, but they are tightly linked by the contract lifecycle.
- The domain is driven by fee collection and downstream remuneration correctness.

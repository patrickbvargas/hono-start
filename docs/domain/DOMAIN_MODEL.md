# Domain Model

## Core Entities

- `Firm`: ownership boundary for operational business data.
- `Employee`: a company-wide lawyer or administrative assistant who may also be a system user.
- `Client`: a company-wide individual or business party, independent of Firm.
- `Contract`: a legal engagement linked to one client.
- `ContractEmployee`: assignment of an employee to a contract with a specific role.
- `Revenue`: a payment plan attached to a contract.
- `Fee`: a concrete payment received against a revenue.
- `Expense`: a concrete firm outflow recorded independently from contracts.
- `Remuneration`: an amount owed to an employee as the result of a fee.
- `Attachment`: a file associated with a client, employee, contract, expense, fee, or remuneration.
- `AuditLog`: immutable record of business changes.

## Entity Responsibilities

- `Firm` defines business-unit ownership and defaults. The active Clerk Organization privateMetadata.firmId selects that existing unit.
- `Employee` represents both staff identity and operational participation in contracts.
- `Client` is the business party attached to legal work.
- `Contract` is the main business aggregate linking client, team, revenue plans, and lifecycle status.
- `Revenue` defines expected incoming value and payment schedule.
- `Fee` records actual incoming payments.
- `Expense` records actual outgoing payments or operational costs.
- `Remuneration` records outgoing employee compensation derived from fee events.

## Entity Contracts

### Firm

- Tenant root entity.
- Does not carry `firmId`.
- Does not use soft delete.

### Employee

- Carries company-wide professional identity and business settings.
- Has employee type, optional OAB number, remuneration percentage, referral percentage, active state, and soft-delete state.
- OAB number is required for lawyers.
- OAB number is unique company-wide.
- Employee stores a professional name and business attributes only. Account email, photo and access role are read from Clerk, not copied into Employee. Account creation and invitations are managed in Clerk.
- `referralPercentage` must not exceed `remunerationPercentage`.

### Client

- Is shared across the company, independent of Firm.
- Carries a client type that may be changed later.
- Carries a company-wide unique document.
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

### Expense

- Belongs to one firm and one expense category.
- Carries expense date, amount, optional notes, and active or deleted lifecycle state.
- Is intentionally standalone in the first version and does not require links to client, contract, revenue, or collaborator.

### Remuneration

- Belongs to one fee, one contract assignment, and one firm.
- Stores effective percentage, amount, payment date, and lifecycle state.
- Is generated from fee behavior rather than manual user creation.

### Attachment

- Has exactly one owner context among client, employee, contract, expense, fee, or remuneration. firmId records upload origin; visibility follows the owner as defined in [Multitenancy](MULTITENANCY.md).
- Carries file name, file URL or path, attachment type, and file size.
- Attachment deletion permanently removes both the stored file and its database record.

### AuditLog

- Records its event-origin firm and actor snapshot; actorId optionally links the acting Employee. Shared owner references are separate from the actor.
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
- expense category

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
- expense category

See `docs/domain/LOOKUP_VALUES.md` for the canonical allowed values and labels.

## Relationship Summary

- One `Firm` owns many contracts, revenues, fees, expenses and remunerations, and records attachment/audit origin; clients, employees and lookup options are shared.
- One `Firm` owns many expenses.
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

- Firm is the operational isolation boundary within one company.
- Client, Employee and lookup options are global; operations belong to exactly one Firm. Attachments and audit follow their owner while retaining origin firmId.
- Other-Firm operations are never exposed through a shared master. See the complete [entity-scope matrix and examples](MULTITENANCY.md).

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
- Session and account state belong to Clerk; optional privateMetadata.employeeId points to a business collaborator for own/assigned visibility.

## Conceptual Boundaries

- Client management, contract management, fee management, and remuneration calculation are separate concerns, but they are tightly linked by the contract lifecycle.
- The domain is driven by fee collection, expense capture, and downstream remuneration correctness.

## Provider authority

Clerk exclusively owns authentication and permission grants. Legacy UserRole remains historical business data only. Legacy auth UUID and forced-reset fields have been retired. They cannot grant runtime access. Integer Employee IDs remain audit actors.

Employee profile photos are owned by Clerk; Employee does not persist an avatar URL.

Firm is a business unit (unidade/filial). The active Clerk Organization privateMetadata.firmId must be a positive integer identifying an existing Firm. The operator manages this link only in Clerk; no organization name or fixed ID is special. Membership plus the valid mapping defines the current unit boundary. Missing, malformed or nonexistent mappings deny access with no default Firm. Multiple Organizations may intentionally share a Firm.

## Business and authentication isolation

Employee has no Clerk ID, account email, avatar or access role. Users and invitations are managed in Clerk. Server-validated Clerk privateMetadata.employeeId optionally resolves an active Employee for own and assigned capabilities; missing binding never widens scope. An explicit invalid, inactive or deleted binding denies the session. General capabilities do not require an Employee link. The same valid global Employee remains bound when switching Firm; current Clerk membership grants and operational Firm scopes still apply. Audit actors without an Employee retain their Clerk account name and email with a null employee actor ID. Firm is selected exclusively by the active Organization privateMetadata.firmId fetched server-side for the current request. Switching Organization changes the unit context and clears previous frontend data; every protected operation still enforces its current Firm scope.

## Company-wide clients and employees

See [Multitenancy](MULTITENANCY.md) for the authoritative entity-scope matrix, global lifecycle, evidence visibility and current-Firm enforcement.

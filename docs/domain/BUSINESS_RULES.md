# Business Rules

## Core Invariants

- Every business record must belong to the authenticated user's firm, except global lookup tables.
- Soft delete and active/inactive status are independent concerns.
- Lookup-backed selections use stable lookup `value` semantics, not environment-specific IDs.
- Financial calculations must preserve decimal precision.
- Auditability is mandatory for business mutations.

## Authentication Rules

- Users authenticate with email or OAB number plus password.
- OAB login accepts the format of two uppercase letters followed by six digits.
- Passwords require a minimum length of 8 characters.
- The product must support password reset.
- Protected pages require an authenticated session.
- Session-derived role and firm scope are authoritative.
- Repeated failed authentication attempts must trigger protective behavior rather than unlimited retries.
- The failed-login threshold is 5 failed attempts within 1 minute for the same identifier.
- The remember-me flow extends session duration to 7 days.
- The default authenticated session duration is 24 hours.
- All pages except Login and Password Reset require an authenticated session.
- OAB-format validation remains part of authentication semantics where applicable.

## Client Rules

- A client is either an individual or a company.
- Individual clients use CPF semantics.
- Company clients use CNPJ semantics.
- Client type is fixed after creation.
- Inactive or deleted clients must not appear in contract creation options.
- Client document uniqueness is firm-scoped.
- Client forms expose `isActive` as an `Ativo` checkbox.
- Client detail behavior includes related contracts and attachments.
- Individual clients display the primary name field as `Nome`.
- Company clients display the primary name field as `Razão Social`.

## Contract Rules

- Every contract belongs to exactly one client.
- A contract must have at least one assigned employee at creation.
- A contract must have at least one revenue at creation.
- A contract may have at most three revenues, one per revenue type.
- Completed and cancelled contracts are read-only except for restore by an administrator.
- Contract status changes may be locked by administrators.
- Process number is unique per firm.
- Contract visibility for non-admin users depends on assignment to that contract.
- Contract forms expose `isActive` as an `Ativo` checkbox.
- Contract status values are `ACTIVE`, `COMPLETED`, and `CANCELLED`.
- Administrators may manually cancel a contract when status changes are not locked.
- Completed and cancelled contracts do not allow fee recording, revenue edits, or team changes.
- Only administrators may control the allow-status-change setting.
- A contract is considered writable only when it is active and not blocked by the status-lock semantics relevant to the attempted action.

## Assignment Rules

- Each contract assignment must use exactly one assignment type.
- The same employee must not be assigned to the same contract more than once while active.
- Assignment type must be compatible with employee type.
- Lawyers may hold responsible, recommending, or recommended assignments.
- Administrative assistants may hold only the admin-assistant assignment.
- Assignment changes are blocked when active remunerations would invalidate the applied formula.

## Team Composition Rules

- Solo handling requires at least one responsible lawyer.
- Referral flows require recommending and recommended participants with compatible percentages.
- Admin assistants may participate only within their assignment type constraints.
- Recommended and recommending pairs must satisfy the referral-percentage rule.

## Fee and Revenue Rules

- Revenue down payment must not exceed total value.
- Revenue must capture type, total value, optional down payment, payment start date, and total installments.
- Revenue total installments must be at least 1.
- Fee installment numbers must be unique per revenue while active.
- Fee amount must be positive.
- Fee installment number must be at least 1.
- Fees may generate remunerations automatically.
- When all contract revenues are fully paid, the contract becomes completed unless status change is locked.
- A contract may not carry duplicate revenue types while active.
- Revenue edits must preserve already-paid invariants.
- Fee records are the source events that drive remuneration generation.
- A contract may have at most one active revenue per revenue type.
- Revenue tracking includes installments-paid progress and remaining value.
- Fee creation must be blocked once the revenue already has all expected installments paid.
- Fee bulk creation for the same revenue is allowed as an all-or-nothing transaction.
- Revenue editing must not reduce installment count below installments already paid.
- Revenue editing must not reduce total value below total already paid.
- Revenue type changes must still respect active uniqueness.
- Revenue `paidValue` is calculated as `down payment + sum of active fee amounts`.
- Revenue `installmentsPaid` is calculated as the count of active fee records for that revenue.
- Revenue `remainingValue` is calculated as `max(totalValue - paidValue, 0)`.
- A revenue is fully paid when `remainingValue = 0`.
- Contract auto-completion depends on active revenues reaching the fully-paid state, not merely on the presence of a configured installment plan.

## Remuneration Rules

- One remuneration may be created per eligible contract assignment when a fee generates remunerations.
- The effective calculation depends on assignment type.
- Referral percentage must not exceed the referred employee's remuneration percentage.
- Administrators may manually override remunerations; regular users may not.
- Responsible assignments use the employee remuneration percentage.
- Recommending assignments use the employee referral percentage.
- Recommended assignments use the employee remuneration percentage minus the recommending employee referral percentage.
- Admin-assistant assignments use the employee remuneration percentage.
- Remunerations are system-generated from fees rather than manually created by users.
- Remuneration payment date is copied from the source fee.
- Only administrators may edit remuneration percentage and amount.
- Turning remuneration generation off on a fee update does not delete or rewrite previously generated remunerations.
- Fee recalculation rewrites the system-generated remuneration values linked to that fee unless a remuneration was intentionally converted into a manual administrative override.
- Manual override means the remuneration is no longer silently re-derived from later fee updates.

## Fee Lifecycle Rules

| Event | Expected Behavior |
|---|---|
| Fee created with remuneration generation enabled | Remunerations are created for assigned employees |
| Fee created with remuneration generation disabled | No remunerations are created |
| Fee updated with remuneration generation enabled | Linked system-generated remunerations are recalculated; manual overrides remain unchanged |
| Fee updated with remuneration generation disabled | Existing remunerations remain unchanged |
| Fee soft-deleted | Linked remunerations are soft-deleted |
| Fee restored | Linked remunerations are restored |
| All installments across active revenues are fully paid | Contract auto-completes if status change is allowed |

## Attachment Rules

- Attachments may belong to clients, employees, or contracts.
- Supported file types and size limits are part of the product contract.
- Upload and view permissions differ from delete permissions.
- Supported attachment types are `PDF`, `JPG`, and `PNG`.
- Maximum attachment size is `10 MB`.
- Exactly one attachment owner context is set per file: client, employee, or contract.
- Attachment storage uses a persistent file-storage backend and retains file path or URL in the record.

## Deletion and Restore Rules

- Deletions are soft deletes.
- Administrators may restore soft-deleted business records.
- Deletion must be blocked when active dependents would violate business consistency.
- Cascading delete and restore behavior must preserve contract, fee, and remuneration consistency.
- Attachments are retained rather than cascaded away with parent entity deletion.

## Deletion Protection Matrix

| Entity | Deletion Is Blocked When |
|---|---|
| Client | Has active contracts |
| Contract | Has active revenues |
| Revenue | Has active fees |
| Fee | Has active remunerations |
| Employee from contract | Has active remunerations on that contract |
| Employee account | Has active contract assignments with active remunerations |

## Contract Status Flow

- `ACTIVE -> COMPLETED` happens automatically when all revenues are fully paid.
- `ACTIVE -> CANCELLED` is an administrative action and respects the status lock.
- `CANCELLED` and `COMPLETED` are read-only contract states.
- Restore returns a cancelled or completed contract to `ACTIVE`.
- Status lock prevents both manual and automatic transitions.
- Status lock governs status transitions, not ordinary editing of an otherwise active contract unless another rule blocks the action.

## Audit Rules

- Every create, update, soft-delete, and restore on business entities must be auditable.
- Audit history is immutable.

## Data Formatting Rules

- Currency is displayed with Brazilian formatting.
- Dates are displayed in Brazilian format.
- CPF, CNPJ, OAB, phone, and percentage values follow domain-appropriate display rules.
- Currency example format: `R$ 1.234,56`
- Date example format: `25/12/2025`
- CPF example format: `123.456.789-01`
- CNPJ example format: `12.345.678/0001-95`
- OAB example format: `RS 123.456`
- Phone example format: `(11) 98765-4321`
- Percentage display uses whole-number visual formatting with `%`

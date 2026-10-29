# Business Rules

## Core Invariants

- Write forms enforce text length limits both in editable fields and server input schemas: names 255 characters, email 254, process number 100, notes 5,000, OAB 8, CPF/CNPJ up to 18 with mask, Brazilian phone up to 15 with mask, and attachment filenames 255. Masked documents and phones are normalized after length validation. These are application limits; PostgreSQL text columns remain unchanged. Existing records are not truncated.

- One installation serves one company. Clients, employees and lookups are global; operational records belong to one Firm. Evidence follows its owner. See [Multitenancy](MULTITENANCY.md). The verified active Organization selects the Firm with no default-unit fallback.
- Soft delete and active/inactive status are independent concerns.
- Lookup-backed selections use stable lookup `value` semantics, not environment-specific IDs.
- Financial calculations must preserve decimal precision.
- Auditability is mandatory for business mutations.

## Authentication Rules

- Clerk owns email or username sign-in, credential policy, recovery, account management, session lifetime and attack protection.
- OAB remains business data; it is not a login identifier.
- Clerk invitations/setup replace temporary passwords and app-owned forced password changes.
- A protected request requires a verified active Clerk session, completed provider tasks, current active Organization membership and a valid active Employee if privateMetadata.employeeId is explicitly set.
- Firm is the unit boundary selected by active Clerk Organization privateMetadata.firmId. Only memberships with valid mappings to existing Firms grant a unit context; absent or invalid mappings deny all protected data. Switching unit changes all firm-scoped reads and writes.
- Permission grants derive exclusively from current Clerk membership permissions, never local roles, UI visibility or client metadata.
- Provider verification errors deny protected execution. Membership removal denies access without waiting for webhooks.
- Accounts and Organization membership are administered in Clerk Dashboard. Employee CRUD never performs provider account administration.
- Session policy is configured in Clerk; the legacy custom remember-me duration and failed-attempt threshold no longer apply.
- Public login/recovery and verified webhook entrypoints do not require a product session. All business entrypoints do.
- Role presets and scope invariants are defined in ROLES_AND_PERMISSIONS.md.

## Client Rules

- A client is either an individual or a company.
- Individual clients use CPF semantics.
- Company clients use CNPJ semantics.
- Client type may be changed after creation.
- Editing client type requires the submitted document to match the selected type semantics.
- Inactive or deleted clients must not appear in contract creation options.
- Client document uniqueness is company-wide.
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
- Contract status locks require org:contracts:manage_status_lock.
- Process number is unique per firm.
- Contract visibility for non-admin users depends on an active assignment to that contract that grants visibility.
- Contract forms expose `isActive` as an `Ativo` checkbox.
- Contract status values are `ACTIVE`, `COMPLETED`, and `CANCELLED`.
- Editors with org:contracts:change_status may manually cancel a writable contract when status changes are not locked.
- Completed and cancelled contracts do not allow fee recording, revenue edits, or team changes.
- The allow-status-change setting requires org:contracts:manage_status_lock independently of general edit scope.
- A contract is considered writable only when it is active and not blocked by the status-lock semantics relevant to the attempted action.

## Assignment Rules

- Each contract assignment must use exactly one assignment type.
- The same employee must not be assigned to the same contract more than once while active.
- Assignment type must be compatible with employee type.
- Lawyers may hold responsible, recommending, or recommended assignments.
- Administrative assistants may hold only the admin-assistant assignment.
- Assignment changes are blocked when active remunerations would invalidate the applied formula.
- Recommending assignments grant remuneration participation but do not grant contract visibility by themselves to regular users.
- Responsible and recommended lawyer assignments grant contract visibility to regular lawyers.
- Admin-assistant assignments grant contract visibility to regular administrative assistants.

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

## Expense Rules

- Every expense belongs to exactly one Firm and references one global expense-category lookup.
- Expense category selection uses stable lookup values.
- Expense amount must be positive.
- Expense date is mandatory.
- Expense notes are optional.
- Expenses are firm-wide financial data and do not inherit contract-assignment visibility.
- Expense forms expose `isActive` as an `Ativo` checkbox.

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

- Attachments may belong to clients, employees, contracts, expenses, fees, or remunerations.
- Supported file types and size limits are part of the product contract.
- Upload and view permissions differ from delete permissions.
- Supported attachment types are `PDF`, `JPG`, and `PNG`.
- Maximum attachment size is `10 MB`.
- Exactly one attachment owner context is set per file: client, employee, contract, expense, fee, or remuneration.
- Financial attachments are supporting evidence (including PIX/payment proofs and calculation history), not automatic payment confirmation. Upload requires attachment upload and scoped financial read permission, independently from monetary editing. Completed/cancelled contracts still allow financial evidence uploads. Deleted financial owners or ancestors reject new uploads; existing evidence is retained through deletion and restoration.
- Attachment storage uses a persistent file-storage backend and retains file path or URL in the record.
- Attachment deletion permanently removes both the storage object and the attachment record.

## Deletion and Restore Rules

- Deletions are soft deletes.
- Administrators may restore soft-deleted business records.
- Deletion must be blocked when active dependents would violate business consistency.
- Cascading delete and restore behavior must preserve contract, fee, and remuneration consistency.
- Attachments are retained rather than cascaded away with parent entity deletion.
- Attachment deletion is a permanent removal exception and does not use soft delete.

## Deletion Protection Matrix

| Entity | Deletion Is Blocked When |
|---|---|
| Client | Has active contracts in any branch |
| Contract | Has active revenues |
| Revenue | Has active fees |
| Fee | Has active remunerations |
| Employee from contract | Has active remunerations on that contract |
| Employee business record | Has non-deleted contract assignments with non-deleted remunerations in any branch |

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
- CREATE audit events retain their full technical payload, event metadata, actor and entity identity. Creation summaries omit field changes; technical details remain available and stored history remains immutable. UPDATE, DELETE and RESTORE payloads retain their existing behavior.
- New audit observations (`description`) are persisted in pt-BR. Operational action and entity type codes, entity names, identifiers, actor snapshots and technical payloads retain their existing values. Historical records are not rewritten; existing localized reads remain supported.

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

## Dashboard Cash Balance

- Period and monthly result = received revenue minus recorded expenses. Generated remuneration is for checking only and must not be deducted again, because payroll is recorded as an expense.

Attachment upload selection accepts 1 to 10 files per batch, limited to the remaining owner capacity. Every file must satisfy the existing type, filename and 10 MB limits before sending. A single protected request saves all batch metadata and audit events in one transaction. If staging or persistence fails, all staged binaries are cleaned up and the complete selection remains available for retry; no partial metadata is committed.

Each attachment owner record (client, employee, contract, expense, fee or remuneration) accepts at most 10 non-deleted attachments, including inactive records. The server enforces count-and-create atomically per global client/employee owner, or per firm and operational owner; deletion frees capacity. Existing records above the limit remain readable, but cannot receive additional files.

## Company-wide clients and employees

See [Multitenancy](MULTITENANCY.md) for the authoritative entity-scope matrix, global lifecycle, evidence visibility and current-Firm enforcement.

- Receipt installment numbers must not exceed the revenue total. Creating or changing an installment number requires every preceding installment to have an active, non-deleted receipt; users cannot skip installments.

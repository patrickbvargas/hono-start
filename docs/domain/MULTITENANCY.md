# Multitenancy: one company, multiple branches

## Approved financial redesign — target precedence

Status: approved plan, not implemented. [Target financial contract](FINANCIAL_SYSTEM.md) and its linked roadmap/UML/authorization supersede conflicting financial and identity semantics below for the ordered redesign. Remaining text describes the preserved running baseline and unchanged house rules; do not infer target implementation from it.

Target Person, EmployeeProfile and catalogs are company-wide. Contracts, Expenses, titles, settlement batches, settlements, calculation evidence and reversal events remain Firm scoped. Person evidence stays owner-authorized across branches; operational proof stays local and own/assigned restricted. Person/profile Clerk binding replaces current employeeId at coordinated cutover.


## Installation boundary

This installation serves one company with multiple business units (`Firm`, unidade or filial). Firm isolates operational and financial data. Clients, collaborators and lookup options are shared across the company.

There is no Company/Organization ownership column on the shared master records. Creating another Firm does not create an isolated company directory. Unrelated companies requiring separate client or employee directories must not share this installation under the current model.

## Entity scope

| Entity | Scope | Meaning of firmId | Access rule |
|---|---|---|---|
| Firm | Business unit | Its own ID identifies the unit | Selected through verified active Clerk Organization metadata |
| Client | Company-wide | Absent | Same record in every branch, subject to client permissions |
| Employee | Company-wide | Absent | Same record and settings in every branch, subject to employee permissions |
| Lookup options | Global | Absent | Shared categorical values; existing action permissions still apply |
| Contract | Branch | Operational owner | Only the selected Firm, plus assignment and lifecycle rules |
| ContractEmployee | Branch | Same Firm as its contract | Links a global Employee to a local contract; never a branch membership |
| Revenue | Branch | Same Firm as its contract | Local payment plan; `Honorários` may describe this financial context in the UI |
| Fee | Branch | Same Firm as its revenue | Local received installment (`Recebimento`) |
| Remuneration | Branch | Same Firm as its fee and contract assignment | Local remuneration, plus all/own permission scope |
| Expense | Branch | Operational owner | Local expense; its category lookup remains global |
| Attachment | Follows its owner | Branch where upload originated | Global for Client/Employee owners; branch-scoped for operational owners |
| AuditLog | Follows the audited context | Branch where the event occurred | Shared master/evidence events plus current-Firm operational events |

Global means shared by branches of this company, not public or available without authentication. Every protected request still requires a valid Firm context and the current Organization's permissions.

## Shared registration and lifecycle

Client and Employee retain their original tables, fields and IDs. They have no firmId, extra profile tables or manual branch links. Creating or editing a master in Matriz changes the record that POA sees. There are no link actions or branch-membership notices in the frontend.

All employee business settings are global: name, OAB, type/function, remuneration percentage, referral percentage, active state and soft-delete state. Client contact data, type, active state and soft-delete state are global too. Documents and nonempty OAB numbers are unique company-wide. Names alone do not identify or merge employees in runtime business workflows.

Deletion protection examines blocking dependencies across all branches: active contracts for clients, and non-deleted assignments with non-deleted remunerations for employees. Deleting/restoring a master affects all branches. It does not delete another branch's operational history. Changes to employee settings do not imply an automatic rewrite of persisted remuneration: fee recalculation and manual-override rules remain in [Business rules](BUSINESS_RULES.md).

## Operational isolation

Lists, details, writes, exports, dashboard totals and pending work for operational entities use the authenticated current Firm. Referenced operational parents must have the same Firm. A global client or employee ID is valid in any branch's contract, but never grants access to that person's contracts, receipts or remuneration in other branches.

Counts and financial summaries inside Client/Employee screens include only the current Firm's operations. An empty total in POA can coexist with a nonzero total in Matriz for the same global client. Process-number uniqueness is per Firm; the same process number may exist in both branches as distinct contracts.

Record IDs identify rows; they do not authorize access. IDs are not globally unique across different entity tables. Attachment owner type plus ID identifies its context, and operational access still requires the parent Firm and subject permissions.

## Attachments and audit

Attachment has exactly one owner among Client, Employee, Contract, Expense, Fee and Remuneration. Its firmId records the upload branch and does not override owner visibility. Storage paths retain that origin; files are served only through the protected application endpoint.

For shared Client/Employee owners, list, upload, direct file access and deletion work from any authorized branch. Existing attachment action grants and owner-subject permissions remain required. The ten-file limit and concurrent-upload lock apply once per global owner, not ten times per branch. Operational attachments remain local to the parent's Firm, including own/assigned financial restrictions.

AuditLog.clientId and employeeId mark shared master events and their attachment events, including after an attachment is physically deleted. They identify the audited owner, not the acting employee: actorId remains separate. Audit lists, filters, counts, details and record history use the same visibility rule. Free-text conditions are ANDed with visibility; searching never expands access. Unrelated operational audit payloads remain local. Audit read permission remains mandatory and history remains append-only.

Each new audit event records the branch where that action happened. For example, a POA deletion of a Matriz-uploaded client attachment records the deletion event in POA while retaining the attachment's original upload provenance in its before payload.

## Clerk Organization and employee binding

The active Clerk Organization's server-fetched privateMetadata.firmId must be a positive integer identifying an existing Firm. Missing membership, invalid mapping or provider verification failure denies protected execution. There is no default Firm fallback. Matriz/POA names and IDs have no special runtime authority. Multiple Organizations may map to one Firm.

User privateMetadata.employeeId must identify one global active, non-deleted Employee for every role. The same employee ID and type remain bound when switching authorized Organizations. Membership permissions come from the newly selected Organization; a shared employee identity never transfers grants between memberships. Missing, invalid, inactive or deleted employee bindings deny all protected access. Business employee CRUD does not administer Clerk accounts or memberships.

On Organization change, the UI cancels queries, clears cached data and refreshes route/session context before showing the next unit. Each server request independently enforces its current verified scope.

## Example and reset walkthrough

1. Configure two Clerk Organizations with privateMetadata.firmId 1 (Matriz) and 2 (POA), and authorize the demonstration account in both.
2. Run `pnpm db:reset` only against the intended disposable development schema. This deletes its current data, applies migrations, generates Prisma Client and seeds once. It does not create Clerk accounts or change memberships.
3. Both units show the same 20 clients and 21 collaborators before their ordinary lifecycle filters. Matriz has the complete rolling operational dataset; POA has 17 contracts and 12 expenses, with its own receipts, remunerations, attachments and history.
4. Switch units: shared registration and master evidence remain available, while operational lists and totals change. A direct request for another unit's operational record remains denied.
5. Rerunning seed at the same reference date preserves fixture IDs and avoids duplicate evidence/audit. Existing stored files from earlier resets are not automatically deleted.

See [Demo data](../implementation/DEMO_DATA.md) for rolling dates, fixture details and storage setup. Existing databases migrating through the former profile model may require reconciliation of duplicate memberships or orphan profiles. Reset starts empty and therefore does not create the historical audit copies from that intermediate model.

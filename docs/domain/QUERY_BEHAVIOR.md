# Query Behavior

This file defines the canonical domain-facing behavior of filtering, sorting, list state, and derived list semantics.

## List-State Principles

- Lists support server-side filtering.
- Lists support server-side sorting.
- Lists support pagination.
- Sorting, filtering, and pagination state belong in the URL.
- List behavior must remain shareable and bookmarkable.
- Paginated list behavior must be deterministic for the same validated search state.
- When a route defines defaults for page, page size, sort column, or sort direction, those defaults are part of the contract for that route.

## Filter Conventions

- `status` and `active` are independent filters.
- `status=active` means non-deleted records regardless of `isActive`.
- `active=true` means active records regardless of deleted-state filter.
- Business-entity option queries use both `deletedAt: null` and `isActive: true`.
- Lookup option queries return all rows and disable inactive values in the UI.
- Lookup-backed filter values use stable lookup `value` strings.

## Filter Contracts

### Employee

| Filter key | Meaning | Type / Default |
|---|---|---|
| `type` | employee type | lookup value |
| `status` | soft-delete status | `active`, `deleted`, or `all`; default `active` |
| `active` | active flag | `true`, `false`, or `all`; default `all` |

### Client

| Filter key | Meaning | Type / Default |
|---|---|---|
| `query` | name or document search | text |
| `type` | client type | lookup value |
| `status` | soft-delete status | `active`, `deleted`, or `all`; default `active` |
| `active` | active flag | `true`, `false`, or `all`; default `all` |

### Contract

| Filter key | Meaning | Type / Default |
|---|---|---|
| `query` | process number or client name search | text |
| `clientId` | client filter | entity id |
| `legalArea` | legal area filter | lookup value |
| `contractStatus` | contract status filter | lookup value |
| `status` | soft-delete status | `active`, `deleted`, or `all`; default `active` |
| `active` | active flag | `true`, `false`, or `all`; default `all` |

### Fee

| Filter key | Meaning | Type / Default |
|---|---|---|
| `query` | parent contract process-number search | text |
| `contractId` | parent contract | entity id |
| `revenueId` | parent revenue | entity id |
| `revenueType` | fee list honorarium type | revenue type lookup value |
| `dateFrom` | lower payment-date bound | date |
| `dateTo` | upper payment-date bound | date |

### Expense

| Filter key | Meaning | Type / Default |
|---|---|---|
| `query` | observation search | text |
| `category` | expense category | lookup value |
| `dateFrom` | lower expense-date bound | date |
| `dateTo` | upper expense-date bound | date |
| `status` | soft-delete status | `active`, `deleted`, or `all`; default `active` |
| `active` | active flag | `true`, `false`, or `all`; default `all` |

### Remuneration

| Filter key | Meaning | Type / Default |
|---|---|---|
| `query` | parent contract process-number or employee-name search | text |
| `employeeId` | employee filter | entity id |
| `feeId` | exact source receipt for remunerations | optional positive integer; invalid input ignored |
| `contractId` | contract filter | entity id |
| `dateFrom` | lower payment-date bound | date |
| `dateTo` | upper payment-date bound | date |

### Audit Log

| Filter key | Meaning | Type / Default |
|---|---|---|
| `query` | actor-name or entity-name search | text |
| `actorName` | actor names | string array |
| `action` | audit action | `CREATE`, `UPDATE`, `DELETE`, `RESTORE` |
| `entityType` | entity kind | entity type string |

## Sort Contracts

Unless a more specific implementation rule overrides it, sorted paginated queries must append a stable tiebreaker so repeated requests do not reorder equivalent rows unpredictably.

### Employee

Default sort: `fullName` ascending

Sortable columns:

- `fullName`
- `id`
- `isActive`
- `oabNumber`
- `remunerationPercent`
- `type`

Employee is business data only; account email and role belong to Clerk and are not employee sort/filter fields.

### Client

Default sort: `fullName` ascending

Sortable columns:

- `fullName`
- `document`
- `type`
- `id`
- `isActive`

### Contract

Default sort: `createdAt` descending

Sortable columns:

- `processNumber`
- `client`
- `legalArea`
- `status`
- `feePercentage`
- `createdAt`

### Record drilldown

- Drilldown uses the existing shared DataTable frontend pagination by supplying pageSize (default 10). The source query returns all authorized records for the selected context on demand. Changing table pages makes no additional request and never rewrites source-page URL, filters, pagination or sort.
- Sources own stable query keys and authorized server operations. Detail query identity includes normalized context and filters; dashboard queries additionally include the selected series/group/month and reference timestamp.
- Dashboard details use ascending contribution date followed by stable row identity. Rows, count and all-page totals are computed from one repeatable read. The server returns the complete selected record set after scoped computation; the shared table owns display pagination. Records outside the selected context are not returned.
- Subject data is read only after its grant check. All queries keep the verified firm and own/assigned scope. Detail queries inherit global freshness and normal source-feature invalidation.
- Remuneration table details select a positive collaborator ID and valid visible month. They require remuneration read access independently of revenue access. The collaborator predicate is intersected with the existing server scope; own access cannot select another collaborator, and an active admin collaborator filter cannot be overridden. The selected month intersects the active period. Dashboard display defaults to descending date using local sorting, without changing the stable server contribution order.
- An omitted collaborator month selects the displayed dashboard month range intersected with the period, including the default six-month range when bounds are absent. Monthly receipt-type selections filter by stable type value. Monthly output selections require consolidated financial access and return positive expense contributions without receipt rows. Invalid combinations of receipt type and non-receipt series are rejected.

### Revenue

Default sort: `createdAt` descending

Sortable columns:

- `type`
- `totalValue`
- `paymentStartDate`
- `totalInstallments`
- `createdAt`

### Fee

Default sort: `paymentDate` descending

Sortable columns:

- `paymentDate`
- `amount`
- `installmentNumber`
- `createdAt`

### Expense

Default sort: `expenseDate` descending

Sortable columns:

- `expenseDate`
- `amount`
- `category`
- `createdAt`

### Remuneration

Default sort: `paymentDate` descending

Sortable columns:

- `paymentDate`
- `amount`
- `effectivePercentage`
- `employeeName`
- `createdAt`

### Audit Log

Current code uses `id` descending as the audit search schema fallback. The data layer maps unknown sort columns to `createdAt` descending. URL stripping/reset defaults separately use `occurredAt` ascending. This existing difference is preserved; changing it requires an explicit behavior decision.

Sortable columns:

- `occurredAt`
- `actorName`
- `action`
- `entityType`
- `entityName`

Pending work pagination, filtering and summary counts execute in one parameterized server query. Defaults are page 1, limit 25, no filters; page size is capped at 100. Filters reset page while preserving page size; default severity rank (high, medium, low), earliest due date (null last), contract ID and issue ID provide deterministic order; validated column/direction parameters support global server sorting by severity, title, contract, client and due date before pagination. Calendar reference is the server's America/Sao_Paulo day, not a client-authoritative date. Payment plans use down payment, per-installment recorded active amounts, two-decimal rounding and final installment remainder. No dashboard period filter truncates this operational collection.

Severity and type filters accept multiple selected values: OR within one field, AND between fields. Empty arrays mean unrestricted values within the authorized scope. Each selected value has its own removable chip; legacy single-value URLs normalize to arrays.

Pending return context is an optional object validated by the owning pending-work search schema. Page, limit, filters and visible sort dimensions are retained across workspace tabs/reloads; no free-form return URL is accepted. Card filtering clears/replaces only severity and resets page. Days overdue are computed on the server from the earliest outstanding schedule date against the America/Sao_Paulo calendar day. Saldo a receber is total remaining balance and includes future installments; no separate overdue-balance column is displayed.

Remuneration receipt scope applies to rows, counts, monetary totals and exports, intersected with firm and own/all visibility. The Recebimento chip exposes this scope and can remove it; clearing all filters explicitly clears feeId. Page changes and financial-period shortcuts preserve it. Receipt collection links use non-deleted records with all active states, matching the linked remuneration count.

Receipt searches accept an optional positive clientId, combined with all existing filters and permission scopes. The active client filter is visible as a removable chip and clear-all removes it.

Client contract-count navigation includes all active/inactive and deleted/non-deleted contracts so the destination matches the unfiltered related count, as employee contract-count navigation already does. Existing assignment visibility still applies.

Dashboard Cliente and Contrato filters intersect with the existing firm, assignment/ownership, period and dimension scopes for revenues, receipts, remunerations and their drilldowns. Both selections combine with AND; conflicting selections return no matching records. Standalone expenses remain firm-wide and the consolidated firm result is hidden when either selection is active.

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
| `role` | user role | lookup value |
| `status` | soft-delete status | `active`, `inactive`, or `all`; default `active` |
| `active` | active flag | `true`, `false`, or `all`; default `all` |

### Client

| Filter key | Meaning | Type / Default |
|---|---|---|
| `search` | name or document search | text |
| `type` | client type | lookup value |
| `status` | soft-delete status | `active`, `inactive`, or `all`; default `active` |
| `active` | active flag | `true`, `false`, or `all`; default `all` |

### Contract

| Filter key | Meaning | Type / Default |
|---|---|---|
| `query` | process number or client name search | text |
| `clientId` | client filter | entity id |
| `legalArea` | legal area filter | lookup value |
| `contractStatus` | contract status filter | lookup value |
| `status` | soft-delete status | `active`, `inactive`, or `all`; default `active` |
| `active` | active flag | `true`, `false`, or `all`; default `all` |

### Fee

| Filter key | Meaning | Type / Default |
|---|---|---|
| `query` | parent contract process-number search | text |
| `contractId` | parent contract | entity id |
| `revenueId` | parent revenue | entity id |
| `dateFrom` | lower payment-date bound | date |
| `dateTo` | upper payment-date bound | date |

### Remuneration

| Filter key | Meaning | Type / Default |
|---|---|---|
| `query` | parent contract process-number or employee-name search | text |
| `employeeId` | employee filter | entity id |
| `contractId` | contract filter | entity id |
| `dateFrom` | lower payment-date bound | date |
| `dateTo` | upper payment-date bound | date |

### Audit Log

| Filter key | Meaning | Type / Default |
|---|---|---|
| `query` | actor-name or entity-name search | text |
| `userId` | acting user | entity id |
| `action` | audit action | `CREATE`, `UPDATE`, `DELETE`, `RESTORE` |
| `entityType` | entity kind | entity type string |
| `dateFrom` | lower created-at bound | date |
| `dateTo` | upper created-at bound | date |

## Sort Contracts

Unless a more specific implementation rule overrides it, sorted paginated queries must append a stable tiebreaker so repeated requests do not reorder equivalent rows unpredictably.

### Employee

Default sort: `fullName` ascending

Sortable columns:

- `fullName`
- `email`
- `type`
- `role`
- `createdAt`

### Client

Default sort: `fullName` ascending

Sortable columns:

- `fullName`
- `document`
- `type`
- `createdAt`

### Contract

Default sort: `createdAt` descending

Sortable columns:

- `processNumber`
- `client`
- `legalArea`
- `status`
- `feePercentage`
- `createdAt`

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

### Remuneration

Default sort: `paymentDate` descending

Sortable columns:

- `paymentDate`
- `amount`
- `percentage`
- `employee`
- `createdAt`

### Audit Log

Default sort: `createdAt` descending

Sortable columns:

- `createdAt`
- `user`
- `entityType`
- `action`

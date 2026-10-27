## Context

One company, multiple Firms. The user explicitly chose completely shared clients/employees, including employee function, percentages and lifecycle, and requested the original schema and ordinary screens.

## Decisions

1. Client and Employee keep their original fields and IDs, without firmId or extra profile/membership entities. CPF/CNPJ and nonnull OAB uniqueness are global.
2. Master reads and selectors have no Firm filter. Contract counts and finance inside those screens retain explicit operation Firm filters.
3. Clerk employeeId remains an active global identity. Grants continue to come from current Organization membership; global identity does not grant operational access across Firms.
4. Attachment firmId records upload origin; shared owner visibility replaces origin filtering for client/employee evidence. Operational owner checks remain Firm scoped. Capacity locking/counting is global for shared owners.
5. Audit firmId records event origin. Nullable master-owner FKs mark globally visible master and evidence events and survive physical attachment deletion. Search, pagination count, options, detail and history share the same visibility boundary.
6. Keep frontend on its existing forms/tables. Remove all new directory/link UI and notices.
7. Flatten the previously introduced profiles in a subsequent transaction migration. Backfill fields and owner references before dropping columns/tables. Preserve master, operation and storage IDs. Reject duplicate memberships or orphan profiles before writes; explicit reconciliation prevents selecting arbitrary percentages or breaking Clerk anchors.

## Migration

Generated schema diff augmented with data backfill and preflight, rehearsed on disposable PostgreSQL. No reset or migration against the configured database during implementation.

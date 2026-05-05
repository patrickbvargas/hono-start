## 1. Dashboard summary contract

- [x] 1.1 Extend the dashboard read model with a monthly remuneration table structure grouped by collaborator and month.
- [x] 1.2 Keep month buckets deterministic for the selected period, including zero-value months when applicable.
- [x] 1.3 Preserve administrator and regular-user visibility rules in the new remuneration aggregation.

## 2. Dashboard data mapping

- [x] 2.1 Extend dashboard data queries to aggregate remuneration totals by collaborator and calendar month.
- [x] 2.2 Reuse current dashboard filter semantics so the remuneration table follows the selected period and employee scope consistently.
- [x] 2.3 Ensure the new table payload remains firm-scoped and uses stable ordering for rows and month columns.

## 3. Dashboard UI

- [x] 3.1 Remove the recent activity card from the dashboard layout.
- [x] 3.2 Render a `DataTable`-based remuneration matrix in its place, with collaborator rows, month columns, and period total.
- [x] 3.3 Wrap the new remuneration table in the shared shadcn/ui `Card` component and preserve `Card` as the canonical outer wrapper for dashboard cards, charts, and tables.
- [x] 3.4 Provide an explicit empty state in pt-BR when no remuneration matches the active filters.

## 4. Verification

- [x] 4.1 Add focused tests for monthly remuneration aggregation and scope behavior.
- [x] 4.2 Add focused UI coverage for replacing recent activity with the remuneration table.
- [x] 4.3 Add focused UI coverage for the shared `Card` wrapper contract on dashboard analytical surfaces touched by this change.
- [x] 4.4 Run `pnpm check`.
- [x] 4.5 Run `npx tsc --noEmit`.

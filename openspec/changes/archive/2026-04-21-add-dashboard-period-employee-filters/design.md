## Context

Dashboard currently loads on `/` with no route search state and calls `getDashboardSummaryQueryOptions()` without input. The server function derives firm scope, admin status, and regular-user employee scope from the authenticated session, then `src/features/dashboard/data/queries.ts` aggregates revenues, fees, remunerations, counts, and recent activity.

The domain contract already requires role-scoped dashboard data. This change adds filter controls without changing Matrix OS permissions: session scope remains authoritative, administrators can narrow firm-wide dashboard data by employee, and regular users cannot use client-submitted search params to view another employee's data.

## Goals / Non-Goals

**Goals:**

- Add URL-driven dashboard filters for `dateFrom`, `dateTo`, and `employeeId`.
- Keep dashboard prefetching, cache keys, server validation, and data reads aligned with existing feature-slice patterns.
- Apply period filtering to date-sensitive dashboard data and employee filtering to assignment/remuneration-sensitive dashboard data.
- Preserve tenant isolation and role-scoped visibility at the server boundary.
- Keep UI copy in pt-BR and consume HeroUI only through shared re-exports.

**Non-Goals:**

- No permission-model change.
- No Prisma schema or migration change.
- No new metrics, export workflow, or reporting route.
- No direct dependency on another feature's internals from the dashboard slice.

## Decisions

### Decision: Add Dashboard Search Schema

Create a dashboard-owned search/filter schema with `dateFrom`, `dateTo`, and `employeeId`, using safe URL defaults and database-free validation.

Rationale: route search state is canonical for filters, and the dashboard slice needs an explicit query contract before the route can prefetch filtered data.

Alternative considered: keep filter state local in React. Rejected because the project contract requires URL-driven filtering for shareable list/filter behavior.

### Decision: Pass Search Input Through Query Options

Change `getDashboardSummaryQueryOptions(search)` so the query key includes validated search state and the server function receives the same validated input.

Rationale: cache entries must differ by filter state, and loader/render query calls must use the same input.

Alternative considered: keep a static cache key and refetch manually. Rejected because it risks stale summaries when filters change.

### Decision: Server Scope Wins Over Employee Filter

For administrators, `employeeId` narrows dashboard data to one active, non-deleted employee in the same firm. For regular users, server data scope remains the current employee regardless of a submitted `employeeId`.

Rationale: the permission matrix allows administrator firm-wide visibility and regular-user scoped dashboard visibility only. Client search params are not trusted authority claims.

Alternative considered: reject any non-admin request containing `employeeId`. Rejected because ignoring the unauthorized filter preserves route resilience while still preventing data expansion.

### Decision: Period Filter Applies To Date-Sensitive Data

Apply `dateFrom` and `dateTo` to fee payment dates, remuneration payment dates, and recent fee/remuneration activity. Revenue grouping uses received amounts from fees inside the selected period plus down payments only when the revenue payment start date is inside the selected period. Contract and client counts remain scoped counts unless requirements later define date-specific count semantics.

Rationale: fees and remunerations have explicit payment dates, while planned revenue totals and active contract/client counts describe current scope. This avoids misleading count changes without a canonical created-at period rule.

Alternative considered: filter every model by `createdAt`/`updatedAt`. Rejected because it would mix operational activity timestamps with financial period semantics.

### Decision: Dashboard Owns Its Filter UI

Add `DashboardFilter` and `useDashboardFilter` inside the dashboard feature. Reuse shared filter/form primitives and public route-facing option APIs only.

Rationale: dashboard owns the UI contract. The route should compose the filter in `Wrapper.Header` and the summary in `Wrapper.Body`.

Alternative considered: reuse remuneration filter components. Rejected because dashboard has different semantics and must not import another feature's internal components.

## Risks / Trade-offs

- Period semantics can be misread for planned revenue totals -> Mitigation: keep descriptions in pt-BR clear and test date-sensitive totals separately.
- Employee filter option loading may duplicate existing employee option logic -> Mitigation: prefer a small route-facing option query from an existing public API or a dashboard-local query that returns only active employees in the firm.
- Hidden non-admin `employeeId` params could confuse debugging -> Mitigation: document and test that server session scope wins for regular users.
- Filtering all dashboard sections may increase query complexity -> Mitigation: keep helper functions for date where clauses and employee scope composition inside dashboard data/query modules.

## Migration Plan

No database migration is needed.

1. Add dashboard search/filter schema and query input plumbing.
2. Add filtered dashboard UI and wire route search validation/prefetching.
3. Update dashboard data queries to apply period and employee scope.
4. Add focused tests for admin employee filtering, regular-user scope, date filtering, and cache/search behavior.
5. Run `pnpm check` and `npx tsc --noEmit`.

Rollback: remove the new dashboard route search wiring, filter component, query input, and delta behavior. Since no schema change exists, rollback is code-only.

## Open Questions

- None.

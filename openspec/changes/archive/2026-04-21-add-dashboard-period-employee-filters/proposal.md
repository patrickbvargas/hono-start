## Why

Dashboard summaries need sharper operational context than the current default view. Period and employee filters let administrators review firm-wide performance slices and let regular users inspect only the dashboard data allowed by the permission matrix.

## What Changes

- Add dashboard search state for a period filter using `dateFrom` and `dateTo`.
- Add an employee filter for dashboard summaries.
- Apply filters consistently to revenue totals, remuneration totals, monthly comparison data, recent activity, legal-area grouping, and revenue-type grouping when those datasets are date-sensitive or employee-sensitive.
- Keep dashboard visibility aligned with Matrix OS permissions: administrators can filter firm-wide data by any active employee in the firm; regular users cannot expand beyond their scoped dashboard visibility.
- Preserve pt-BR labels, URL-driven filter state, tenant isolation, and server-side validation.

## Non-goals

- Do not change the role model or permission matrix.
- Do not add new dashboard metrics unrelated to the period or employee filters.
- Do not change remuneration, fee, revenue, or contract business calculations outside the filtered dashboard read model.
- Do not introduce a new reporting/export workflow.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dashboard`: dashboard summary requirements now include URL-driven period and employee filters that preserve firm isolation and role-scoped visibility.

## Impact

- Affects `openspec/specs/dashboard/spec.md` through a delta spec.
- Affects dashboard route search validation, query prefetching, cache keys, read schemas, server query options, Prisma-backed dashboard aggregation, and dashboard filter UI.
- May reuse employee option loading patterns while keeping dashboard feature ownership and public imports aligned with existing feature boundaries.
- No new dependencies expected.

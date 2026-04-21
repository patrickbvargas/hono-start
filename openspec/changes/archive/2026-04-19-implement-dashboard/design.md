## Context

The home route currently renders `DemoForm` and fake pagination. Domain docs define `/` as the authenticated dashboard, with firm-wide visibility for administrators and scoped visibility for regular users. Existing entity slices already expose Prisma-backed data, session scope utilities, React Query route loaders, and shared wrapper UI.

## Goals / Non-Goals

**Goals:**

- Add a dashboard feature slice that follows the repository shape.
- Load dashboard data through a server function and route loader.
- Respect tenant isolation and role-scoped visibility.
- Render pt-BR operational and financial summaries on `/`.

**Non-Goals:**

- No new charting package.
- No schema migration.
- No broader audit-log surface.

## Decisions

- Create `src/features/dashboard` with `api`, `data`, `schemas`, `components`, and `constants` because dashboard owns business-specific read modeling and UI.
- Use one dashboard query instead of composing many route-level entity queries because route files must remain thin and dashboard metrics need a coherent server-side scope.
- Use CSS-based bar charts instead of a chart dependency because current requirements can be met with accessible summary visuals and no new package risk.
- Add a shared `Card` re-export if needed so HeroUI remains consumed through shared UI boundaries.
- Use TanStack Router loader `ensureQueryData` and component `useSuspenseQuery`, matching existing list routes and TanStack guidance.

## Risks / Trade-offs

- Dashboard activity approximates recent events from supported entity timestamps until full audit logs exist. Mitigation: label as recent activity and keep behavior scoped to supported entities.
- Financial totals convert Prisma decimals to numbers for display. Mitigation: use current repository formatting conventions and avoid changing financial persistence rules.
- CSS charts are less interactive than a charting library. Mitigation: keep chart data visible as labels and values.

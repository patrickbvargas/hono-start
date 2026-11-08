# Tasks: Separate Operational Overview and Financial Overview

## 1. Permissions and Clerk Alignment

- [x] 1.1 Update `clerkPermissionCatalog` in `src/shared/session/schema.ts` adding `operational_overview` and `financial_overview`, reserving `dashboard`.
- [x] 1.2 Update `src/shared/session/member-policy.ts` to reject `org:financial_overview:*` and allow `org:operational_overview:read_own`.
- [x] 1.3 Update `scripts/clerk-sync-roles.ts` and sync with Clerk API live.

## 2. Navigation and Routing Structure

- [x] 2.1 Update `src/shared/config/routes.ts` with `operationalOverview` (`/visao-operacional`) and `financialOverview` (`/visao-financeira`).
- [x] 2.2 Update `src/features/app-sidebar/components/index.tsx` placing `Visão operacional` in `Operacional` and `Visão financeira` in `Financeiro`.
- [x] 2.3 Create `src/routes/_app/visao-operacional.tsx` and update `src/routes/_app/index.tsx` to redirect to `/visao-operacional`.

## 3. Financial Overview Feature Slice (`features/financial-overview`)

- [x] 3.1 Create schemas, projection logic, and query layer for financial overview (actuals vs future open titles with reduced opacity).
- [x] 3.2 Implement `FinancialOverviewChart` with past solid bars vs future projected bars (with fillOpacity ~0.35).
- [x] 3.3 Implement `FinancialOverviewMetricCards`, `FinancialOverviewTable` (monthly breakdown), and breakdown charts.
- [x] 3.4 Create `src/routes/_app/visao-financeira.tsx` wiring up queries, filters, charts, and tables.

## 4. Operational Dashboard Refactor (`features/dashboard`)

- [x] 4.1 Remove corporate expense breakdowns, firm cash flow tables, and net bank balance metrics from `features/dashboard/`.
- [x] 4.2 Streamline `useDashboardData`, `summary.ts`, and `Dashboard` component to focus purely on contracts, fee receipts/planned, and lawyer remunerations.

## 5. Verification and Testing

- [x] 5.1 Run unit and integration tests (`pnpm test` / `vitest`).
- [x] 5.2 Run type-check (`npx tsc --noEmit`) and lint/format (`pnpm check`).

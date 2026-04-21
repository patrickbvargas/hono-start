## 1. Filter Contract

- [x] 1.1 Add dashboard filter/search schemas for `dateFrom`, `dateTo`, and `employeeId` with safe URL defaults and date-range validation.
- [x] 1.2 Update dashboard cache keys and query option factory to accept validated search input.
- [x] 1.3 Update dashboard server function input validation so filtered requests are validated before data access.

## 2. Authorization And Data Queries

- [x] 2.1 Add dashboard data-query helpers for period bounds, employee scope, and regular-user session scope.
- [x] 2.2 Apply period filtering to fee and remuneration payment-date aggregations and recent financial activity.
- [x] 2.3 Apply administrator employee filtering to assignment/remuneration-sensitive dashboard data while preserving firm scope.
- [x] 2.4 Ensure regular-user dashboard data ignores unauthorized `employeeId` expansion and remains scoped to the authenticated employee.
- [x] 2.5 Confirm no database migration is required.

## 3. Dashboard UI And Route Wiring

- [x] 3.1 Add `useDashboardFilter` using shared filter and app-form patterns.
- [x] 3.2 Add `DashboardFilter` with pt-BR date controls and administrator-only employee selection.
- [x] 3.3 Wire `/` route search validation, loader prefetch, render query, and `Wrapper.Header` filter composition.
- [x] 3.4 Keep HeroUI usage through shared UI/form re-exports only.

## 4. Verification

- [x] 4.1 Add or update focused tests for admin period filtering, admin employee filtering, regular-user scope, and URL search behavior.
- [x] 4.2 Run `pnpm check` and fix all reported issues.
- [x] 4.3 Run `npx tsc --noEmit` and fix all reported issues.

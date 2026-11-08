# Proposal: Separate Operational Overview and Financial Overview

## Why

Currently, the single overview route (`/_app/index.tsx`) mixes operational contract metrics (contracts, lawyer remunerations, fee revenues) with financial treasury metrics (expenses, total firm payments, net cash result, cash flow table). This creates architectural coupling, leaks corporate financial concerns into operational workflows, and makes role-based access control complex between Admin and Member roles.

Separating them into two dedicated routes provides clean bounded contexts, isolates corporate treasury secrets to Admins, and creates a clear operational dashboard for contract performance, while reserving `/` for a future unified executive overview.

## What Changes

- **New Route `/visao-financeira`**: Dedicated Financial Overview route scoped to corporate treasury and titles (receivables and payables), past actuals vs. future projections with reduced opacity.
- **New Feature Slice `features/financial-overview`**: Encapsulates cash flow models, queries, filters, metric cards, past vs future projection engine, and monthly cash breakdown table.
- **New Route `/visao-operacional`**: Dedicated Operational Overview route focused purely on contracts, fee receipts/planned, lawyer remunerations, and contract overdue installments. No generic corporate expenses, net cash flow results, or firm-wide treasury statements.
- **Reserve `/` Route**: Keep `/_app/index.tsx` as a redirect to `/visao-operacional` while reserving the root URL for future executive overview.
- **Update Navigation & Sidebar**:
  - `Operacional > Visão operacional` (`/visao-operacional`)
  - `Financeiro > Visão financeira` (`/visao-financeira`)
- **Decouple Session Permissions**:
  - Add `operational_overview: ["read_all", "read_own"]`
  - Add `financial_overview: ["read_all", "read_scoped"]`
  - Keep `dashboard: ["read_all", "read_own"]` reserved for future `/` executive dashboard.
  - Enforce `org:financial_overview:read_all` (with fallback `org:cash_flow:read_all`, `org:payables:read_all`) for Financial Overview.
  - Enforce `["org:operational_overview:read_all", "org:operational_overview:read_own"]` for Operational Overview.
  - Sync permissions via Clerk API.

## Capabilities

### New Capabilities
- `financial-overview`: Financial overview dashboard displaying realized receipts/payments and future projected titles with reduced visual opacity, cash balance metrics, and monthly treasury breakdown.

### Modified Capabilities
- `dashboard`: Refocus operational dashboard strictly to contract performance, fee revenues, and remuneration management, removing firm cash flow and generic expenses.
- `sidebar-nav`: Update navigation structure to separate Operational Overview and Financial Overview across their respective sidebar sections.

## Impact

- Routes: `src/routes/_app/index.tsx`, `src/routes/_app/visao-operacional.tsx` (new), `src/routes/_app/visao-financeira.tsx` (new).
- Features: `src/features/dashboard/` (operational contracts), `src/features/financial-overview/` (new slice), `src/features/app-sidebar/` (updated menu).
- Session & Permissions: `src/shared/session/schema.ts`, `src/shared/session/member-policy.ts`, `src/shared/config/routes.ts`, `scripts/clerk-setup.ts`.

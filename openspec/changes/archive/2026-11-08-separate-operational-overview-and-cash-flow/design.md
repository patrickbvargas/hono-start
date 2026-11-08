# Design: Separate Operational Overview and Financial Overview

## Context

The current `/_app/index.tsx` route combines operational contract analytics with firm-wide financial treasury analytics.

We are separating this into:
1. `Operacional > Visão Operacional` (`/visao-operacional`): Contract volumes, fee revenues (planned & received), lawyer remuneration totals & breakdowns, overdue contract installments.
2. `Financeiro > Visão Financeira` (`/visao-financeira`): Corporate treasury, all receivables and payables, net cash balance, monthly cash flow table, aging/forecast charts. Crucially, future projected amounts are rendered with reduced visual opacity (`opacity: 0.35 - 0.45`).
3. Root route `/_app/index.tsx`: Temporarily redirects to `/visao-operacional` and stays reserved for future high-level executive dashboarding.

## Goals / Non-Goals

**Goals:**
- Create `src/features/financial-overview/` feature slice adhering to ARCHITECTURE.md.
- Refactor `src/features/dashboard/` to contain only operational/contract metrics.
- Implement `/visao-financeira` with past realized entries/outputs (100% opacity) and future open/projected entries/outputs (reduced opacity).
- Update sidebar navigation to reflect the separation under Operacional and Financeiro.
- Decouple permissions: `org:operational_overview:*` and `org:financial_overview:*`, reserving `org:dashboard:*` for future `/`.

**Non-Goals:**
- Altering the transactional settlement engine or bridge handoff mechanics.

## Decisions

### 1. Route Paths and URLs
- `/visao-operacional`: Operational Overview under `Operacional` sidebar group.
- `/visao-financeira`: Financial Overview under `Financeiro` sidebar group.
- `/`: Redirects directly to `/visao-operacional`.

### 2. Permissions Architecture
- `org:operational_overview:read_all` (Admin) / `org:operational_overview:read_own` (Member).
- `org:financial_overview:read_all` (Admin).
- `org:dashboard:read_all` / `org:dashboard:read_own` reserved for future `/`.

### 3. Visual Treatment of Future Projections
- Temporal dividing line: Current date `now()`.
- Past entries / payments: Realized cash events (Receipts/Payments), rendered with solid colors (100% opacity).
- Future open amounts: Receivables/Payables with dueDate $\ge$ now and outstanding balance > 0, rendered with fillOpacity 0.4.

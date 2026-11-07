## Context

The financial-titles slice already owns atomic expense generation, validation, audit and row locking. The expenses workspace has no financial read model and renders a placeholder. Contract revenues use a feature-owned TanStack Form with automatic schedule preview.

## Goals / Non-Goals

**Goals:** Reuse installment planning UI and orchestration; expose generated expense titles and correct balances; retain explicit permissions and Firm isolation.

**Non-Goals:** New settlement operations, regeneration, schema migration or dependencies.

## Decisions

- Extend financial-titles with a shared generation form and hook accepting an explicit revenue/expense source. Preserve the RevenueGenerationForm and useRevenueTitleForm adapters. This avoids duplicated form markup and arithmetic while keeping current consumers compatible.
- Parameterize generation option requests and keys by direction, validating direction on the server and checking the matching generation permission. Catalog contents remain shared.
- Add a protected expense financial query and Zod read model, separate from operational detail. Require both expense and payable read permissions; Members cannot obtain expense data. This avoids leaking financial data through operational-only reads.
- Map actual ExpensePayable titles in due-date/id order. Include entry and extra titles; expose cancelled state. Sum principalAbated from unreversed payments using Prisma.Decimal for remaining debt, and separately show effective cash paid.
- Keep workspace generation orchestration in an expense hook, using the existing overlay and refreshing expense/audit queries after success. Existing server generation remains the authority for duplicates and balance closure.
- Share a financial status badge from financial-titles across revenue and expense card headers. The three aggregate labels are Quitado, Pendente and Em atraso; pending includes non-overdue partial payments. Require title read authority and use the São Paulo calendar date. Contract read models calculate debt from unreversed principal and consider entry due dates.

## Risks / Trade-offs

- [Shared form regression] → Keep revenue adapter and run existing automatic-preview and closure tests alongside expense submission tests.
- [Cash differs from principal] → Test discounts, interest and reversals; never subtract effective cash from face value.
- [Expense edited after generation] → Display persisted title amounts and balances rather than reconstructing the schedule from expense amount. Generation remains single-use; operational edits do not rewrite debts.
- [No live authenticated browser session] → Validate focused components, query authorization, calculations and types; document any remaining live verification limitation.

## Migration Plan

No persistence migration. Deploy application changes together; rollback application code without changing existing titles or bridges.

## Open Questions

None.

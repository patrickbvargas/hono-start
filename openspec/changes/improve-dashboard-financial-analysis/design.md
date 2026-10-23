## Context
Preserve feature-owned data mapping, Zod boundaries and shared UI.
## Goals / Non-Goals
Consistent operational analytics; no bank balances or settlement claims.
## Decisions
Use Decimal schedule amounts with final-installment remainder. Compare identical periods including down payments. Negative prior bases use absolute denominator; zero bases display no comparison. Hide firm result and expenses under dimension filters, rather than invent allocation. Aging includes all outstanding debts as of reference day; future buckets use the same day. Preserve existing role visibility.
## Risks / Trade-offs
Generated remuneration is not proof of settlement; label explicitly. Schedules are contractual expectations, not guaranteed receipts.

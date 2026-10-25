## Context

Contract workspace alerts already derive issues from payment plans and assignments. The new queue is a read-only feature, following the clients slice structure and shared filters, table, pagination, links and wrappers.

## Goals / Non-Goals

Goals: discover actionable issues across authorized contracts, deterministic server-side filtering/pagination, automatic resolution, matching workspace semantics.
Non-goals: persisted tasks, dismissals, notifications, optional-field completeness, payment settlement ledger.

## Decisions

- Create `pending-work` with schemas, data, API, hooks and folder/index.tsx components; thin `/pendencias` route.
- Use one parameterized Prisma SQL statement with scoped CTEs, schedule derivation, union of issue kinds, filtered counts and a paginated JSON read model. This avoids loading all contract details or N+1 queries and keeps rows/counts in one database snapshot. Prisma findMany alone cannot paginate the union of derived financial and missing-relation issues.
- One high-severity row per overdue revenue, with its earliest unpaid due date; medium rows for upcoming unpaid installments through seven days and low rows for settled active contracts needing status review. Exclude deleted contracts; allow overdue balances on inactive contracts. Future balances beyond the seven-day reminder window are not pending issues.
- Payment schedules use monthly calendar clamping and per-installment rounding, final installment remainder, down payment and active fee amounts. Fully settled revenues cannot generate overdue issues.
- Require contract read grants; restrict contracts using the existing assignment-type visibility matrix. All financial issues additionally require fee read grants with their independent assigned/all scope. All joins retain firm scope.
- Filters: text, severity, type, client and collaborator, URL-owned and reset page on change. Summary counts reflect the filtered collection and distinguish issue count from distinct contract count. Stable order: severity, earliest due date, contract ID, issue ID.
- Existing mutation refresh metadata invalidates the queue; no new write endpoints. Contextual actions use contract finance/team tabs and related client drawers.
- Context7 is unavailable in this session; use established repository component and API patterns without adding libraries.

## Risks / Trade-offs

- SQL schedule drift → test partial/final/rounded payments and month-end dates against existing payment-plan semantics.
- Expanded schedule cost → restrict by authorized contract, active revenue, positive remaining principal and due dates; database paginates results. No migration required.
- Counts could disclose financial data → apply subject authorization before union and summaries.

## Migration Plan

No schema migration. Deploy route and feature together; rollback code removes the new read surface.

## Product review: evolving financial alerts and sorting

Replace missing-responsible/revenue checks with time-based and derived financial follow-up: overdue (high); recorded last installment with remaining value (high, replaces date alerts for that revenue); next unpaid installment between today and today+7 inclusive (medium, only active ACTIVE contracts); all active revenues settled but contract still active ACTIVE (low, review only). No remuneration/expense inference. No additional required fields or form changes.

Keep financial subject authorization for every issue, including settled review; no missing-data rows remain. Keep inactive overdue balances but suppress proactive and status-review warnings on inactive/completed/cancelled contracts. Use the existing plan arithmetic and America/Sao_Paulo date. Use shared createSortSchema and DataTable headers; allowlist SQL sort expressions, stable severity/date/contract/issue ordering, NULLS LAST, sort before server pagination. Add low count/card with existing dashboard presentation. The updated specification supersedes earlier missing-data and future-receivable decisions in this change.

## Follow-up navigation and single balance column

The read model includes the total remaining balance and calendar-day age of the earliest unpaid installment, with installment arithmetic still computed in PostgreSQL using decimal values. UI product review retains only Saldo a receber (total remaining) and omits separate overdue-balance presentation. Table and mobile list share the due-date/delay component.

Summary uses the existing dashboard overlay-button pattern. The route composes a feature-owned summary hook using shared useFilter; the filter-form hook synchronizes form state only when the serialized URL filter changes, so manual edits and card navigation remain aligned without resetting in-progress debounced typing. Return navigation uses a validated pendingReturnTo object from the pending feature's public search contract, without arbitrary URLs. Feature links and finance actions share a navigation hook and preserve context across contract tabs and reloads. No new persistence, dependency or permission model.

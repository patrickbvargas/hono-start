## 1. Contract and entry points (no database migration)

- [x] 1.1 Align canonical workflow/permission documentation and remove stale references.
- [x] 1.2 Remove obsolete fee/remuneration implementations and consumers; redirect legacy URLs safely.

## 2. Financial reads

- [x] 2.1 Replace dashboard data, aggregates and drilldowns with scoped title/movement projections and regression tests.
- [x] 2.2 Replace pending-work queries with current tables and actual balances, with authorization tests.

## 3. Operational and settlement flows

- [x] 3.1 Remove legacy operational revenue planning/fallbacks and include every generated title in summaries.
- [x] 3.2 Preserve invalid monetary inputs and synchronize mutation results without reload, with regressions.

## 4. Navigation and presentation

- [x] 4.1 Restore authorized audit navigation, translate financial audit labels and update settings guidance.
- [x] 4.2 Standardize financial terms, generation difference feedback, organization locale and actionable error recovery.

## 5. Verification

- [x] 5.1 Align meaningful current contract tests, resolve full-suite hangs, run pnpm check and typecheck, and fix errors.
- [x] 5.2 Run full tests/build and available non-destructive database checks; reconcile existing seed checklist only with evidence.
- [x] 5.3 Recheck available browser workflows, update TODO.md/evidence and record live-environment limitations.

## Verification notes

- UI smoke checks cover Admin/Matriz, current financial reads, entry visibility, zero rejection, dashboard reconciliation, legacy redirects, audit and responsive navigation.
- Clerk ptBR is configured; SDK-only English accessibility/development strings remain explicitly listed in TODO.md.
- Real database verification passes 11 financial constraint scenarios and finds zero legacy tables, but reports three bridge tables without RLS (with no SELECT granted to anon/authenticated). No schema/reset/seed action was performed.
- Live Member/two-unit/storage/concurrency journeys require suitable isolated fixtures. These remain pending in TODO.md and do not constitute executed verification.

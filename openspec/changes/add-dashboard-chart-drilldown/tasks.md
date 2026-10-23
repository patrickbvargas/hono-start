## 1. Contracts and selectors

- [x] 1.1 Consult Context7 for installed library APIs needed by implementation; inspect existing modal, overlay, table, pagination and feature query patterns. No database migration is expected.
- [x] 1.2 Define Zod selection/response schemas, stable group keys, row kinds, complete-result contracts and centralized detail query keys.
- [x] 1.2a Define isolated `features/drilldown` public props/contracts for generic rows/context/filters, columns, query-options factory, Zod response boundary, row identity and optional summaries; keep financial selectors in the dashboard adapter.
- [x] 1.2b Inspect actual listing column reuse needs; extract compatible feature-owned read-only column factories and expose them through public barrels without changing existing listing behavior or leaking additional fields.
- [x] 1.3 Add stable client identity grouping and explicit debt/forecast reference metadata to the summary; cover homonyms and reference stability with focused tests.

## 2. Protected financial reads

- [x] 2.1 Implement protected detail server boundary with subject grants, own/assigned scope, firm isolation, selector validation and consolidated-result gate; test denied requests and forbidden-query avoidance.
- [x] 2.2 Implement complete selected receipt details including down payments, grouped by month, area, type or client; test exact aggregate reconciliation and lifecycle/date boundaries.
- [x] 2.3 Implement complete selected remuneration and expense details by month/function/category; test scopes and full-result totals across pages.
- [x] 2.4 Implement outstanding installment detail buckets using shared schedule/reference logic; test partial payments, historical payments, bucket/day boundaries and older debts.
- [x] 2.5 Implement signed monthly balance/Result composition with subtotal reconciliation, consistent rows/count/totals and explicit refresh behavior for changed source data; test zero/negative totals.

## 3. Modal and chart activation

- [x] 3.1 Implement standalone drilldown orchestration with consumer-provided query options and existing DataTable frontend pagination via pageSize, with route sorting disabled; implement dashboard selection adapter separately. Cover selection races, filter changes, permission loss and page resets.
- [x] 3.2 Compose standalone read-only modal/table using shared UI and props-supplied columns/context/summaries. Preserve full BRL amounts and financial totals in the dashboard consumer, with loading/empty/error states in the core.
- [x] 3.3 Wire every breakdown bar, monthly balance bar and precise financial evolution series/month; add accessible activation for all bars and Result points with focus restoration.

## 4. Verification and documentation

- [x] 4.1 Run focused Vitest tests for all selectors, reconciliation, authorization, pagination and modal lifecycle; verify dashboard chart families in the desktop browser, including keyboard use.
- [ ] 4.1b Complete visual QA at a narrow viewport. The current in-app browser exposes no viewport resizing capability; desktop QA and scrollable modal/table behavior have been verified.
- [x] 4.1a Prove standalone reuse with a non-dashboard card fixture using its own row schema, columns, filters and query factory; assert no core change/registry, no cross-feature internal imports and no parent-route pagination/sort mutation. Verify reused read-only listing columns retain formatting without lifecycle actions.
- [x] 4.2 Update canonical FEATURE_BEHAVIOR, QUERY_BEHAVIOR and the dashboard permission matrix with detail semantics and eligibility; preserve unsupported allocation restrictions.
- [x] 4.3 Review feature boundaries and code style; run pnpm check then npx tsc --noEmit and resolve errors before marking complete. Run remaining relevant release checks and record actual outcomes.

## Verification record

- `pnpm check` and `npx tsc --noEmit` passed after the implementation.
- Focused dashboard, drilldown, expense, shared table and architecture/pattern tests passed. The broader affected-area run had 100 passing tests and one timezone-sensitive new expense-column fixture failure; the fixture was corrected to an unambiguous midday timestamp and the affected test passed. The final focused regression run passed 27 tests in 8 files, including focus restoration.
- Production `pnpm build` passed, including a final rebuild after trigger/focus fixes. Existing dependency-level bundling warnings remain non-fatal.
- Desktop browser verified full receipt amounts and down payments, revenue by area/type, monthly remuneration, signed Result/monthly balance composition, expense read-column reuse, future and overdue outstanding installments, local pagination, keyboard activation and restored focus to a re-rendered chart trigger. Example: March entries 15,000 minus deductions 8,300 equals 6,700.
- No schema migration, grant changes, financial data mutation or commit performed. Responsive visual QA remains open as recorded in 4.1b; no restricted-user browser session was available, so denial/scope behavior was verified with focused server/data tests.

- User correction implemented: removed standalone page state/navigation and dashboard server-page inputs. DataTable receives pageSize and the full authorized selected result; frontend page changes do not issue new requests.

- After the pagination correction, the standalone/shared-table/dashboard-detail tests passed (15 tests in 4 files), including an assertion that page navigation performs no extra source query.

- Browser confirmed native DataTable navigation from records 1–10 to 11–14 of 14, preserving the R$ 40,000 total and the dashboard URL. The corrected frontend-pagination build passed.

## 5. Dashboard metric consumers

- [x] 5.1 Add explicit card selection contracts and scoped period reads for received/planned revenue, generated remuneration, expenses and Result. Keep scheduled card amounts distinct from outstanding future buckets.
- [x] 5.2 Wire accessible full-card activation to the existing standalone modal while preserving help and comparison tooltips. Reuse DataTable frontend pagination and financial read columns.
- [x] 5.3 Run focused card/scope/reconciliation tests, type/style checks and update the specification and canonical behavior/permission docs.

- Card extension verification: 23 tests passed in 4 dashboard files, including planned/received reconciliation, expense-only access and independent tooltip controls. `pnpm check`, `npx tsc --noEmit`, strict OpenSpec validation and the final production build passed. An earlier build attempt failed; the subsequent build completed successfully with the existing dependency warnings. Card-specific browser QA has not been performed.

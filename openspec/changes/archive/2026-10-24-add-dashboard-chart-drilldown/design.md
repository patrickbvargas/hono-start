## Context

The dashboard summary exposes aggregates, not the complete source records needed by a modal. Its data layer already separates receipts, remuneration, expenses, installment schedules and access scope. Receipt totals include down payments; aging and forecast derive outstanding installments at a reference date. Consolidated balance/result require all relevant grants and no unsupported allocation filters. Client revenue currently groups by name and can merge distinct clients.

## Goals / Non-Goals

Provide a faithful, read-only explanation of every bar and monthly Result point, without increasing initial dashboard payload or widening financial access. Non-goals are defined in proposal.md.

## Decisions

### 1. Standalone feature configured by the consumer

Create `src/features/drilldown` as an isolated feature with a minimal public barrel, schemas/contracts, orchestration hook and modal/table presentation. It depends on shared infrastructure, never on dashboard, entity features, chart libraries, route search parameters or specific permission keys. Dashboard is the first consumer, not the owner of the reusable modal.

Use typed generic props for: controlled open/close lifecycle; title and description; consumer-owned context and filters; declarative TanStack columns; stable row identity; a TanStack query-options factory receiving context and filters; a response boundary with a Zod schema and result normalization; and optional summary presentation. The query factory returns the complete authorized selected dataset. The consumer supplies domain-specific messages and any displayed filter summary. Amount totals and financial reconciliation are optional consumer responsibilities, not assumptions of the core feature. Filters are configuration/data input in this delivery; no new editable filter-builder UI is required.

The drilldown hook owns request execution and loading/error/empty state. The shared DataTable owns frontend pagination through pageSize. It accepts ordinary query options, not a hook passed as a prop. Source features own their protected endpoints, query factories, row schemas and selection adapters, exposed through their public boundaries. A changed context/filter key clears rows and resets pagination; the dashboard adapter closes on dashboard filter changes as specified below. Existing dashboard keys retain ownership of financial caches and invalidation; other consumers supply their own keys. Do not introduce a central chart/entity registry, arbitrary endpoint dispatcher, client-defined SQL/filter DSL, or mandatory chart-kind union in the standalone feature.

For the dashboard adapter only, add a Zod-discriminated financial selection contract for subject, series where relevant, stable group key or month, effective filters and reference date. Reuse the same adapter for multiple graphs that request the same source. Keep server handlers private behind dashboard query-option factories. Server derives firm, employee scope and grants; no client-provided access flag, filter configuration or amount is authoritative. Validate permitted selector combinations before querying.

Routes remain composition-only. Reusable UI is consumed through existing shared exports; do not import vendor UI primitives into features. Adding a registration-page card should require only its existing authorized data source, context and columns passed to the public drilldown API. No drilldown-internal change is needed.

### 1.1. Reuse column definitions without coupling screens

Current ClientTable and ExpenseTable define columns inside their components and combine data columns with lifecycle actions and route-driven Pagination. Do not embed those screen tables in the modal. Where row schemas match and reuse is actually needed, extract feature-owned column factories from those components and expose the relevant factory via the owning public barrel. Both the list and its drilldown consumer can request the compatible read-only columns and preserve existing formatting. The standalone feature receives the resulting columns as props and never imports these factories itself.

Exclude action columns, entity overlay triggers, unsupported sorts and fields not authorized by the selected data source. Do not fetch extra sensitive fields merely to satisfy a listing's column schema. Different row grains (for example a scheduled installment versus an expense record) retain explicit consumer-specific columns. Avoid moving entity business columns into shared UI or forcing all entities into one universal row schema.

Pagination belongs to the existing shared DataTable via pageSize. The drilldown owns no page state, navigation controls or server-page contract, and must not read/write the parent page's URL state. Closing leaves source-page filters, sorting, pagination and scroll intact.

### 2. Match the actual chart calculation

Reuse effective periods and selectors from the aggregate data path, rather than rebuilding approximate filters in the browser. Monthly charts currently use a generated month range; inspect and preserve their precise boundary rules, even where those differ from a KPI's selected-day interval. Month selection must match the month's contributing records exactly.

Return the complete selected record set with canonical money amounts, stable row identities, matching row count and total. Use Decimal for reconciliation and round only for currency presentation. Modal totals use full BRL precision; chart compact labels remain unchanged.

| Selection | Row grain | Suggested visible columns |
|---|---|---|
| Monthly revenue; revenue by area/type/client | One fee receipt or initial down payment | Date, client, process, revenue type, entry kind/installment, received amount |
| Monthly remuneration; remuneration by function | One generated remuneration | Date, collaborator, function, process, amount |
| Monthly expenses; expenses by category | One expense | Date, category, description when present, amount |
| Debt aging; future receipts | One scheduled installment with positive outstanding value | Client, process, revenue type, installment, due date, installment amount, paid amount, outstanding amount |
| Monthly balance; Result point | One receipt, remuneration or expense contribution | Date, contribution kind, authorized description, entry, deduction, signed amount |

The total for debt/forecast is outstanding, not installment face value. Monthly balance and Result show positive receipts and negative remunerations/expenses, with only the signed Total in the summary. Remunerations remain generated obligations, not confirmed bank outflows. A down payment is identified as an initial contribution, not duplicated as a fee. Only fields justified by the relevant financial grant may be selected; relationship access must not expose unrelated personal data, documents or attachments.

### 3. Stable category keys

Use client IDs rather than client names in both aggregate grouping and selection. Keep names as display labels; homonyms produce separate bars and separate details. Lookup categories/functions use stable lookup values, never translated labels. Month and aging/forecast buckets use explicit stable keys. Rename/display changes must not alter which records are selected.

### 4. Authorization mirrors chart eligibility

Re-evaluate current session grants for every source request and refresh. Frontend page navigation uses only the already-authorized result set. Dashboard access alone does not authorize financial records. Revenue details require the applicable fee grant with assigned scope; remuneration requires all/own scope; expenses require expense read. Balance and Result require the exact current consolidated-result gate, including read_cash_flow and allocation restrictions. Do not grant access based on role name or a visible chart. Reject forged group/series/month combinations and cross-firm resources without revealing existence. Existing subject denial must avoid querying forbidden financial tables.

### 5. Lazy loading, lifecycle and freshness

Fetch only when the modal opens. Consumer-owned centralized cache keys include the entire normalized selection, filter context and reference date; dashboard financial queries use the dashboard namespace, while other consumers use their own namespace. Inherit global freshness and invalidation policy. Clear displayed rows on a different selection; stale requests must never populate a newer selection. Reset pagination on selection changes. Close the modal when dashboard filters change; cancel/ignore obsolete requests. Permission or identity changes clear restricted content through existing session/cache handling.

Use one server-resolved reference timestamp for debt/forecast aggregate and details. Pass that anchor from the summary, validate it at the boundary, and never accept it as authority to widen scope. Preserve the same due-date and historical-payment logic, including partial payments, day boundaries and overdue debt before dateFrom.

Rows, count and totals within a response must reflect one consistent read. No historical snapshot storage is proposed. If persisted data changed after the chart loaded, refresh the affected summary and details and display a brief update notice rather than implying the old bar still reconciles. A mismatch in unchanged data is a defect, not an acceptable tolerance. Page navigation only changes the existing DataTable frontend page. Totals continue to cover the complete authorized result.

### 6. Interaction and presentation

Activate the precise bar segment, not the whole plot area or a neighboring series. For Result, provide a selectable monthly point without making the line visually noisy. Support keyboard activation with an accessible description that identifies chart, series/group, month and value; use the existing shared UI pattern for any equivalent accessible control needed by Recharts rendering.

The modal has a contextual pt-BR title, concise filter/reference summary, full-value summary and a scrollable, paginated read-only table. Reuse existing page-size defaults and deterministic ordering with stable tie breakers. Total includes all pages and is labeled accordingly. Zero/no-row selections open an empty state; zero net balance may still have many contributing rows. Loading, retry and safe denied/error states must never display stale records. Closing returns focus to the initiating control and preserves dashboard scroll and filters.

## Risks / Trade-offs

- Exact reconciliation can reveal aggregate bugs; share calculation predicates rather than masking differences in the modal.
- Generated installment schedules may be expensive to compute; reuse scoped schedule computation first and return only the selected context on demand. Evaluate representative volumes before choosing query optimization. Do not add schema/index changes without evidence.
- Current active change and older specs may describe obsolete chart forms; treat current user-approved code and canonical docs as the baseline.
- Recharts keyboard/click event behavior needs verification against the installed version. Consult Context7 for libraries before implementation as required by project configuration.

## Rollout / Validation

No migration. Deliver selectors/contracts and protected server reads before hooks/UI. Verify all bars and Result, reconciliation across pages, homonyms, partial payments, period boundaries, zero and negative balances, revoked/missing grants, missing Employee binding, forged selections, firm isolation and stale-request races. Run focused Vitest coverage, required formatting/type checks, then browser QA. Update canonical docs and the dashboard permission matrix alongside implementation.

## Implementation notes

- Dashboard cards are additional consumers of the same standalone modal. Explicit metric selectors use the complete KPI period. Planned revenue includes down payments and full scheduled installments, including paid installments; received revenue uses actual receipts. Result retains the consolidated permission gate. Card help and comparison controls remain independent of detail activation.

- Interactive sorting is disabled in this delivery so reused columns cannot mutate the parent route. Consumers supply filters/context and optional summaries through props; the modal owns request lifecycle and delegates frontend pagination to DataTable through pageSize.
- Expense read columns are extracted in the expenses feature and consumed through its public barrel; no entity import was introduced in the standalone feature.
- Focus restoration accepts a resolver as well as an element, so consumers with re-rendered SVG triggers can resolve the current trigger after close.

- User correction: use DataTable pageSize for frontend pagination. The initial separate paginator and server page inputs were removed; no query runs when changing display pages.

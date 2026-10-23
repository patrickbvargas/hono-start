# Feature Behavior

This document defines the product surface and the expected behavior of each feature area.

It is intentionally about behavior, not field-by-field data contracts or low-level business rules.

- Entity meaning lives in `DOMAIN_MODEL.md`.
- Hard business constraints live in `BUSINESS_RULES.md`.
- Permissions live in `ROLES_AND_PERMISSIONS.md`.
- Filtering and sorting semantics live in `QUERY_BEHAVIOR.md`.
- Step-by-step flows live in `USER_FLOWS.md`.

## Product Surface

The software core includes these feature areas:

- Authentication and session management
- Dashboard
- Clients
- Employees / collaborators
- Contracts
- Revenues
- Fees
- Expenses
- Remunerations
- Attachments
- Audit log
- Export

## Feature Area Intent

### Authentication And Session Management

- Clerk provides email or username sign-in, invitations/setup, recovery and account management in pt-BR.
- Clerk owns credentials, pending-session tasks and security/session settings.
- The app never issues temporary passwords or authenticates by OAB.
- Protected access requires a verified active session, current membership and valid optional privateMetadata.employeeId binding when present.
- Permission grants come exclusively from Clerk; persisted scope and lifecycle rules remain enforced in the app.

### Dashboard

- Serves as the default authenticated landing area.
- Summarizes operational and financial information relevant to the current user.
- Surfaces recent business activity and high-level comparisons.
- Exposes read-only analytical surfaces rather than operational mutation flows.
- Adapts scope according to the role and visibility model.

### Clients

- Provides the main client list and client-management entrypoint.
- Supports search, filtering, create, edit, detail, delete, and restore flows according to permissions.
- Preserves list context while viewing or editing a specific client.
- Acts as an upstream dependency for contract creation.

### Employees / Collaborators

- Provides business collaborator management.
- Supports employee-type, and remuneration-related configuration.
- Supplies collaborator options to contract-team workflows.

### Contracts

- Acts as the main operational aggregate for legal work.
- Brings together client, legal area, team composition, revenue planning, and lifecycle state.
- Exposes writable behavior while the contract remains in a writable state.
- Becomes read-only when business status rules require it.

### Revenues

- Represents payment plans attached to contracts.
- Shows expected incoming value, payment structure, and payment progress.
- Exists inside the contract context rather than as a standalone business area.

### Fees

- Records concrete payment events against revenues.
- Updates payment progress and downstream financial state.
- Optionally triggers remuneration generation.

### Expenses

- Records concrete operational outflows for the firm.
- Provides a standalone list route with create, edit, detail, delete, restore, and attachment flows.
- Keeps observation content in form and detail only, not as a default list column.

### Remunerations

- Provides the payout-review surface derived from fee events.
- Exposes user-scoped or firm-scoped visibility depending on role.
- Allows administrative correction where the role model permits it.

### Attachments

- Provides file handling for client, employee, contract, and expense contexts.
- Supports upload and view behavior within allowed contexts.
- Keeps deletion behavior restricted according to permissions.

### Audit Log

- Provides immutable administrative review of business mutations.
- Exists as a review surface, not as editable operational data.

### Export

- Produces filtered remuneration report output.
- Preserves the same scope restrictions applied in on-screen views.

## Route Inventory

### Public Routes

- `/login`
- `/recuperar-senha`

### Authenticated Product Routes

- `/`
- `/clientes`
- `/colaboradores`
- `/contratos`
- `/honorarios`
- `/despesas`
- `/remuneracoes`
- `/auditoria`

## Canonical Screen Behavior

- Dashboard is the default authenticated landing page.
- Entity list screens are the primary operational entrypoints.
- Entity details open without losing list context.
- Create and edit flows happen as overlays rather than dedicated CRUD pages.
- Administrative actions appear only when the session allows them.
- Read-only business states must block writes consistently across all affected surfaces.
- The application is desktop-first with responsive support for smaller devices.

## Feature-Level Expectations

### Dashboard Expectations

- Shows revenue totals and remuneration totals.
- Shows read-only cash-flow summaries for administrators.
- Shows recent business activity.
- Shows monthly comparison information.
- Shows the last 10 recent events across supported business entity types.
- Shows firm-wide data for administrators.
- Shows scoped data for regular users.
- Includes revenue charts by legal area and revenue type.
- Uses received fees as dashboard inflow and combines remunerations plus expenses as outflow where the summary requires firm cash-flow.
- Does not expose firm-wide expense-derived cash-flow summaries to regular users.

### Client Expectations

- Users can create and update clients within policy.
- Users can search and filter clients efficiently.
- Users can inspect client details without leaving the list context.
- Client behavior supports downstream contract workflows.

### Employee Expectations

- Administrators can create and maintain business collaborators.

### Contract Expectations

- Users can create contracts with assigned collaborators and at least one revenue plan.
- Users can inspect contract team composition and lifecycle state.
- Administrators can control contract status-lock behavior.
- Contract behavior coordinates downstream revenue, fee, and remuneration behavior.

### Fee And Remuneration Expectations

- Users can record fees against revenues.
- Users can choose whether remuneration generation happens for a fee event.
- Administrators can manually adjust remuneration records when policy allows it.
- Remuneration review remains tied to the underlying fee and contract context.

### Expense Expectations

- Administrators can record expenses through a standalone `Despesas` route.
- Expense list state is URL-driven and preserves filters, pagination, and sorting.
- Expense details open in a drawer and include an `Anexos` section.

### Attachment Expectations

- Authenticated users can upload and view attachments in supported contexts.
- Attachment deletion remains permission-controlled.

### Audit Expectations

- Administrators can inspect immutable audit history.
- Audit history exists to explain business mutations after the fact.

### Export Expectations

- Export supports remuneration data.
- Export supports PDF and spreadsheet output.
- Export supports date-range filtering.
- Export scope follows the role model.

## Canonical Use Cases

### Authentication

- As a user, I can log in with email or OAB number and password.
- As a user, I can change my password while authenticated by confirming my current password.
- As a user, I can recover access through password reset.
- As a user who logged in with a temporary administrator-issued password, I must choose a new password before using the rest of the product.
- As a user, I can access only authenticated areas after login.

### Client Management

- As a user, I can create a client so contracts can be linked to that record.
- As a user, I can search and filter clients to find the right party quickly.
- As a user, I can inspect client details without losing list context.

### Employee Management

- As an administrator, I can create and maintain business collaborators.

### Contract Management

- As a user, I can create a contract with assigned collaborators and at least one revenue plan.
- As a user, I can inspect the assigned team and contract lifecycle state.
- As an administrator, I can lock status changes on a contract.

### Fee And Remuneration

- As a user, I can record a fee and generate remunerations automatically.
- As a user, I can record a fee without remuneration generation for exceptional situations.
- As an administrator, I can manually adjust remuneration records when business reality requires it.

### Expense Management

- As an administrator, I can register a firm expense with category, date, amount, and optional observation.
- As an administrator, I can inspect expense details and manage attachments without losing list context.

### Reporting And Visibility

- As a user, I can see scoped dashboard and remuneration information relevant to me.
- As an administrator, I can review firm-wide financial information.
- As an administrator, I can see a read-only cash-flow view in the dashboard derived from honorários, remunerações, and despesas.
- As an administrator or authorized user, I can export scoped remuneration data.

### Administration And Audit

- As an administrator, I can soft-delete and restore supported business records.
- As an administrator, I can inspect immutable audit history.
- As an authenticated user, I can upload and view attachments within allowed contexts.

## Behavioral Boundaries

- Features must preserve firm isolation.
- Features must preserve role-aware visibility.
- Entity behavior must remain aligned with canonical user flows.
- Business entities used as form options must respect active and deleted status rules.
- Lookup values may remain visible but disabled when inactive.
- This document must not become the duplicate home of entity schemas, validation rules, or permission matrices already defined elsewhere.
## Dashboard financial analysis

- Balanço is the monthly operational cash-flow view: entry = administrative + judicial + succumbency receipts; output = generated remuneration + recorded expenses; balance = entry - output. It does not establish a bank balance or payout settlement.
- Expected revenue sums contractual down payments and installments due within the selected dates, including plans started earlier. Installments begin one month after paymentStartDate, preserve the due day where possible, and allocate cent rounding to the last installment.
- Comparisons include down payments in both receipt bases and compare with the same dates one year earlier. Growth from a zero prior base is unavailable; negative prior bases use their absolute value as denominator.
- Firm result, expenses and margin are shown only without collaborator, legal-area or revenue-type filters, because expenses have no allocation dimensions. Generated remuneration remains scoped to the selected collaborator.
- Outstanding installment amounts subtract payments assigned to that installment as of the reference date. Aging and collection include debts before the filter start. Reference is the earlier of filter end and today; future receipts use outstanding contractual installments in the following 90 days.
- Revenue concentration groups received amounts by client. Generated remuneration groups by assignment role. Charts expose an accessible help button beside the title explaining their meaning and calculation.

### Dashboard chart presentation

- The initial view shows metric cards, financial evolution, monthly balance and revenue by legal area, subject to permissions. The "Mostrar análises detalhadas" checkbox sits at the right of the filter bar and controls all remaining charts and all tables. Its preference is saved in browser localStorage under `dashboard.showDetailedAnalyses`, defaulting to false. Toggling preserves chart order and existing permission checks; the details are omitted when no authorized detail is available. Storage failure does not prevent toggling.
- Visible monetary chart labels use BRL in thousands with exactly one decimal place (for example, R$ 12,8 mil or R$ 4,0 mil), including zero and amounts below one thousand; tooltips retain complete amounts. Single-series columns show values above positive bars and below negative bars. Financial evolution keeps amounts in tooltips to avoid crowding multiple series; percentage labels remain percentages.

### Dashboard record drilldown

- Dashboard KPI cards also activate the standalone drilldown through explicit metric source keys, using the full selected period. Help and percentage-comparison buttons retain their own tooltip interactions and do not activate drilldown.
- Receita prevista lists initial down payments and full scheduled installments due in the period, including paid installments; it is distinct from the outstanding future-receipts chart. Receita recebida lists actual receipt contributions; Remunerações geradas lists generated remuneration; Despesas lists period expenses; Resultado do período shows signed receipts minus generated remuneration and expenses.

- The drilldown context (period and filters) appears in an info tooltip beside the modal title, with an accessible description retained for screen readers.
- Every bar and monthly Result point opens a read-only modal with the exact contributing records, full BRL amounts, record count and total across all pages. Keyboard activation is supported, with focus restored on close.
- Receipt details include initial down payments and fee receipts once each. Monthly balance and Result show signed receipts, generated remunerations and expenses, with only the signed Total in the summary; they do not represent bank balance or confirmed remuneration settlement.
- Aging and forecast details show installment face value, paid value and outstanding value at the same reference timestamp as the chart. Their total sums outstanding value. Aging includes older debts before the selected start date.
- Monthly detail periods intersect the selected month with the dashboard's effective date interval. Area, type, client, function and category details retain the active dashboard filters and financial scope. Clients are grouped by ID, including clients with identical names.
- Records are fetched on demand. A source-data mismatch refreshes the summary and shows a concise update notice with current detail totals. A filter change closes the dashboard modal; switching selections resets its pagination and cannot display a late response from the previous selection.
- The isolated drilldown feature is configurable by props and can also serve cards on registration pages. It has no dashboard, chart or entity dependency; consumers supply context, filters, query options, Zod response schema, row identity, columns and optional summaries.
- Compatible read-only listing columns may be supplied through the owning feature's public API. The modal does not inherit listing actions or URL pagination/sorting. This delivery uses stable server ordering without interactive column sorting.
- Monthly balance uses columns above/below a zero reference line; it is a monthly result rather than a continuous balance curve.
- Financial evolution combines receipt, generated-remuneration and expense bars with a result line on the same monetary axis. Existing subject permissions govern each series.
- Outstanding future receipts use columns ordered as up to 30, 31–60 and 61–90 days. Aging bars remain chronological: up to 30, 31–60, 61–90 and over 90 days, rather than ranking amounts.
- Chart orientation is fixed: legal area, revenue type, remuneration assignment roles and aging use vertical bars. Clients and expense categories use horizontal bars with internal scrolling. Filtering does not change chart orientation.

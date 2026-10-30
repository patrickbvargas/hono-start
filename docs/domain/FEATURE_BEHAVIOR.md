# Feature Behavior

> Revisão vigente 30/10/2026: [Pessoas, papéis, extensões e genéricos](PERSON_REGISTRATION.md). Substitui telas separadas por rota Pessoas; exige Cliente no receber, Fornecedor no pagar e Colaborador implica Fornecedor. Ajustes novos ainda pendentes no código.

## Approved financial redesign — target precedence

Status: approved plan, not implemented. [Target financial contract](FINANCIAL_SYSTEM.md) and its linked roadmap/UML/authorization supersede conflicting financial and identity semantics below for the ordered redesign. Remaining text describes the preserved running baseline and unchanged house rules; do not infer target implementation from it.

Target operational acerto produces editable title preview then atomic generation. Financial checkboxes create grouped partial/full receipts or payments. Corrections use dated reversals. Details and reports distinguish principal and cash. Contract and Expense retain attachments; shared batch proof is optional.


## Operational usability

- Contract details show each active revenue's contracted amount, received amount including down payment, remaining amount, recorded installments, and next outstanding scheduled due date. The schedule follows the dashboard convention: installment 1 falls one month after paymentStartDate, preserving the original day with month-end clamping. Partial receipts leave the installment outstanding. Recording a new fee preselects the contract, revenue and first unrecorded installment, respects create/read grants and assignment scope, and remains unavailable for inactive, deleted, completed, cancelled or fully paid records.
- Fee, expense and remuneration listings show the sum of the entire filtered and authorized result, independent of pagination, including a zero total for an empty result. Expense listings include a short note. Attachment actions and metadata share the same detail layout across supported entities.
- Names and process numbers in entity tables open the same detail as the ID action. Related-list links respect the target subject's read grants and retain server-side resource scoping. No link widens access.
- Fee dates are labelled Data de recebimento. Remuneration dates are labelled Data do honorário because they derive from the originating receipt, not a payroll disbursement. Active/inactive flags describe record validity, never payment settlement. Contract lifecycle is labelled Andamento and active/inactive state Cadastro.
- Manual remuneration editing identifies the collaborator, contract, source fee and recorded amount/percentage. It explicitly states that saving is a manual adjustment and editing one field does not recalculate the other.
- Forms request confirmation before closing with unsaved edits and block dismissal during submission. Untouched forms close directly; successful save callbacks close without a discard prompt. Continuing editing preserves the draft.
- Audit action/type/name labels are localized on read without rewriting stored historical codes. A single-page paginator keeps its count, page-size selection and page navigation. The effective dashboard date range remains visible, and expense increases use adverse comparison styling rather than income-growth styling. KPI grid placement remains unchanged.

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
- Protected access requires a verified active session, current membership, required User privateMetadata.employeeId and Organization privateMetadata.firmId. Both must be positive integers identifying an active, non-deleted Employee and an existing Firm respectively. All roles, including administrators, require both bindings.
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

- Provides file handling for client, employee, contract, expense, fee, and remuneration contexts.
- Supports upload and view behavior within allowed contexts.
- Attachment identity buttons open a wide contextual preview modal by click, Enter or Space. The fixed header shows filename, type, size, creation date and sender, with download, permitted deletion and close actions on the right. PDFs use a local PDF.js reader with page navigation and the same floating zoom toolbar as images; JPG/PNG images fit without cropping. The modal preserves the originating record context and restores focus when dismissed. Row download and menus do not open the preview.
- Preview delivery retains existing session, owner and branch authorization. Loading uses a skeleton through download and the image/PDF load event, including retries; HTTP/image failures show safe pt-BR feedback with Tentar novamente. Abrir em nova aba and download remain available when a URL exists, including when the PDF cannot be rendered. Preview binaries are not retained after closing and temporary object URLs are revoked. Deletion from preview requires existing confirmation; cancellation/failure preserves preview and successful deletion closes it.
- Keeps deletion behavior restricted according to permissions.
- Attachment rows vertically center identity/metadata with the actions, retain light padding and highlight the complete row on hover/focus. Overflow and context menus offer Visualizar before the existing actions, opening the same contextual preview.
- Preview headers use a compact filename row and a single metadata line where space permits, including sender; long filenames truncate with full-name tooltip and metadata wraps on small screens. Abrir em nova aba uses an underlined label followed by the navigation arrow, consistent with entity page links.
- Image previews expose floating zoom out/in controls, current percentage, 100% actual size and Ajustar à tela. They initially fit without enlarging small files, support zoom up to 800%, and allow mouse/touch dragging or arrow-key panning within image bounds. Resizing, changing zoom or switching images resets position. PDF shares the image zoom toolbar, adds page navigation and fit-to-width, and renders one page at a time.
- Image preview menus expose Imprimir after loading. Printing prepares only the complete image, preserving proportions and excluding preview controls, metadata and current zoom/pan. The browser's print dialog owns printer selection and cancellation. Temporary print content is removed after printing or preview dismissal. PDF printing uses the browser print dialog; the full native reader remains available in a new tab.

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

Each primary entity collection also exposes a protected `/<collection>/<id>` record page. Contracts retain their existing workspace; audit record pages remain read-only. Revenues and attachments continue inside their owning record contexts.

## Canonical Screen Behavior

- Dashboard is the default authenticated landing page.
- Entity list screens are the primary operational entrypoints.
- Entity identities and mobile cards open dedicated pages by default, preserving validated collection return context. Explicit collection menu actions open pages or quick detail drawers. Related records open contextual drawers with permitted lifecycle actions.
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
- Uses received fees as dashboard inflow and uses recorded expenses alone as outflow where the summary requires firm cash-flow.
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
- Expense details open in a dedicated page by default, with overview, attachments and authorized history tabs. The existing drawer remains available for contextual inspection.

### Attachment Expectations

- Authenticated users can upload and view attachments in supported contexts.
- Attachment deletion remains permission-controlled.

### Audit Expectations

- Audit readers can inspect immutable history only for entities they can currently read.
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

- Balanço is the monthly operational cash-flow view: entry = administrative + judicial + succumbency receipts; output = recorded expenses; balance = entry - output. It does not establish a bank balance or payout settlement.
- Expected revenue sums contractual down payments and installments due within the selected dates, including plans started earlier. Installments begin one month after paymentStartDate, preserve the due day where possible, and allocate cent rounding to the last installment.
- Comparisons include down payments in both receipt bases and compare with the same dates one year earlier. Growth from a zero prior base is unavailable; negative prior bases use their absolute value as denominator.
- Firm result, expenses and margin are shown only without collaborator, legal-area or revenue-type filters, because expenses have no allocation dimensions. Generated remuneration remains scoped to the selected collaborator.
- Outstanding installment amounts subtract payments assigned to that installment as of the reference date. Aging and collection include debts before the filter start. Reference is the earlier of filter end and today; future receipts use outstanding contractual installments in the following 90 days.
- Revenue concentration groups received amounts by client. Generated remuneration groups by assignment role. Charts expose an accessible help button beside the title explaining their meaning and calculation.

### Dashboard chart presentation

- The initial view shows metric cards, financial evolution, monthly balance and revenue by legal area, subject to permissions. The "Mostrar análises detalhadas" checkbox sits at the right of the filter bar and controls all remaining charts and all tables. Its preference is saved in browser localStorage under `dashboard.showDetailedAnalyses`, defaulting to false. Toggling preserves chart order and existing permission checks; the details are omitted when no authorized detail is available. Storage failure does not prevent toggling.
- Visible monetary chart labels use BRL in thousands with exactly one decimal place (for example, R$ 12,8 mil or R$ 4,0 mil), including zero and amounts below one thousand; tooltips retain complete amounts. Single-series columns show values above positive bars and below negative bars. Financial evolution keeps amounts in tooltips to avoid crowding multiple series; percentage labels remain percentages.

### Dashboard record drilldown

- Dashboard drilldowns show Resumo then Dados. First use opens Resumo; the last selected tab is validated and saved in localStorage across drilldowns, with Resumo as fallback for invalid/unavailable storage. Dados preserves the existing table, sorting, pagination and record actions when switching tabs. The modal has a fixed height of 80dvh with internal scrolling; the default table page size is 25 records. Loading retains the tab controls and selected view: grouping skeletons for Resumo, a single borderless skeleton filling the table area for Dados, and a total placeholder.
- Resumo displays the existing signed total above simultaneous responsive grouping blocks for the complete authorized selection: client/type for receipts and planned or outstanding installments, collaborator/function for remunerations, category for expenses, and movement for result or outflow comparisons. There is no grouping by month. Blocks sort totals by absolute magnitude descending with deterministic ties, preserving their displayed signs, group people by stable ID and use the same SensitiveValue protection. Outstanding groups sum outstanding value; result deductions remain signed. Empty/error states never expose stale groups.

- Collaborator names in the remuneration table open the existing employee details drawer when `org:employees:read` is granted. Monthly and total values retain their financial drilldown action; opening the employee uses its stable ID and the existing protected employee query.
- Remuneration table month values open the selected collaborator/month contributions, including an explicit empty state for zero values. The collaborator total opens contributions across the months displayed in the table, intersected with active period bounds. The same generated-remuneration scope and dimension filters apply. Native buttons support keyboard activation, hover hints and focus restoration.
- Contribution cells in the monthly balance table open their contributing records: receipt type, all entries, generated remuneration, expenses, all outflows or signed result. Outflow details show positive expense amounts so their Total matches the cell; balance details retain signed deductions.
- Overdue installment process numbers open the existing contract drawer from the dashboard when contract read permission is present. The contract query independently enforces current permission, firm and assignment scope. No new entity-detail implementation or contract lifecycle action is added to the dashboard.
- Dashboard KPI cards also activate the standalone drilldown through explicit metric source keys, using the full selected period. Help and percentage-comparison buttons retain their own tooltip interactions and do not activate drilldown.
- Honorários previstos lists initial down payments and full scheduled installments due in the period, including paid installments; it is distinct from the outstanding future-receipts chart. Honorários recebidos lists actual receipt contributions; Remunerações geradas lists generated remuneration; Despesas lists period expenses; Resultado do período shows signed receipts minus expenses.

- The drilldown context (period and filters) appears in an info tooltip beside the modal title, with an accessible description retained for screen readers.
- Every bar and monthly Result point opens a read-only modal with the exact contributing records, full BRL amounts, record count and total across all pages. Keyboard activation is supported, with focus restored on close.
- Receipt details include initial down payments and fee receipts once each. Monthly balance and Result show signed receipts and expenses, with only the signed Total in the summary; they do not represent bank balance or confirmed remuneration settlement.
- Aging and forecast details show installment face value, paid value and outstanding value at the same reference timestamp as the chart. Their total sums outstanding value. Aging includes older debts before the selected start date.
- Monthly detail periods intersect the selected month with the dashboard's effective date interval. Area, type, client, function and category details retain the active dashboard filters and financial scope. Clients are grouped by ID, including clients with identical names.
- Records are fetched on demand. A source-data mismatch refreshes the summary and shows a concise update notice with current detail totals. A filter change closes the dashboard modal; switching selections resets its pagination and cannot display a late response from the previous selection.
- The isolated drilldown feature is configurable by props and can also serve cards on registration pages. It has no dashboard, chart or entity dependency; consumers supply context, filters, query options, Zod response schema, row identity, columns and optional summaries.
- Compatible read-only listing columns may be supplied through the owning feature's public API. The modal does not inherit listing actions or URL pagination/sorting. Columns support local sorting; dashboard details start with date descending, date first and amount last.
- The dashboard omits the separate monthly balance chart because financial evolution already shows its balance line. The monthly balance detail table remains available.
- Financial evolution combines receipt and expense bars with a balance line on the same monetary axis; generated remuneration is kept outside this chart. Existing subject permissions govern each series.
- Outstanding future receipts use columns ordered as up to 30, 31–60 and 61–90 days. Aging bars remain chronological: up to 30, 31–60, 61–90 and over 90 days, rather than ranking amounts.
- Chart orientation is fixed: legal area, revenue type, remuneration assignment roles and aging use vertical bars. Clients and expense categories use horizontal bars with internal scrolling. Filtering does not change chart orientation.

### Cash balance

- Generated remuneration is a control figure and is never deducted separately from cash balance or margin. Official payroll outflows are Expense records, including PAYROLL_LAWYERS.

- KPI cards retain their existing grid. Generated remuneration remains an informational indicator outside the cash outflow calculation. Existing subject permissions and drilldowns remain applicable.

- The consolidated monthly chart and its detail table share the title Resultado mensal and the labels Entradas, Saídas and Resultado. Saídas are recorded expenses only.

- Resumo mensal appears immediately below the admin-only Resultado mensal chart, with the same minimum height and full grid width. Both use the existing authorized monthly data and month/series drilldowns. Regular users see authorized contract receipts and only their own generated remuneration; expenses and balance are excluded from this comparison chart. Existing combined revenue and remuneration grants remain required.

- Resumo por área and Resumo por tipo replace the receipt-only area/type charts. They sit side by side immediately below the monthly comparison, outside detailed-analysis toggles. Each group compares period receipts (including down payments) against generated remuneration by contract legal area or originating fee revenue type. Remuneration-only groups remain visible. Expenses are excluded; subject grants, firm and own/assigned scope apply independently. Clicking a bar opens only that series and group, with the same active period and dimensions.

- The default dashboard chart set is limited to Resultado mensal (authorized administrators), Resumo mensal (monthly), Resumo por área and Resumo por tipo. All remaining charts and analytical tables are shown only when detailed analyses are enabled; KPI cards retain their existing grid.

- Honorários and generated remuneration remain the core of the dashboard summaries. Resumo mensal, Resumo por área and Resumo por tipo use concise titles; legends and help retain the explicit labels Honorários recebidos and Remunerações geradas (own remuneration for regular users). Expenses remain separate.

- Resultado do período is the KPI aggregate; Resultado mensal is the chart and table grouped by month. Their result formula is received entries minus recorded expenses. The chart line and table result column are labeled Resultado.

- Detailed charts are ordered Honorários por cliente, Remuneração por função, Honorários em atraso, Honorários a receber, then Despesas por categoria (administrators with expense access). The first pair shows concentration and remuneration allocation; the second shows overdue and the next 90 days of outstanding scheduled receipts. Detail tables retain Resultado mensal and Remunerações por colaborador; Parcelas em atraso contains overdue installments with positive outstanding value at the reference date. These naming changes do not alter calculations.

- Detailed analysis starts with Remunerações por colaborador beside Remuneração por função. The collaborator chart is restricted to administrators with all-remuneration read access and uses the same displayed-month totals as the collaborator table; bars open the existing collaborator/month-range details. Honorários por cliente moves beside Despesas por categoria after the overdue/forecast pair.

- The Resultado mensal table keeps receipt-type details, Entradas, Saídas and Resultado. It omits generated remuneration and the duplicate Despesas column, since Saídas already equals expenses. Remuneration is reviewed in its own table and charts. Parcelas em atraso labels outstanding installment amount as Saldo em aberto, original revenue-plan total as Total do honorário, and type as Tipo de honorário. Monetary remuneration totals use decimal arithmetic before numeric presentation.

Contract client filters and fee contract/type filters are primary desktop controls beside search. Contract lists support an employee filter across active assignments, intersected with the actor's existing read scope. Employee details link to these contracts; remuneration details open the linked employee details directly when permitted (see USER_FLOWS.md). The effective dashboard date range appears next to its page title.

Primary desktop filters include client/employee in contracts, category in expenses, employee/contract in remunerations (subject to existing role restrictions), and entity type in audit logs. Financial totals remain in the primary filter bar when advanced controls expand. Contract revenues show Quitado, Parcial or Pendente from their existing payment state, including down payments. Navigation orders contracts before clients in the sidebar and dashboard creation menu. Related-record links use a consistent navigation icon and preserve authorization checks.

Revenue badges prioritize Quitado (green), then Em atraso (red) when the earliest open installment due date is before the current UTC calendar date, otherwise Parcial or Pendente. An installment due today is not overdue. This uses the existing schedule and outstanding balance, without changing financial calculations.

The Novos anexos modal accepts multiple files through selection or drag and drop, up to 10 per batch. It displays selected filenames and sizes, allows removal before submission, shows preparation and sending feedback, and retains the entire selection after failure. Oversized selections are rejected visibly without silently discarding files.

Attachment sections disable Anexar at 10 files. The batch modal shows available capacity and limits selection to remaining capacity, up to 10 files. Server checks remain authoritative if another upload changes capacity concurrently.

Upload guidance states the actual additional attachment capacity, selection/drag instructions, supported formats and per-file size limit without repeating a fixed batch allowance. Attachment lists display Enviado por with the original sender snapshot from the firm's immutable Attachment CREATE audit event. Each file in a batch records the authenticated session actor atomically with creation. Attribution uses the earliest CREATE event and does not change with later actors or account renames. Missing, blank or system-only attribution displays Autor não informado. Attachment readers receive only the sender name, without audit payloads, emails or a separate audit-read grant.

## Pending work center

Pendências lists authorized financial follow-up below Contratos. High severity: overdue unpaid installment on an active revenue with remaining balance, or a positive remaining balance after every installment number has an active receipt. Exhausted plans generate only the remaining-balance issue, avoiding duplicate date warnings for the same revenue. Medium severity: the next unpaid installment is due between today and seven calendar days ahead inclusive, on an active ACTIVE contract. Low severity: an active ACTIVE contract with at least one active revenue and all active revenues settled needs an andamento review; retaining active status may be intentional. Missing responsible/revenue warnings are excluded because creation validation owns those invariants. Optional notes/attachments and unlinked remuneration/expense comparisons do not generate alerts.

Deleted contracts are excluded. Inactive contracts retain overdue and exhausted-plan issues but not proactive reminders or settled-status review. Financial permissions scope every issue and summary. Rows disappear when the source is corrected and data refreshes. Search and checkbox filters apply to the whole collection; summaries count issues by severity and distinct contracts. Table columns support validated ascending/descending server sorting before pagination with stable identity tiebreakers. Actions open the contract finance tab and permitted client links open contextual drawers. The workspace uses the same alert definitions.

Queue follow-up presentation: the table shows only the formatted due date, without elapsed calendar days. Page alerts retain elapsed calendar days for overdue schedules; a single monetary column is labelled Saldo a receber and shows total remaining balance, including future installments. Separate Saldo vencido presentation was removed after product review. Severity cards apply their filter; Pendências clears only severity and both preserve other search dimensions while resetting page. Contract references and finance actions retain a validated pendingReturnTo context; the workspace shows Voltar para pendências and preserves context across tabs and reloads. Existing contract-list return context remains independent.

Client and employee overview pages preview up to five alerts from their related contracts using the same pending-work definitions and protected query. Exact client IDs or active employee assignments intersect the viewer's firm, contract and financial scope. The preview omits the alert/contract count sentence and links to the complete filtered pending-work list. Contract references open contextual drawers. Missing contract or receipt grants omit the preview and its query. Loading and errors with retry remain local. Client, employee and contract overview alert sections use the title Alertas and remain visible with an empty-state message when their resolved alert collection is empty. Existing permission gates still apply.

Receipt remuneration counts link to the exact receipt-filtered remuneration list when permitted. Own-only readers see Ver minhas remunerações rather than a team-wide linked count. Employee finance links to that employee's remunerations only for all-readers or the same own-scoped employee. Existing client/employee contract collections and contract finance collection links remain available; singular relationships keep contextual drawers.

Receipt and remuneration pages include an Anexos tab with expanded shared attachments; contextual drawers show the compact section. Sections require attachment read permission, and upload requires its independent grant. Files can document PIX, payments and calculation history in the supported PDF/JPG/PNG formats. Evidence remains independent of recorded amounts and payment status.

Client workspaces expose a Financeiro tab to readers with clients:read, contracts:read_all and fees:read_all grants. Its summary includes active, non-deleted contracts and revenues and active, non-deleted fees within the client and firm. Received includes revenue down payments; remaining is clamped to zero per revenue before summing. The receipt link opens the exact client-scoped active receipts collection.

Client Financeiro is the second workspace tab, before Contato. Its summary and receipts navigation are also available in the contextual client drawer under the same permissions. Employee financial pages and drawers show active, undeleted remuneration totals, restricted to read_all or read_own for the bound employee. These totals describe generated remuneration, never payment confirmation. The linked list uses the same active, undeleted scope. Remuneration pages and drawers share the Entender cálculo explanation and recorded values.

### Entity workspace consistency
Entity pages use contextual identities, shared scroll areas, and attachment visibility gated by attachment read permission. Upload controls follow owner update permission and lifecycle restrictions. Unavailable client finance and attachment tabs fall back to overview. Contract finance includes consolidated totals over active undeleted revenues. Client finance counts distinct active contracts with eligible revenues. Remuneration finance and summaries include the revenue type and assignment role. Contract teams show all non-deleted assignments, including inactive assignments without an activation badge. Only a team without non-deleted assignments shows the explicit empty state; inactive assignments do not grant operational access or financial eligibility.

For expense-only dashboard visibility (expenses allowed, revenue and remuneration denied), Despesas por categoria is a primary chart independent of the detailed-analysis preference, including its empty state. The detailed-analysis toggle is hidden only for this visibility combination; mixed-access dashboards retain their existing behavior.

Attachment rows retain the filename title and group size, date and sender on a single metadata line. Long sender names truncate visually and remain available through the full-text tooltip.

### Contract payment summary

Collapsed contract revenue summaries show the total, down payment and installment amounts calculated from the remaining principal. Detail drawers and workspaces show the total with the payment summary in parentheses and retain the separate down-payment field; receipt totals use the label Recebido. Expanded revenue forms show only the installment summary beside the full-column installment input, left-aligned and vertically centered with the input and removal button, because the down-payment input is already visible. Skeletons mirror this layout. Installment summaries divide the remaining principal by the installment count and round the displayed amount to currency precision; full down payment is identified as full payment. Incomplete or invalid form values show a pending payment summary.


## Active/inactive interface scope

Only clients and employees expose active/inactive controls and indicators in forms, summaries, pages, cards and tables. Contracts retain their lookup-backed andamento. Contracts, assignments, revenues, fees, expenses and remunerations do not expose active/inactive management in the interface. Deleted-state indicators and delete/restore actions remain available. Prisma models, persisted flags, server eligibility rules and existing data are unchanged; creation keeps existing defaults and editing preserves saved activation values.

- Contract revenue cards provide an initially collapsed Ver parcelas accordion for receipt readers. Expanded details show every planned installment, due date, planned amount, actual receipt date/amount, remaining balance and status. Unpaid balances past due are Em atraso; settled rows are Recebida; positive incomplete receipts before/on due date are Parcial; other unpaid rows are Pendente. Entry stays in the existing summary without an invented receipt date. Financial amounts respect value masking; existing branch and assignment scopes apply.

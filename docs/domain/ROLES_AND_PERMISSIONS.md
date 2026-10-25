# Roles And Permissions

## Clerk authority

Clerk exclusively owns authentication, Organization memberships, roles and permission grants. Firm is an independent business unit; Employee is a business entity; Clerk privateMetadata.employeeId optionally identifies an active collaborator. Organization membership does not define a firm access boundary. Missing membership denies product access. An explicit invalid or inactive/deleted employeeId binding denies the session; an absent binding disables own/assigned capabilities only. A role name never bypasses a permission check.

Business permissions use `org:<feature>:<permission>`. See the approved catalog in `src/shared/session/schema.ts` and deployment guidance in `docs/implementation/CLERK_MIGRATION.md`. Read, create, update, delete, restore and export grants are independent. `manage` is explicit only for account administration. Provider `sys_*` permissions retain their native purpose.

The following matrix describes initial role presets to configure in Clerk, not immutable application grants. Future custom roles may differ. Native RBAC is the current scope; no per-user grant exceptions. All references to administrator-only behavior below mean the corresponding explicit permission in the initial preset.

## Initial roles

- `Administrator`: full firm-scoped operational access.
- `User`: restricted access scoped to assigned contracts and own financial visibility, while still participating in core workflows allowed by the product.

## Permission Matrix

| Capability | Administrator | User |
|---|---|---|
| Access employee management screen | Yes | No |
| View all clients | Yes | Yes |
| Create or update clients | Yes | Yes |
| Delete or restore clients | Yes | No |
| View all contracts | Yes | No, only contracts visible by assignment role |
| Create contracts | Yes | Yes |
| Update assigned writable contracts | Yes | Yes, when assigned and writable |
| Assign or remove employees from a contract | Yes | Yes, when assigned and writable |
| Delete or restore contracts | Yes | No |
| View revenues and fees | Yes | No, only fees on allowed contracts |
| Create or update revenues and fees | Yes | Yes, within allowed contract boundaries |
| Delete or restore revenues and fees | Yes | No |
| View expenses | Yes | No |
| Create, update, delete, or restore expenses | Yes | No |
| View own remunerations | Yes | Yes |
| View all remunerations | Yes | No |
| Edit remunerations | Yes | No |
| Delete or restore remunerations | Yes | No |
| View dashboard | Yes, firm-wide | Yes, scoped |
| Export remunerations | Yes, firm-wide | Yes, scoped |
| Upload and view attachments | Yes | Yes |
| Delete attachments | Yes | No |
| View audit log | Yes | No |
| Manage employee accounts | Yes | No |
| Reset collaborator password | Yes | No |

## Permission Baseline

- All authenticated users may access the application shell.
- Administrators manage employee accounts, full financial visibility, audit logs, and restore/delete operations.
- Account managers assist with Clerk recovery; the application never generates temporary passwords.
- Regular users must not access administrative account management or firm-wide confidential financial views.

## Visibility Rules

- Administrators see firm-wide clients, contracts, fees, revenues, and remunerations.
- Administrators see firm-wide expenses.
- Regular users see all clients but only the contracts and fees allowed by their assignment-based visibility rules.
- Regular users do not access the expenses route.
- Regular lawyers see contracts only when actively assigned as responsible or recommended.
- Regular lawyers do not gain contract visibility from recommending assignments alone.
- Regular administrative assistants continue seeing contracts where they are actively assigned as admin assistants.
- Regular users only see their own remunerations and own dashboard-scoped financial data.
- Regular users must not see dashboard cash-flow surfaces that derive values from firm-wide expenses or consolidated firm balance.
- "Allowed contract boundaries" means the actor is inside the same firm, is assigned where assignment-based visibility is required, and the target resource remains writable by lifecycle rules.

## Protected Actions

- Delete and restore actions are administrator-only.
- Audit log access is administrator-only.
- Manual remuneration edits are administrator-only.
- Contract status lock management is administrator-only.
- Employee management is administrator-only.
- Attachment deletion is administrator-only.

## Shared Operational Actions

- Authenticated users may create and update clients within product rules.
- Authenticated users may create contracts within product rules.
- Authenticated users may create and update contracts, revenues, fees, and assignments only within their allowed visibility and lifecycle boundaries.
- Authenticated users may upload and view attachments within permitted contexts.

## Screen Access Overview

| Screen | Access |
|---|---|
| Login | Public |
| Password Reset | Public |
| Dashboard | Authenticated and role-scoped |
| Clients | Authenticated |
| Contracts | Authenticated and role-scoped |
| Fees | Authenticated and role-scoped |
| Expenses | Administrator only |
| Remunerations | Authenticated and role-scoped |
| User Management | Administrator only |
| Audit Log | Administrator only |

## Access Policy Notes

- Route-level access may block entire screens early.
- Server-side policy remains authoritative even when the UI already hides actions.
- Non-admin contract edits are only valid while the contract is still writable and assigned to the actor.
- Session policy must stay aligned with this matrix and with the domain business rules.
- Dashboard and export scope must follow this matrix consistently.
- Dashboard cash-flow summaries that combine honorários, remunerações, and despesas are administrator-only because expenses are firm-wide financial data.

## Permission Contract

- Clerk permission checks are mandatory; local UserRole values are not authorization authority.
- UI affordances and server-side enforcement must agree.
- Role or visibility decisions must derive from authenticated session context, never from client-submitted authority claims.

## Business and authentication isolation

See `DOMAIN_MODEL.md` for ownership. Own and assigned permissions require a valid optional Clerk privateMetadata.employeeId. Organization membership does not confer firm-specific access; metadata-based firm restrictions are future work. Account administration occurs in Clerk Dashboard.
## Dashboard subject permissions

Dashboard read_all/read_own or expenses:read permits entry, not access to every financial subject. Dashboard data reads additionally require fees:read_all/read_assigned for receipts, schedules, debt and revenue breakdowns; remunerations:read_all/read_own for generated remuneration cards, charts and tables; expenses:read for expense cards and breakdowns. Missing subject grants skip database reads and remove related payload data and UI surfaces. Dashboard-wide access never upgrades assigned/own subject grants, and client employee filters never override the authenticated employee for restricted grants. Missing employee bindings yield no own/assigned records.

Consolidated balance and cash-flow tables require dashboard:read_all, dashboard:read_cash_flow, fees:read_all, remunerations:read_all and expenses:read together, without allocation dimensions. Combined revenue/remuneration charts require both subjects. Expense-only users receive only expense metrics and breakdowns. Employee filter options additionally require employees:read. Dashboard lookup queries do not call contract endpoints without contract read grants.

### Dashboard permission matrix

Every row requires an authenticated session and `org:dashboard:read_all` OR `org:dashboard:read_own` OR `org:expenses:read`. These grants allow entry only; subject grants below remain mandatory.

| Alias | Additional grants |
|---|---|
| R | `org:fees:read_all` OR `org:fees:read_assigned` |
| M | `org:remunerations:read_all` OR `org:remunerations:read_own` |
| D | `org:expenses:read` |
| B | `org:dashboard:read_all` AND `org:dashboard:read_cash_flow` AND `org:fees:read_all` AND `org:remunerations:read_all` AND `org:expenses:read` |

| Surface | Display label | Additional grants | Conditions |
|---|---|---|---|
| Card | Resultado do período | B | No employee, legal-area or revenue-type filter |
| Card | Honorários previstos | R | Authorized contract scope |
| Card | Honorários recebidos | R | Authorized contract scope |
| Card | Remunerações geradas | M | Authorized remuneration scope |
| Card | Despesas | D | Firm expenses within the period |
| Chart | Evolução financeira | R AND M | Expenses and result series additionally require B with no allocation dimensions |
| Chart | Saldo mensal | B | No employee, legal-area or revenue-type filter |
| Chart | Remuneração por função | M | Authorized remuneration scope |
| Chart | Despesas por categoria | D | Shown when expense breakdown contains data |
| Chart | Honorários em atraso | R | Authorized contract scope |
| Chart | Honorários a receber | R | Authorized contract scope |
| Chart | Honorários por cliente | R | Authorized contract scope |
| Chart | Receita por área | R | Authorized contract scope |
| Chart | Receita por tipo | R | Authorized contract scope |
| Table | Saldo mensal (cash flow) | B | No employee, legal-area or revenue-type filter |
| Table | Remunerações | M | Own or firm scope according to grants |
| Table | Parcelas em atraso | R | Authorized contract scope |
| Filter | Colaborador | `org:dashboard:read_all` AND `org:employees:read` | Selection never overrides own/assigned subject scope |
| Filter | Área | Options require `org:contracts:read_all` OR `org:contracts:read_assigned` | Hidden when neither fee nor remuneration data is authorized; options require contract read grants |
| Filter | Tipo de receita | Options require `org:contracts:read_all` OR `org:contracts:read_assigned` | Hidden when neither fee nor remuneration data is authorized; options require contract read grants |
| Filter | 6M, 12M, year, date bounds and Mais filtros | No additional grants | Applies only to authorized data |

#### Scope and enforcement

- `read_assigned` limits receipts to permitted active contract assignments; `read_own` limits remuneration to the authenticated employee.
- Dashboard-wide grants do not upgrade subject grants. Employee query parameters cannot impersonate another employee under restricted scope.
- Missing employee bindings return no own/assigned records. Firm isolation applies to every query.
- Unauthorized subject queries do not execute; related values are removed from the server response as well as hidden in the UI.

#### Drilldown permissions

- Opening a collaborator from the remuneration table additionally requires `org:employees:read`; remuneration read permission alone does not enable employee details. The existing employee detail query rechecks permission and firm scope.
- Collaborator/month and collaborator total details require M alone and retain the server's own/collaborator scope. All monetary cells in the monthly balance table inherit B; monthly outflow details also require B. Opening a contract from overdue installments additionally requires `org:contracts:read_all` or `org:contracts:read_assigned`; the existing contract detail query rechecks firm and assignment constraints independently.
Every dashboard detail request, including refreshes and retries, rechecks current dashboard access and the corresponding subject grant on the server. Revenue by month/area/type/client and aging/forecast require R; remuneration by month/function requires M; expenses by month/category require D. Monthly receipt/remuneration details also require evolution availability (R AND M); its expense series requires B without allocation filters. Monthly balance and Result composition require B and no employee, legal-area or revenue-type allocation filters. Own/assigned scope is identical to the aggregate; props, group IDs and collaborator filters never grant additional access. Denials expose no restricted rows, counts or totals. Card details use the same grant as their card: R for planned/received revenue, M for generated remuneration, D for expenses, and B without allocation dimensions for period Result. Single-subject cards do not require the combined evolution chart grants. The standalone modal has no permission registry: each consumer's server source enforces its own access policy.
- An expense-only actor receives only expense cards and breakdowns, without fee, remuneration or consolidated balance data.
- Expense-only dashboards hide area/type controls and their active chips on desktop and mobile. Period filters remain available. For other subject combinations, options still require contract read grants.
- Tables currently use desktop visibility classes; permission alone does not make them visible on small screens.

## Pending work access

Pendências requires contracts:read_all or contracts:read_assigned. Every record and summary retains firm ownership and existing contract assignment visibility. Every financial issue (overdue, upcoming, exhausted plan and settled-contract review) additionally requires fees:read_all or fees:read_assigned independently; an all-contract grant does not widen assigned financial scope. Missing/invalid employee bindings do not grant assigned reads; recommending-only participation grants no visibility. Counts are computed after subject authorization. Links to clients require clients:read. The contract workspace applies the same financial subject check to its alerts.

## Financial attachment access

Receipt and remuneration attachment operations require the corresponding `org:attachments:read`, `org:attachments:upload` or `org:attachments:delete` grant plus parent financial read access. Receipts use `org:fees:read_all` or eligible `org:fees:read_assigned`; remunerations use `org:remunerations:read_all` or `org:remunerations:read_own` against the persisted beneficiary. Upload does not require financial update permission and remains available after contract completion/cancellation. Deleted owners or financial ancestors block new uploads. Download and deletion recheck persisted subject scope. Attachment grants alone never grant financial visibility.

## Context

The repository uses TanStack Start, Prisma 7/PostgreSQL, Zod, TanStack Query and TanStack Form. `shared/session/server.ts` resolves a Supabase user into an Employee; `access.ts`, `permissions.ts`, `scope.ts`, selectors, feature queries, and UI consumers currently derive authority from local role values. Employee account operations use Supabase admin APIs. Attachment storage uses a separate HTTP adapter and remains unchanged.

The user explicitly selected Clerk for both authentication and authorization. This proposal changes provider ownership, not the repository architecture. Administrator and User are initial migration presets; they must not remain runtime authorization switches.

## Goals / Non-Goals

**Goals:** Clerk owns identity, credentials, session policy, membership, roles and permission grants; operators change grants without application deployment. Preserve firm isolation, assignment visibility, own remuneration visibility, lifecycle invariants, audits, safe pt-BR UX, and house structure.

**Non-Goals:** DB-host or file-storage migration; replacing business assignments with Clerk organizations per contract; introducing a second authorization vendor; claiming native arbitrary record-level policy administration in Clerk.

## Decisions

### 1. Official framework integration

Use `@clerk/tanstack-react-start`, following its current quickstart and compatible package versions. Add `src/start.ts` request middleware and root `ClerkProvider`; explicitly preserve server-function CSRF protection with TanStack's recommended CSRF middleware. Clerk middleware resolves authentication but does not protect every route automatically. Keep `_app`/`_auth` layouts, `beforeLoad` guards, safe internal redirects, and protected server-function middleware.

Provider authentication is Clerk's source of truth. The existing session query becomes a Zod-validated domain projection keyed by Clerk user, session and active organization, not a separate session mechanism. Clear protected Query caches on logout, expiration, actor/organization changes and authorization refresh; late responses from the previous context cannot repopulate the new cache. Pending Clerk sessions cannot call business APIs.

Alternative rejected: generic React-only or Next.js SDK recipes, custom JWT/cookie refresh and duplicate browser authentication stores.

### 2. One organization per firm; explicit identity mapping

Add unique nullable `Firm.clerkOrganizationId` and `Employee.clerkUserId` string fields for staged backfill. Resolve a verified Clerk user and active organization to an active, non-deleted Employee belonging to that mapped Firm. Require actual organization membership. Missing, mismatched or duplicate mappings deny access. Do not infer grants from email, request firm IDs, unsafe metadata, local UserRole or employee type.

Employee and Firm remain business records with integer IDs. Employee type, OAB, assignments, audit actor IDs, financial fields and lifecycle status remain domain data. Remove UserRole as a source of authority; remove its editable employee form field and retire the unused lookup/model only after auditing all references and migrations. Clerk role labels can be projected for display but cannot become a local grant table. Seed/bootstrap must not reintroduce grants from local lookups.

A Clerk User may belong to multiple organizations, but this change does not redesign Employee identity cardinality or globally unique employee emails. A user with no matching Employee in the active firm receives no product access. Organization creation and membership invitation are restricted to authorized administrative operations; personal accounts and arbitrary self-service firm creation cannot bypass onboarding.

### 3. Permission checks replace role matrices

Use Clerk Custom Permissions and SDK `has({ permission })` on authenticated server context. Keep a typed application vocabulary mapping operations to permission keys; it defines checks, not which roles receive permissions. Missing permissions deny, including for a role named `org:admin`. Clerk System Permissions are not substitutes for custom application grants. Do not enable Clerk Billing merely to implement authorization.

Approved feature/action catalog:

All application permission keys follow Clerk's current `org:<feature>:<permission>` format, with English lowercase feature/action identifiers and underscores for compound names. Use native action terms such as `read`, `create`, `update`, `delete`, `manage`, and explicit scoped variants only when needed to preserve domain visibility. A `manage` key is an explicitly checked application capability, not an automatic wildcard or implicit grant of unrelated actions.

Clerk's `org:sys_domains:read`, `org:sys_domains:manage`, `org:sys_billing:read`, and `org:sys_billing:manage` are provider System Permissions, not naming templates for custom business features. Keep those exact provider keys for their native Clerk purpose; do not invent `sys_` business features. Business examples are `org:contracts:read_assigned`, `org:contracts:update_all`, `org:employees:update`, and `org:accounts:manage`. System Permissions are absent from session claims and must not be checked as though they were Custom Permissions through server-side `has()`.

Feature identifies the business resource, never an action. For example, feature `clients` plus permission `read` produces `org:clients:read`; do not create `client_read` or `clients_read` as the feature/action pair.

| Feature | Permissions |
|---|---|
| `clients` | `read`, `create`, `update`, `delete`, `restore` |
| `contracts` | `read_all`, `read_assigned`, `create`, `update_all`, `update_assigned`, `delete`, `restore` |
| `fees` | `read_all`, `read_assigned`, `create`, `update`, `delete`, `restore` |
| `expenses` | `read`, `create`, `update`, `delete`, `restore` |
| `remunerations` | `read_all`, `read_own`, `update`, `delete`, `restore`, `export_all`, `export_own` |
| `attachments` | `read`, `upload`, `delete` |
| `employees` | `read`, `create`, `update`, `delete`, `restore` |
| `accounts` | `manage` |
| `audit_logs` | `read` |
| `dashboard` | `read_all`, `read_own`, `read_cash_flow` |

Employee route/list/detail access checks `org:employees:read`; creation checks `create`, editing checks `update`, and lifecycle actions check `delete` or `restore` respectively. None substitutes for another. Access provisioning, role assignment, revocation/restoration and recovery assistance check `org:accounts:manage` plus same-firm target validation. A user may receive read access to employee data without account-management authority.

Contract employee assignment operations use the appropriate `contracts:update_all` or `contracts:update_assigned` capability plus existing assignment/lifecycle validations. Contract lock management uses `contracts:update_all` and the existing lock business assertions. This catalog does not add separate assignment/lock keys implicitly. Revenue operations, not listed separately in the agreed catalog, must receive an explicit action mapping during the implementation inventory before their checks are changed; never infer that fee grants automatically authorize revenue changes. Any additional feature/key needed for uncovered operations must be recorded in this catalog and specs before provisioning.

For fee `create`/`update`, contract read scope does not automatically grant writes: the action grant is required and persisted contract visibility/assignment/writability must also qualify. `manage` is reserved here for the explicitly grouped account-administration operations, not broad CRUD grants across business resources.

Implementation must inventory every existing action/route/query, produce the complete finite key catalog and initial grants matching today's Administrator/User behavior, and verify Clerk's actual plan/permission limits before provisioning. Ordinary resource restrictions cannot become an admin wildcard. New custom roles work through their granted keys with no new code branches. Granting `read_all` never grants `update_all`, export, delete, or cash flow implicitly.

`hasPermission(session, key)` performs an exact array membership check using the native Clerk key. Call sites use `org:<feature>:<permission>` directly, without local action aliases or a translation table. `can`, `assertCan` and `getScope` additionally enforce resource/domain boundaries where needed. If a helper needs request-only SDK context, resolve the provider decisions server-side and expose only a safe capability projection to client UI. Never accept a browser-provided projection as authority. Never serialize SDK functions, secret keys or whole provider user objects.

### 4. Exact boundary of centralized authorization

Clerk grants whether someone has all-firm, assigned-contract or own-record capabilities. Prisma applies those capabilities to persisted firm IDs, assignment relationships and ownership. For example, `read_assigned` filters active RESPONSIBLE/RECOMMENDED lawyer assignments or ADMIN_ASSISTANT assignments as documented; RECOMMENDING alone does not qualify. No permitted scope means denial, not an unfiltered query.

Lists, counts, options, details, mutations, exports, dashboards, derived totals and attachment owner access use the same resolved scope. Completed/cancelled-contract write protection remains a business assertion. An all-firm permission still cannot cross firm boundaries. This is enforcement of Clerk grants against domain facts, not a fixed role-to-permission matrix.

Clerk Organizations RBAC does not make arbitrary per-contract relationship policies editable in its dashboard. Do not store growing contract ACLs in token/user metadata or create an organization per contract. If the user requires that stronger interpretation of "all authorization", stop that implementation slice and document the product mismatch rather than silently inventing Clerk functionality.

### 5. Prefer Clerk-native authentication experience

Use prebuilt Clerk SignIn and account management components with pt-BR localization, wrapped in feature-owned presentation components. This is a documented exception for Clerk-owned authentication/account widgets, not permission to import vendor UI primitives in routes/features. Product UI outside those widgets continues through shared UI exports. Provider widgets do not require mirroring their internal forms in TanStack Form.

Use email-based sign-in and recovery initially. Retire OAB login: OAB is unique per firm, while Clerk usernames are unique per instance. Keep OAB as a business field; do not silently impose global OAB uniqueness or expose public employee-to-email lookup. Public registration is restricted; invitation acceptance may create an identity but not grant product access until organization membership and Employee mapping exist.

Use Clerk invitations/account setup and provider recovery rather than exposing admin-generated temporary passwords. Retire local `mustChangePassword` authority and the bespoke forced-change screen after handling existing flagged accounts through a verified Clerk setup/reset path. Clerk pending session tasks remain mandatory. Do not claim compromised-password reset tasks are a generic forced temporary-password mechanism.

Replace per-login 24-hour/7-day remember-me behavior with Clerk Dashboard session settings. Configure documented supported settings, verify production entitlements, record selected durations, and remove the misleading custom checkbox. Password policy and attack/enumeration protection are provider-managed; do not promise the old exact five-attempts-per-minute algorithm without documented support. Preserve safe feedback, safe redirects, credential-free URLs, and protected-cache clearing. These are intentional changes to canonical product docs, not unnoticed compatibility losses.

### 6. Lifecycle and consistency

Keep employee operational access actions within `features/employees/api`, provider orchestration in its `data` layer using shared Clerk server infrastructure, and UI coordination in feature hooks. All actions require appropriate custom permissions and firm-scoped target validation. Membership removal revokes access to that firm; restoration recreates membership with explicitly selected authorized grants, never silently promotes. Account-wide bans are reserved for explicit global operations, since a firm action must not disable other memberships.

Treat provisioning and role assignment as distributed operations: Prisma transactions cannot include Clerk atomically. Use repeatable external identity references, persisted reconciliation state where necessary, compensating/retry actions, and safe pending/error states. Do not report success before required identity/membership/link steps succeed. Keep audit history without secrets. Restrictive employee updates deny locally immediately even if provider synchronization needs retry.

Verified webhooks reconcile user/organization/membership changes. Validate raw request signature with the supported Clerk webhook helper, deduplicate event IDs, handle retries/out-of-order delivery by reading current provider state, and avoid resurrecting deleted/revoked state from old events. Webhooks are eventual consistency, not the synchronous authorization gate. On localhost use documented webhook forwarding/tunneling during testing.

For protected requests, require current membership; for mutating or sensitive reads/exports also evaluate current Clerk role/permission configuration through the Backend API before execution, failing closed on uncertainty. Do not assume cryptographic verification of an old token proves membership or grants are still current. Client capability snapshots may lag and are advisory. Benchmark provider calls/rate limits; introduce request-local reuse, not an indefinite cross-request permission cache. Record and test any provider propagation limits before cutover.

### 7. Contract and structure changes

Before runtime changes, update owning documents: PRODUCT_SENSE, DOMAIN_MODEL, BUSINESS_RULES, ROLES_AND_PERMISSIONS, FEATURE_BEHAVIOR, LOOKUP_VALUES, USER_FLOWS, EDGE_CASES, SUCCESS_CRITERIA, ARCHITECTURE, DATA_ACCESS, FRONTEND and SECURITY; review QUERY_BEHAVIOR, CONVENTIONS and QUALITY_WORKFLOW for affected references. Existing role wording elsewhere means initial provisioned presets, not hard-coded grants. Inventory main OpenSpec specs for overlapping old role/credential statements and align them in the implementation change before archive.

Keep framework glue in root/start routes, Clerk server/client configuration in shared infrastructure, generic session integration in `shared/session`, business identity operations in employees, and auth widgets/hooks in authentication. Validate external payloads/read models with nearby explicit Zod schemas. Keep feature barrels minimal, routes thin, permission keys stable, query hooks feature-owned, and existing testing/import boundaries intact. Add validated Clerk publishable/secret/webhook configuration without exposing server env to the browser. Remove auth-only Supabase dependencies/config when unused; retain Storage requirements.

## Risks / Trade-offs

- [Clerk becomes hosted authority] → Document availability dependence and API limits; never fall back to a local admin role.
- [RBAC cannot express arbitrary record policies] → Explicit scoped permissions plus domain data enforcement; do not claim a full external relationship engine.
- [Stale session claims or delayed webhooks] → Current provider checks for membership and sensitive operations; request-local reuse and tested fail-closed behavior.
- [Plan entitlements differ between development and production] → Verify roles/custom permissions/session settings and permission-count limits before provisioning/cutover.
- [Distributed provisioning fails halfway] → Idempotency, reconciliation, pending state and compensations; deny unmatched identities.
- [UX changes remove OAB/temporary password/remember-me] → Update docs and screens together; test migration reset and invitation flows in pt-BR.

## Migration Plan

1. Update contract; inventory all authority consumers and finalize permission catalog and initial grants. Resolve SDK compatibility and production entitlements.
2. Create development Clerk configuration, organizations and role grants; add nullable mappings with a generated Prisma migration using repository workflow only on a disposable local DB. Never run reset-first workflow against existing production data.
3. Dry-run migration inventory for enabled, revoked, inactive, deleted and forced-reset users; preserve Employee IDs/audit actors and export a secure old-to-new mapping. Import supported hashes only after validating Clerk migration requirements and access to the source digest; otherwise use provider setup/reset. Never copy plaintext passwords into repo/logs. Default cutover uses a maintenance window, not dual-provider runtime fallback.
4. Provision Clerk users/memberships repeatably; map Firm and Employee records explicitly, preserve revoked state, and verify assignments and scopes with at least two firms. Bootstrap administrative membership out of band without an application bypass.
5. Switch runtime to Clerk; require fresh login; test user/admin/custom-role flows, dashboard/export scopes, password setup/recovery and permissions changed in Dashboard. Verify signed-out/pending/missing-link/removed-membership denial.
6. Reconcile users and grants; retain restricted rollback mapping for a defined cutover window. Only then retire Supabase Auth secrets/libraries and local auth-role fields; retain Storage configuration and historical migrations.
7. Rollback before destructive cleanup restores previous deployment and compatible mappings from backup, revokes new sessions, and reconciles any account/grant changes made since cutover. A binary rollback without identity reconciliation is insufficient. After cleanup use a forward recovery or tested restore procedure.

## Open Questions

- Deployment prerequisites to record during implementation: Clerk project/keys, chosen production plan, custom-permission count, session durations, domain/DNS and invitation email delivery. No account changes are performed by this proposal.
- Source password digest availability determines hash import versus provider account setup; do not make successful hash import an assumption.
- Native Clerk configuration governs session/security settings; exact legacy duration/attempt thresholds are intentionally superseded.

## Documentation Sources

Official documentation checked 2026-10-22, including Context7 `/clerk/clerk-docs`. Recheck installed-version APIs at implementation time.

- https://clerk.com/docs/tanstack-react-start/getting-started/quickstart
- https://clerk.com/docs/reference/tanstack-react-start/clerk-middleware
- https://clerk.com/docs/guides/secure/authorization-checks
- https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions
- https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options
- https://clerk.com/docs/reference/backend/user/create-user
- https://clerk.com/docs/guides/configure/session-tasks
- https://clerk.com/docs/guides/development/webhooks/syncing
- https://clerk.com/docs/guides/development/migrating/overview

## Implementation decisions confirmed with user

- Email or Clerk username sign-in is permitted (user decision during implementation). OAB remains domain-only. Clerk owns global username uniqueness and credential validation.
- Additive identity migration was generated offline via Prisma diff, then applied to existing Supabase using migrate deploy; no reset occurred. Canonical DATA_ACCESS.md documents this exception.
- Keep legacy identity/role/forced-reset columns during the rollback window; they no longer grant runtime authority. Retirement is a subsequent generated migration after full account reconciliation.

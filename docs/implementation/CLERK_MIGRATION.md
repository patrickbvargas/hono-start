# Clerk migration and deployment

## Approved financial redesign — target precedence

Status: approved plan, not implemented. [Target financial contract](../domain/FINANCIAL_SYSTEM.md) and its linked roadmap/UML/authorization supersede conflicting financial and identity semantics below for the ordered redesign. Remaining text describes the preserved running baseline and unchanged house rules; do not infer target implementation from it.

Target role and binding transition is planned in FINANCIAL_AUTHORIZATION.md and finance-02. Verify production limits, prepare Member/Admin grants and personId binding; legacy employeeId and fee/remuneration keys remain baseline only until coordinated switch. No automatic widening of Member receipt registration.


## Authority and boundaries

Clerk is the runtime authority for identity, sessions, Organization membership,
roles and permission grants. The application enforces firm isolation, active
Employee mappings, persisted assignment scopes and business lifecycle rules.
No local role name grants access. Native RBAC is sufficient for this release;
future exceptions require a specific Clerk role, not per-user overrides.

Implementation and deployment verification are tracked under `openspec/changes/migrate-to-clerk-first`. Production cutover remains separate from development bootstrap.

## SDK compatibility

- `@clerk/tanstack-react-start` 1.7.5 requires Start >=1.168.10 and Router >=1.170.7.
- Pin Start 1.168.61 and Router 1.170.42 to retain Vite 7 compatibility.
- SSR Query integration 1.167.3 and React Query 5.104.5 are aligned with these versions.
- `@clerk/localizations` 4.24.0 provides `ptBR`.
- `src/start.ts` explicitly retains CSRF protection for server functions.
- `clerkMiddleware` supplies verified auth context; it does not protect routes.
- `clerkClient()` is synchronous in this SDK; `auth()` is asynchronous.
- Backend `organizations.getOrganizationMembershipList` supports filtering by
  `userId: [userId]` and returns current membership `permissions` and `role`.
  Use current provider state, fail closed on errors, and do not use role-name
  bypasses or webhook delivery as authorization authority.

## Environment

Copy names from `.env.example`; keep actual values in ignored `.env`.
`VITE_CLERK_PUBLISHABLE_KEY` is public. `CLERK_SECRET_KEY` and
`CLERK_WEBHOOK_SIGNING_SECRET` must remain server-only.
Attachments require private R2 configuration; see ATTACHMENTS.md.

Configure Clerk email or username sign-in, restricted onboarding, Organizations and pt-BR
widgets. Disable unrestricted user Organization creation. Configure production
domain, email delivery, session lifetime and security policy in Clerk.
Production entitlements, role and permission limits must be checked against the
actual instance before cutover; no plan availability is assumed.

## Permission catalog and domain mappings

`src/shared/session/schema.ts` defines the finite business feature/action names.
It is a vocabulary for checks, not a role-to-permission grant matrix. Assign
grants to roles in Clerk. `org:sys_*:*` remains Clerk-owned System Permissions.
Account administration occurs in Clerk Dashboard. The unused org:accounts:manage application grant is retired.

Contract team changes require `update_all` or `update_assigned` plus persisted
assignment and writable-contract checks. Lock/status administration requires
`update_all` plus lifecycle validation. Revenue plans are part of the Contract
aggregate: creation uses contract create; subsequent create/update/delete/
restore uses the corresponding contract update/delete/restore permission and
the same assignment and lifecycle constraints. Fee permissions never implicitly
authorize editing revenue plans. All read/write/export grants are independent.

## Database prerequisite

Add nullable unique Clerk Organization/User string links while preserving
integer business IDs and legacy mappings for rollback. Generate migrations using
the canonical reset-first workflow **only against a disposable local database**.
Never reset the currently configured database without identifying it as disposable.
Docker must be running before provisioning an isolated local PostgreSQL database.

## Cutover gates

1. Finish all implementation and automated checks in the OpenSpec tasks.
2. Verify production configuration and role grants in the actual Clerk instance.
3. Inventory all enabled/revoked/inactive/deleted/forced-reset accounts in dry run.
4. Back up DB and restricted identity mappings; preserve revoked access.
5. Rehearse with two firms and representative accounts. If supported password
   hashes are unavailable, use Clerk setup/recovery; never log credentials.
6. Enter a maintenance window, reconcile identities, deploy and require fresh
   login. Validate provider permission removal and membership removal immediately.
7. Retain legacy mappings for the agreed rollback window. Reconcile account/grant
   changes before rollback; reverting a binary alone is insufficient.
8. Remove legacy persistence only after verified backfill and rollback window.

Real login, invitation delivery, permission propagation, provider API limits,
webhook forwarding and production plan settings require actual Clerk access.

## Official references

- https://clerk.com/docs/tanstack-react-start/getting-started/quickstart
- https://clerk.com/docs/reference/tanstack-react-start/clerk-middleware
- https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions
- https://clerk.com/docs/reference/backend/organization/get-organization-membership-list

## Development status (2026-10-22)

- Additive Prisma migration `20261022140000_clerk_identity_links` was generated
  offline with Prisma and applied to the existing Supabase DB with `migrate deploy`.
  No database reset or hosting change occurred.
- Clerk development instance accepted the approved 43 custom permissions.
- Initial `org:admin` has the business catalog; `org:member` has the previous
  assigned/own baseline. Native System Permissions were preserved. Bootstrap
  presets live only in `scripts/clerk-setup.ts`, outside runtime authorization.
  Do not rerun `--apply` after intentionally customizing these initial roles.
- At the user's explicit request, Clerk Patrick maps to Employee 1 (Admin Sistema)
  and Matriz maps to the existing Hono Organization. Other employees were not
  automatically given access. Legacy Supabase identity columns are retired by the post-cutover cleanup migration.
- Complete Clerk keys are present in ignored local env. No webhook signing
  secret is configured; the webhook endpoint fails closed with 503 until configured.
- Actual production plan entitlements, email delivery, two-firm user rehearsal,
  webhook delivery and quantitative rate-limit/propagation testing remain deployment
  prerequisites. Do not assume development-instance success proves production limits.

## Operator commands

- `pnpm exec tsx scripts/clerk-readiness.ts`: read-only provider/DB inventory.
- `pnpm exec tsx scripts/clerk-setup.ts`: preview missing keys and initial presets.
- `pnpm exec tsx scripts/clerk-setup.ts --apply`: development-only initial setup.
The one-time migration tooling has been retired after completed Clerk cutover.

## Local provider configuration

Enable email verification/sign-in and invitation-restricted onboarding. Invitation
setup is `/convite`; public sign-in/recovery uses hash routing. Configure `APP_URL`
(default `http://localhost:3000`) to generate invitation redirects for the actual
local/deployed origin. Disable unrestricted Organization creation in Clerk.

Configure a development HTTPS forwarding tunnel for `/api/webhooks/clerk`, register
that URL in Clerk Webhooks and store its signing secret in local env. Subscribe to
user lifecycle and Organization membership events. The receiver verifies signatures,
records delivery IDs and reconciles known links using current provider state.
Provider grant/membership removal is enforced synchronously without webhooks.

## Legacy persistence retirement

Clerk migration is complete. Legacy auth identity and forced-password fields are retired.
The one-time clerk-migration script has been removed. Historical migrations remain.
Apply the pending Prisma migration during deployment; application cleanup does not execute it.
UserRole remains historical business data and grants no runtime authority.

User decision: enable both email and globally unique Clerk username sign-in.
This does not restore OAB login or application-owned identifier resolution.
In Clerk Dashboard → User & authentication, enable **Email → Sign-in with email**
and **Username → Sign-in with username**. The prebuilt widget follows these
provider settings; changing application labels cannot enable an identifier.

Local verification: 436 tests passed across 113 files; focused employee access
checks passed again after the final access-link adjustment. Biome, TypeScript
and strict OpenSpec validation passed. The login widget rendered without console
errors. After the Dashboard correction, the provider environment endpoint
confirmed both email and username enabled for sign-in. Browser verification then
completed real password sign-in independently with email and username, linked
Patrick to Admin Sistema, loaded the dashboard and Clients, retained the session
after reload, and confirmed logout blocks a direct Clients URL and preserves its
destination for the next sign-in. The final production build also passed.

Running the production build alongside Vite development invalidated development
server-function manifests once; restarting Vite resolved the undefined data
response. Keep build and interactive development verification sequential.

## Current identity setup

Manage accounts and grants in Clerk Dashboard. Every application account, including administrators, must set User privateMetadata to {"employeeId": 123}, referencing an active, non-deleted Employee. Missing, malformed or unavailable Employee mappings deny all protected access. Do not use unsafeMetadata. Employee CRUD does not create, invite, modify or delete Clerk users. Migrate existing Employee.clerkUserId mappings into Clerk privateMetadata before deploying the schema retirement migration; no automatic account grants or metadata changes are performed by application migrations. Configure privateMetadata per Clerk environment; IDs refer to the corresponding application database.

## Organization unit mapping

For every Organization intended to access the application, set privateMetadata.firmId to the numeric ID of its existing business Firm. The application reads the configured value each request; no organization names or IDs are hard-coded. Missing, invalid or unknown Firm mappings deny all protected data and leave organization selection available on login. Multiple Organizations may deliberately share a Firm. Do not place authority in publicMetadata or unsafeMetadata. No database migration, reset, automatic Firm creation or metadata synchronization is required. Unit switching cancels/clears previous frontend queries and revalidates routes; server checks always enforce the currently configured Firm. Operator examples are illustrative only and never runtime defaults.


## Branch scope

See [Multitenancy](../domain/MULTITENANCY.md) for the current one-company/multiple-branch model. Client and Employee are global, including employee settings and lifecycle. Current Organization grants and Firm-scoped operations remain independent from shared identity. Attachment and audit firmId retain origin; their owner determines visibility.

Member audit access: grant `org:audit_logs:read` to the intended Clerk role. The application additionally restricts every audit read to the currently readable subject; the audit grant alone never grants entity access. Role configuration remains in Clerk.

## Required mapping recovery

Both User privateMetadata.employeeId and Organization privateMetadata.firmId are mandatory numeric positive integers in the target environment. Signed-in verified members with missing or invalid configuration see Configuração de acesso incompleta on login, identifying each affected mapping without its private value. Correct metadata in Clerk, then choose Tentar novamente; the app revalidates current provider state and returns to the safe destination. Sair remains available; Organization selection is hidden for configuration issues. Existing unbound administrator accounts must be configured before deploying this requirement. No database migration is required.

Organization selection is hidden whenever any employeeId or firmId configuration issue exists, including combined issues, because required metadata must be corrected in Clerk. Retry and sign-out remain available. Organization selection remains available before selection or for other access denials without configuration findings.

## Contract permission split

Before deploying split-contract-permissions, add org:contracts:manage_assignments and org:contracts:manage_revenues to roles holding update_all or update_assigned. Add org:contracts:change_status and org:contracts:manage_status_lock to roles holding update_all. Preserve unrelated grants and verify provider read-back. accounts:manage is ignored by the application; remote removal is not required. See ROLES_AND_PERMISSIONS.md for creation and edit semantics.

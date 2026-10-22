# Clerk migration and deployment

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
Supabase URL, bucket and storage service key remain required for attachments.

Configure Clerk email or username sign-in, restricted onboarding, Organizations and pt-BR
widgets. Disable unrestricted user Organization creation. Configure production
domain, email delivery, session lifetime and security policy in Clerk.
Production entitlements, role and permission limits must be checked against the
actual instance before cutover; no plan availability is assumed.

## Permission catalog and domain mappings

`src/shared/session/catalog.ts` defines the finite business feature/action names.
It is a vocabulary for checks, not a role-to-permission grant matrix. Assign
grants to roles in Clerk. `org:sys_*:*` remains Clerk-owned System Permissions.
`org:accounts:manage` groups account administration explicitly; it is not a
wildcard for employee CRUD or any other resource.

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
  automatically given access. Their historical Supabase identity IDs remain.
- Complete Clerk keys are present in ignored local env. No webhook signing
  secret is configured; the webhook endpoint fails closed with 503 until configured.
- Actual production plan entitlements, email delivery, two-firm user rehearsal,
  webhook delivery and quantitative rate-limit/propagation testing remain deployment
  prerequisites. Do not assume development-instance success proves production limits.

## Operator commands

- `pnpm exec tsx scripts/clerk-readiness.ts`: read-only provider/DB inventory.
- `pnpm exec tsx scripts/clerk-setup.ts`: preview missing keys and initial presets.
- `pnpm exec tsx scripts/clerk-setup.ts --apply`: development-only initial setup.
- `pnpm exec tsx scripts/clerk-migration.ts --mapping <path>`: write a new,
  restricted mapping file; refuses to overwrite an existing file. All access is
  disabled by default and needs explicit review.
- `pnpm exec tsx scripts/clerk-migration.ts --apply --mapping <path>`: reconcile
  reviewed mappings. Existing revoked Supabase identities cannot be enabled
  without passing the source revocation check. Inactive/deleted employees cannot
  be enabled. No source password hashes are read or imported; provider email
  verification/setup is the selected migration fallback.
- `.clerk-migration/` is ignored; keep mapping backups access-restricted and copy
  them to controlled backup storage before cutover. Never commit them.

Operations are restartable after provider failures; stop and inspect current
state on 429 or partial failure, respect provider Retry-After, then rerun the
same reviewed mapping. IDs/external identifiers and existing membership checks
prevent duplicate provisioning. Do not silently retry into broader grants.

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

Keep `authUserId`, UserRole and `mustChangePassword` for historical mapping and the
rollback window. They grant no runtime authority. Drop them only after all intended
accounts are reconciled and the rollback window has closed, using a separate
reviewed generated migration. The current change must not destroy unverified
rollback data merely to remove unused columns.

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

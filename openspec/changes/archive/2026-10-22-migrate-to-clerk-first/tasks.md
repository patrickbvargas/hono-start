## 1. Contract and provider readiness

- [x] 1.1 Recheck official Clerk TanStack Start, Custom Permissions, sessions, Backend API, migration and webhook documentation through Context7; record compatible SDK/framework versions and exact supported APIs.
- [x] 1.2 Inventory all route, shared session, feature data, dashboard/export, attachment and UI role checks; finalize the complete custom-permission catalog with independent read/write/export and all/assigned/own scopes.
- [x] 1.2a Validate every permission key against Clerk's `org:<feature>:<permission>` format; distinguish native `sys_domains`/`sys_billing` System Permissions from custom business features, document explicit `manage` semantics, and add focused catalog/check consistency coverage.
- [x] 1.2b Apply the approved feature/action table in design.md; split employee read/create/update/delete/restore from account manage, reject resource/action repetition, and explicitly document mappings for assignment, contract locks and revenue operations before provisioning any extra keys.
- [ ] 1.3 Verify required production entitlements and limits for the finalized role/permission count, session settings, membership operations and account setup; document Clerk development/production configuration without committing secrets.
- [x] 1.4 Update canonical authentication/identity/role/lookup/workflow domain documents to Clerk authority and explicit email/invitation/session-policy changes; preserve firm, assignment, financial and lifecycle invariants.
- [ ] 1.5 Update ARCHITECTURE, DATA_ACCESS, FRONTEND and SECURITY for provider ownership, official middleware/CSRF, Clerk widget exception, env boundaries and shared session structure; audit other docs and main OpenSpec specs for contradictory fixed-role/credential requirements and add necessary deltas before archive.

## 2. Identity persistence and migration foundation

- [x] 2.1 Add validated identity/session/read-model schemas near the owning shared/feature boundary; define Clerk string links without changing integer business IDs.
- [x] 2.2 Add nullable unique Firm organization and Employee user links and any necessary reconciliation persistence. DB migration required: generate through documented Prisma workflow on a disposable local DB; preserve existing migrations and never reset production data.
- [x] 2.3 Implement dry-run inventory/mapping for every firm and enabled, revoked, inactive, deleted and forced-reset account; detect collisions/missing data and preserve historical audit actors.
- [ ] 2.4 Implement repeatable provider user/organization/membership provisioning with source identifiers, secure mapping output, retry/rate-limit handling and no plaintext credential output.
- [ ] 2.5 Validate source hash availability and supported Clerk import against representative accounts; implement documented provider setup/recovery fallback and migration handling for existing forced-reset flags.
- [x] 2.6 Update development seed/bootstrap to link Clerk identities and explicitly provision initial role grants; retain domain fixture determinism and no implicit runtime admin bypass.

## 3. Official Clerk integration and session projection

- [x] 3.1 Add the official TanStack Start SDK and validated public/server/webhook configuration through existing env boundaries, retaining Storage-specific Supabase settings.
- [x] 3.2 Add Start request integration with explicit CSRF preservation and root ClerkProvider according to current official documentation; keep framework glue thin.
- [x] 3.3 Replace Supabase session resolution with verified Clerk user/session/organization, current membership and active same-firm Employee mapping; deny missing, mismatched and pending contexts.
- [x] 3.4 Refactor shared session Zod types, selectors, provider and Query projection to expose safe domain identity/capabilities without duplicating Clerk session ownership or serializing server SDK objects.
- [x] 3.5 Update `_auth`/`_app` beforeLoad gates, safe return navigation and protected function middleware; preserve one shared required-session path and safe error messages.
- [x] 3.6 Clear/cancel protected data on sign-out, expiry, permission refresh, actor and organization changes; prevent previous-context in-flight responses from populating current UI.

## 4. Clerk-owned permission grants and domain enforcement

- [x] 4.1 Configure initial Administrator/User role presets and the finite custom-permission catalog in Clerk through repeatable documented setup; grant only capabilities matching existing visibility by default.
- [x] 4.2 Replace the local role-to-action policy matrix with Clerk Custom Permission checks behind the existing shared action surface; remove role-name wildcards and distinguish provider System Permissions.
- [ ] 4.3 Implement current membership verification and current provider-grant evaluation for mutations/sensitive reads/exports, with request-local reuse and fail-closed API error handling; measure API limits and permission propagation behavior.
- [x] 4.4 Update scope helpers and contracts/assignment query predicates for explicit all-versus-assigned read/write grants while retaining qualifying assignment-role semantics and closed-contract assertions.
- [x] 4.5 Update client, fee/revenue and expense server boundaries and UI capabilities to require the corresponding explicit Clerk grants rather than fixed local roles.
- [x] 4.6 Update remuneration details/list/export/management for explicit own/all and operation-specific grants; ensure lists, counts and totals share the same scope.
- [x] 4.7 Update dashboard aggregates, cash flow, audit access and navigation to independent Clerk capabilities; prevent partial-scope users from receiving firm-wide financial totals.
- [x] 4.8 Update attachment upload/read/delete and related option/detail queries to require both operation permission and valid owner-context scope; preserve current Storage adapter and lifecycle/audit behavior.

## 5. Clerk-native authentication and account UX

- [x] 5.1 Replace custom login orchestration with feature-owned Clerk SignIn presentation using email or username, pt-BR localization, restricted onboarding and supported provider navigation/catch-all paths.
- [x] 5.2 Replace reset and authenticated password-change flows with supported Clerk recovery/account UI; wire compatibility entry routes and pending session tasks.
- [x] 5.3 Remove OAB credential lookup, custom remember-me controls, app-owned reset/temporary-password logic and forced-change routing after migration handling; retain OAB business validation.
- [ ] 5.4 Preserve shared UI imports outside Clerk-owned widgets, existing layout composition and safe product feedback; verify login/recovery/setup/account behavior in the browser.

## 6. Employee access administration and synchronization

- [x] 6.1 Replace local UserRole form/options authority with Clerk-backed role/membership read models and authorized role selection through existing employee API/data/hooks/schema boundaries.
- [x] 6.2 Implement same-firm Clerk invitation/setup access grant with retry/compensation and accurate pending/error UI; do not expose temporary passwords or grant access on partial provisioning.
- [x] 6.3 Implement firm-membership revoke/restore with explicit assignable roles, privilege-escalation prevention and no unintended account-wide ban.
- [x] 6.4 Replace administrator password reset with documented Clerk-supported recovery assistance; keep audits without credential/token content.
- [x] 6.5 Preserve immediate denial for inactive/deleted employees and reconcile provider restrictions, membership changes and account link updates with safe retry states.
- [x] 6.6 Add a thin webhook route and shared verification infrastructure with owner-appropriate reconciliation, event deduplication, out-of-order protection and documented localhost forwarding.

## 7. Focused verification and cutover preparation

- [ ] 7.1 Add Vitest coverage for signed-out/pending/expired sessions, organization and Employee mapping failures, spoofed authority, server CSRF and protected redirect/cache transitions.
- [x] 7.2 Add permission/scope regression coverage for custom roles, administrator-without-grant denial, removed grants, assigned/own/all distinctions, cross-firm denial and lifecycle assertions.
- [ ] 7.3 Add feature coverage for restricted lists/counts/options/details/exports/dashboard totals/attachments and attempted direct server calls despite hidden UI.
- [x] 7.4 Add lifecycle/webhook coverage for invalid signatures, duplicate/out-of-order deliveries, revocation before webhook arrival, provider outages and partial provisioning/retry.
- [ ] 7.5 Rehearse migration in development with two firms, active/revoked accounts, hash-import/setup fallback and custom-role changes in Dashboard; verify auth/account UI and stale-session behavior against real Clerk.
- [x] 7.6 Document maintenance-window cutover, fresh-login requirement, mapping backups, reconciliation and pre-cleanup rollback/forward-recovery steps; verify Storage and current PostgreSQL remain functional.

## 8. Cleanup and completion

- [x] 8.1 Remove unused Supabase Auth clients/admin libraries, auth-only env entries, legacy role authority and auth tests superseded by Clerk; keep Storage configuration and historical migrations.
- [ ] 8.2 Retire obsolete UUID auth link/UserRole/forced-change persistence only after backfill verification and rollback window. DB migration required where fields/models are removed; generate rather than hand-edit migration artifacts.
- [x] 8.3 Audit code shape, minimal barrels, feature ownership, shared UI imports, Zod boundaries, TanStack Form/Query hooks and all remaining role comparisons against canonical project conventions.
- [x] 8.4 Run focused tests, then `pnpm check`, then `npx tsc --noEmit`; fix all failures without suppressions before marking implementation complete.
- [ ] 8.5 Validate OpenSpec changes strictly, verify docs/specs match the final behavior and report remaining deployment prerequisites before scheduling any live cutover.

## Context

The repository contract already treats authentication as a core product surface, but the current application still boots directly into the authenticated shell and all session consumers read from a mock in-memory session store. Protected server functions already depend on `src/shared/session`, so implementing authentication is a cross-cutting change: route composition, shared session utilities, Prisma schema, environment wiring, and user-facing public flows all need to converge on a real BetterAuth session source.

The current Prisma schema models business employees, roles, and firms, but it does not yet contain BetterAuth-managed account, session, or verification persistence. The root route also always renders the authenticated sidebar shell, which does not fit the documented public `/login` and `/recuperar-senha` routes.

## Goals / Non-Goals

**Goals:**
- Add a real authentication feature slice for login, logout, and password-reset flows.
- Replace mock session reads with a shared authenticated-session adapter backed by BetterAuth on both server and client consumers.
- Split public and protected route behavior so unauthenticated users can reach `/login` and `/recuperar-senha` without rendering the authenticated shell.
- Preserve the current role, tenant, and feature authorization model by mapping BetterAuth identities onto the existing employee/firm/role session shape.
- Enforce the documented session durations and failed-login threshold.

**Non-Goals:**
- Reworking the employee role model, tenant model, or feature permission matrix.
- Adding self-service registration, invitation, or external-portal access.
- Redesigning downstream business features beyond updating them to consume the real shared session source.
- Choosing or implementing a production-grade notification platform beyond the minimal password-reset delivery boundary needed by this feature.

## Decisions

### D1. Add a dedicated `src/features/authentication` slice and keep public-route UI there
Authentication is user-facing product behavior, not generic infrastructure. The repository architecture expects domain behavior to live in feature slices, so login and password-reset forms, schemas, API wrappers, and hooks should live in `src/features/authentication`. Shared code remains limited to cross-feature session primitives and env/auth bootstrap.

Alternative considered: place auth forms directly under `src/routes` because they are public pages. Rejected because route files in this repository own composition and guards only; auth validation, server calls, and UI behavior would become a route-local second implementation layer.

### D2. Replace the mock session store with a shared BetterAuth-to-domain session adapter
Existing business features already depend on the `LoggedUserSession` shape. Instead of rewriting the permission system around raw BetterAuth types, the implementation should keep the documented shared session contract and populate it from the authenticated BetterAuth session plus employee, role, employee-type, and firm joins. This minimizes churn in feature code and keeps authorization rules stable.

The shared session surface should become explicitly nullable at the boundary where no user is authenticated, while preserving a strong authenticated actor shape after guards pass. Server helpers should expose one permissive reader for optional session lookup and one asserting reader for protected routes/server functions.

Alternative considered: expose raw BetterAuth session objects across the codebase. Rejected because it would leak vendor-specific auth structures into feature slices and force widespread permission and scope refactors unrelated to product behavior.

### D3. Split public and protected shells at the router boundary
`src/routes/__root.tsx` currently always renders `AppSidebar` and `SidebarInset`, which is correct only for authenticated product screens. Public auth routes should render in a minimal shell without sidebar/navigation, while product routes should remain under the current authenticated shell. The cleanest repository-aligned approach is to keep the document shell in the root route and introduce an authenticated layout route or equivalent wrapper that applies `AppSidebar` only after session enforcement succeeds.

Alternative considered: hide the sidebar conditionally inside the root shell based on pathname. Rejected because pathname-based UI branching weakens route clarity and mixes public/protected concerns in the document shell.

### D4. Use BetterAuth persistence tables plus a password-reset verification flow
The fixed stack already names BetterAuth as the mandatory authentication library. The implementation should add BetterAuth-managed persistence to Prisma for users/accounts/sessions/verifications as required by the library, then relate authenticated identities back to existing `Employee` records. Password reset should use BetterAuth-supported verification tokens instead of bespoke reset-token tables unless the library integration forces an adapter-specific exception.

Alternative considered: store passwords and reset tokens directly on `Employee`. Rejected because it bypasses the repository's fixed authentication stack and would create a second auth system beside BetterAuth.

### D5. Authenticate by email or normalized OAB identifier through one login flow
The product contract allows login with email or OAB number plus password. The login API should accept one identifier field, normalize the input, and resolve it to the authoritative employee-linked account before authentication. OAB matching should enforce the documented uppercase-two-letters-plus-six-digits semantics after normalization so users can enter masked or unmasked variants without changing business meaning.

Alternative considered: separate login forms or routes for email and OAB. Rejected because the product docs describe one login entrypoint, and dual forms add friction without adding capability.

### D6. Model failed-login protection as a server-side rate-limit window keyed by normalized identifier
The contract defines a hard threshold: 5 failed attempts within 1 minute for the same identifier. The implementation should enforce that on the server before completing another password verification. For development and single-instance simplicity, the first implementation can persist failed-attempt events or counters in the primary database so enforcement survives process restarts and works consistently across server instances.

Alternative considered: in-memory throttling only. Rejected because it would reset on reload/redeploy and would not be trustworthy in a multi-instance environment.

## Risks / Trade-offs

- [Auth rollout touches every protected feature] → Mitigation: keep the `LoggedUserSession` business shape stable and convert the session source behind shared helpers first so downstream features need minimal changes.
- [BetterAuth schema may introduce migration churn] → Mitigation: isolate auth persistence additions in one migration and keep relations between auth identity and `Employee` explicit and documented.
- [Password-reset delivery remains partially environment-specific] → Mitigation: define a narrow delivery interface and support development-safe behavior first, while keeping provider choice outside this change's product scope.
- [Lockout logic can create accidental user frustration] → Mitigation: normalize identifiers consistently, return safe pt-BR errors, and test threshold/window boundaries directly.
- [Public/protected shell split can regress navigation] → Mitigation: add route-level tests for public screens, authenticated screens, and redirect behavior after session expiry or logout.

## Migration Plan

1. Add BetterAuth dependency and required Prisma/auth persistence models.
2. Introduce auth bootstrap, validated env wiring, and shared session adapter utilities.
3. Add public auth routes and protected-layout gating while preserving current product routes.
4. Migrate existing protected routes and server functions from mock session readers to authenticated session helpers.
5. Seed or provision development accounts mapped to existing employee records.
6. Verify login, logout, remember-me duration, password reset, and unauthorized redirect behavior before removing mock-only session entrypoints.

Rollback: revert auth route wiring and migration together, then temporarily restore mock session usage if needed for local development. Because this change alters auth persistence and route entry behavior, rollback must treat code and migration state as one unit.

## Open Questions

- Which delivery mechanism should send password-reset messages in non-development environments?
- Should OAB login map to the employee record directly, or to a BetterAuth user alias that is synchronized from employee data?
- Should inactive or soft-deleted employee accounts fail login with a generic auth error or a more specific safe pt-BR message?

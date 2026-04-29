## Why

The frontend currently reads authenticated session state from more than one client-side path, which allows protected admin routes to observe a stale unauthenticated result even after a successful login. This creates avoidable access failures such as `Sessão autenticada indisponível.` and leaves the product without a single source of truth for the logged user in the browser.

## What Changes

- Consolidate frontend session state into one shared TanStack Query session path that acts as the only browser-side source of truth for the authenticated actor.
- Align authenticated-route and admin-route gating so protected screens never depend on a divergent optional-session cache when a required authenticated session already exists.
- Define a synchronization contract for login, logout, session expiry, and authenticated-shell hydration so TanStack Query cache invalidation and the frontend session store remain consistent.
- Remove protected-route behavior that can fail with an unauthenticated frontend session snapshot while the server still recognizes a valid authenticated session.

## Non-goals

- Changing the product permission matrix, user roles, or tenant-isolation rules.
- Replacing BetterAuth, Prisma session resolution, or the existing server-side session model.
- Moving authorization decisions out of the shared session policy helpers.
- Reworking unrelated feature UI beyond the session-consumption changes required to stabilize protected routes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `authentication`: authenticated-route entry, login redirect flow, logout flow, and session-expiry handling must keep the frontend session source synchronized before protected UI is rendered.
- `session-authorization`: shared session consumption must expose one browser-side source of truth for the authenticated actor and protected management routes must not read a divergent unauthenticated client session snapshot.

## Impact

- Affected code: `src/shared/session/**`, authentication hooks, authenticated route loaders/layouts, and protected admin routes such as collaborators and audit log.
- Systems: BetterAuth-backed server session resolution, TanStack Router protected-route gating, and TanStack Query session fetching/invalidation.
- User roles: all authenticated users are affected by login/logout/session-expiry transitions; administrators are directly affected by the protected-route failure being fixed.
- Multi-tenancy: firm isolation and role enforcement remain derived from the authenticated session and are unchanged by this proposal.

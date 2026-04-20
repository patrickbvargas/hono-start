## Why

The current shared session module mixes actor data, mock session seeding, client store concerns, authorization rules, and query scoping in a single file. That makes permission work harder to extend, obscures the boundary between client and server session usage, and increases the risk of future features applying project permission rules inconsistently.

## What Changes

- Refactor `src/shared/session` into separate model, mock, selector, policy, scope, store, and server entry points with a stable public API.
- Define a shared authorization capability that treats the logged user as the actor and keeps permission decisions in pure server-safe utilities.
- Require server functions to read firm scope and permission checks from server session helpers instead of coupling to the client Zustand store.
- Update employee-management flows to consume the shared authorization helpers as the single source of truth for admin-only actions and firm scoping.

## Non-goals

- Implementing real authentication, BetterAuth integration, login screens, or session persistence.
- Changing the product permission matrix defined in the PRD.
- Expanding permissions to unrelated features beyond the shared boundaries and the existing employee-management integration points.
- Reworking employee UI or data modeling beyond the session and authorization integration required by this refactor.

## Capabilities

### New Capabilities
- `session-authorization`: Shared logged-user session and authorization boundaries for actor data, policy checks, and server-safe firm scoping.

### Modified Capabilities
- `employee-management`: Employee route, queries, and mutations must use the shared session authorization helpers as the authoritative source for admin-only access and firm isolation.

## Impact

- Affected code: `src/shared/session/**`, employee route/components/APIs, and any future server functions that consume session helpers.
- Systems: client Zustand session store, server function session access, shared permission/scoping helpers.
- User roles: administrators and regular users continue following the same PRD matrix, but enforcement becomes centralized.
- Multi-tenancy: firm isolation remains mandatory and must be derived from the authenticated session source on the server.

## Why

Protected dashboard and list data can remain in the browser cache across logout and immediate re-login with a different user. This leaks the previous session's scoped view for a short window and breaks the documented role-scoped dashboard behavior, especially when switching from an administrator to a regular user.

## What Changes

- Clear authenticated frontend query caches whenever login establishes a new session.
- Clear authenticated frontend query caches whenever logout ends the current session.
- Keep the shared frontend session query refresh behavior, but ensure protected route data cannot survive a session boundary.
- Add focused tests for login and logout cache-clearing orchestration.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `authentication`: login and logout must clear authenticated frontend query state so protected views do not reuse data from a previous user session.

## Impact

- Affected code: `src/features/authentication/hooks`, shared query-cache orchestration for authenticated data, and auth hook tests.
- Affected roles: administrators and regular users, especially during account switching on the same browser session.
- Multi-tenant implication: reduces the risk of showing stale protected data from the previous authenticated actor inside the same tenant-scoped app shell.

## Non-goals

- No change to server-side authorization or tenant enforcement rules.
- No redesign of dashboard filters, query keys, or route structure.
- No cache persistence feature work beyond clearing protected browser-side query state at session boundaries.

## Context

The current authentication hooks treat the frontend session query as the only cache that must be reset at session boundaries. Protected feature queries such as dashboard summaries remain cached for up to their configured stale window, which allows a browser to reuse role-scoped data from the previous authenticated actor after logout and immediate re-login.

This change is cross-cutting because the session boundary lives in the authentication feature while the stale data risk spans multiple protected feature query roots. The repository architecture also forbids `shared/` code from depending on feature-local modules, which means a shared cache-reset helper cannot legally import feature query-key factories just to enumerate protected roots.

## Goals / Non-Goals

**Goals:**
- Clear browser-side protected query data whenever a new authenticated session is established.
- Clear browser-side protected query data whenever the current authenticated session ends.
- Keep login and logout orchestration simple, deterministic, and aligned with existing React Query key-factory patterns.
- Add focused tests that lock the behavior at the auth-hook boundary.

**Non-Goals:**
- Change server-side authorization, route guards, or tenant derivation.
- Redesign feature query keys or dashboard data loading behavior.
- Introduce persisted cache storage or cross-tab session synchronization.

## Decisions

### Decision: Add one shared helper for authenticated-query cache clearing
Create a shared helper in the session layer that receives a `QueryClient` and clears its connected caches at the auth boundary. This keeps login and logout flows aligned and avoids duplicating cache-reset behavior across hooks.

Alternative considered: duplicate the `removeQueries` calls inside each auth hook.
- Rejected because login and logout would drift easily and future protected roots could be missed in one path.

### Decision: Use `queryClient.clear()` at session boundaries
The helper will call `queryClient.clear()` so the previous authenticated actor cannot leave any browser-side query or mutation cache behind. This stays within the repository dependency rules because it does not require the shared session layer to import feature modules.

Alternative considered: remove only explicit protected query roots.
- Rejected because the cleanest centralized implementation point is `shared/session`, and that layer must not depend on feature-local query-key factories.

### Decision: Clear protected queries before fetching the fresh session after login
The login flow will clear authenticated query roots after successful credentials are accepted and before re-fetching the current session query. This ensures the next protected navigation cannot reuse stale protected data from the prior actor.

Alternative considered: clear only after navigation.
- Rejected because route loaders could already observe stale protected query data during the transition into the authenticated shell.

## Risks / Trade-offs

- [Cache clearing becomes broader than the minimum protected surface] → Acceptable trade-off because auth-bound correctness is higher priority than preserving incidental cache state across actor changes.
- [Future developers assume some query survives login/logout] → Keep the helper centralized in the session layer and cover the auth-hook orchestration with focused tests.
- [Extra refetch work after login] → Acceptable trade-off because correctness at session boundaries is more important than reusing stale protected cache.

## Migration Plan

No data migration required.

1. Add the shared authenticated-query cache-clearing helper.
2. Update login orchestration to clear protected queries before refreshing the current session.
3. Update logout orchestration to use the same helper before redirecting to `/login`.
4. Add or update hook tests to verify the cache-clearing contract.

Rollback strategy:
- Revert the auth-hook and shared-helper changes together. No persisted data or schema state is affected.

## Open Questions

- None. The protected query roots are already explicit in feature key factories, and the session-boundary behavior is defined by existing role-scoped requirements.

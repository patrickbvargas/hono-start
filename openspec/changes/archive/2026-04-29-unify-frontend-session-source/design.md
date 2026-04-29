## Context

The current session flow mixes two frontend session read paths: a required session query consumed by the authenticated shell and an optional session query consumed by public-route redirects and some protected admin-route loaders. Because those query keys are separate, the browser can keep a stale optional `null` result after login while the authenticated shell already has a valid required session. The result is a broken protected-route experience where routes such as collaborators and audit log fail with `Sessão autenticada indisponível.` even for administrators.

The user-facing direction is clear: the frontend must keep only one source of truth for the logged-user session and the solution should stay simple to understand and use. TanStack Query already owns server-state fetching, cache invalidation, and route prefetching in this repository, so the design should converge the session flow onto one shared query path instead of introducing a second frontend state layer.

## Goals / Non-Goals

**Goals:**
- Establish a single browser-side source of truth for the logged-user session in one shared TanStack Query session path.
- Ensure protected routes and admin-only routes cannot observe a stale unauthenticated frontend session snapshot after login.
- Keep login, logout, session-expiry, and authenticated-shell hydration synchronized between server fetches and the frontend session store.
- Preserve the existing shared session model and authorization helpers so role and tenant decisions remain centralized.

**Non-Goals:**
- Replacing BetterAuth or changing the server-side session resolution contract.
- Moving authorization authority from the server to the browser store.
- Changing the permission matrix, protected route inventory, or tenant rules defined by the docs.
- Introducing a second frontend session abstraction beside TanStack Query.

## Decisions

### D1. One shared session query becomes the browser-side source of truth

The browser-side authenticated actor will resolve from one shared session query key under `src/shared/session`, and both public-route redirects and protected-route consumers will read from that same cache path. Protected flows will assert that the shared query result is non-null instead of using a second query key with a different cache history.

This keeps the session model easy to reason about and prevents two frontend caches from disagreeing about whether a user is authenticated.

Alternative considered: keep the current required-vs-optional split and only patch the broken admin routes. Rejected because it fixes the immediate symptom but preserves the same structural drift that caused the bug.

### D2. TanStack Query stays both the transport and the frontend ownership layer

Session query helpers will continue to fetch session data from the server, and that same shared query cache will be the only frontend source of truth for the authenticated actor.

This avoids introducing an extra client-state abstraction for data that is fundamentally server-derived, and it matches TanStack Query's intended role as the repository's server-state layer.

Alternative considered: introduce a separate browser store and synchronize it from the query cache. Rejected because it adds ceremony and extra hydration rules without solving a problem that a single query path cannot already solve.

### D3. Protected routes must assert authentication from the shared session query

Authenticated shell entry and protected child-route gating will rely on the same shared session query that public auth routes use for redirect checks. Protected routes will treat `null` as unauthenticated and redirect before rendering restricted UI.

This removes the specific failure mode where a stale optional `null` overrides an already-authenticated browser state and aligns protected-route behavior with the documented rule that `_app` enforces authenticated access before child rendering.

Alternative considered: keep a separate required-session query key for protected routes. Rejected because it preserves two frontend session histories and undermines the single-source-of-truth goal.

### D4. Session synchronization is explicit on login, logout, and expiry

After successful login, the client will invalidate the shared session query, refetch it, and only then navigate into the authenticated shell. Logout will clear the shared session query before redirecting to `/login`. Session-expiry or failed protected-session resolution will reset the shared session query to `null` before redirecting.

This ensures the browser cannot render protected UI from stale state during auth transitions and keeps route guards, sidebar UI, and feature visibility aligned.

Alternative considered: rely only on invalidation and let later routes refetch lazily. Rejected because the current bug demonstrates that auth transitions need an explicit session refresh contract.

### D5. Shared authorization helpers continue deriving permissions from the shared session model

The shared session query will hold the existing `LoggedUserSession` model, and helpers such as `can`, `assertCan`, `isAdminSession`, and scope selectors will keep deriving permission decisions from that model rather than storing permission booleans.

This preserves a single semantic session shape across browser and server code while avoiding new duplication in role or tenant semantics.

Alternative considered: write precomputed permission flags into the cached session data. Rejected because it introduces another layer that can drift from the canonical authorization policy.

## Risks / Trade-offs

- [Risk] Some existing consumers may keep depending on the old required-vs-optional query split. → Mitigation: centralize exported client session hooks/helpers in `src/shared/session` and update route consumers in the same change.
- [Risk] Login/logout flows may forget to refresh or clear the shared session query explicitly. → Mitigation: define one shared synchronization path for auth transitions and cover it with focused tests.
- [Risk] Public auth redirects and protected routes now share the same cache entry, so stale `null` data could persist across login if not invalidated. → Mitigation: invalidate and refetch the shared session query immediately after login before navigation.

## Migration Plan

1. Collapse the frontend session query helpers onto one shared session query key.
2. Update the authenticated shell and shared session hooks to read the logged-user actor from that shared query path instead of depending on divergent optional/required caches.
3. Refactor login, logout, and required-session failure handling to synchronize the shared session query explicitly.
4. Update protected admin-route loaders and related tests so they depend on the required authenticated path and no longer read the optional frontend session state for protected access.
5. Run `pnpm check` and `npx tsc --noEmit` after implementation to catch import drift and type regressions.

Rollback is straightforward: restore the previous session query split and session consumption path. No database migration or persisted schema change is required.

## Open Questions

- Should the authenticated shell continue to pre-read the shared session query in its route component, or should child consumers rely entirely on the loader-prefetched cache?
- Do we want to keep a separate helper name for public auth redirect reads, or collapse the public and protected session helpers onto one shared query helper surface?

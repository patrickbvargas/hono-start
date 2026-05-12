## Context

The login hook currently exposes pending state directly from the credential mutation. That state ends as soon as `mutateAsync` resolves, but the client still performs follow-up work before the user reaches the protected route: clearing protected caches, refetching the authenticated session, and awaiting router navigation. During that interval the login screen remains visible without any busy signal, which feels like a freeze even though the flow is still progressing.

This change stays inside the authentication feature slice and does not alter server auth behavior, route guards, or dashboard loaders. The existing shared `RouteLoading` signal still covers protected-route loading after navigation starts; this design only removes the gap before that handoff.

## Goals / Non-Goals

**Goals:**
- Keep the login submit control busy for the full client-side post-login pipeline.
- Preserve existing redirect, session refresh, and safe error behavior.
- Cover the longer-lived busy-state contract with focused tests.

**Non-Goals:**
- Redesign the login screen or add a new overlay/loading component.
- Change server mutation payloads or authentication APIs.
- Optimize dashboard loader latency after navigation begins.

## Decisions

**Use feature-local transition state in the login hook**
The hook already orchestrates the full login pipeline, so it should own the full busy signal too. A local boolean state layered on top of `loginMutation.isPending` keeps the route thin and avoids leaking orchestration details into the component.

Alternative considered: deriving everything from mutation state alone. Rejected because TanStack Query correctly marks the mutation complete once `mutateAsync` resolves, while this UX bug happens in the extra async work after that point.

**Reset the extended busy state only on failure**
On successful login, the component should unmount because navigation takes over. Resetting the state on success would recreate the same dead visual gap. On failure, the state must clear so the user can retry after toast feedback.

Alternative considered: clearing the state in a `finally` block. Rejected because that would release the button before the route transition visually takes over.

**Keep the UI surface minimal**
The existing submit button already communicates progress with disabled state and `Entrando...`. Reusing that control avoids unnecessary shared UI changes for a narrow fix.

## Risks / Trade-offs

- Busy state could remain stuck if a successful navigation unexpectedly does not unmount the form → Mitigation: the hook still awaits `navigate`, and the existing route flow should replace the screen on success; failure paths explicitly clear the local state.
- The fix does not shorten real post-login latency → Mitigation: it targets trust and perceived responsiveness by removing the false idle state while preserving existing route-loading feedback.

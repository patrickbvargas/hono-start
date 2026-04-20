## Context

The current `src/shared/session` module combines multiple responsibilities: logged-user types, mock session seeding, Zustand store bootstrap, authorization rules, error messages, and firm-scoped query helpers. That coupling makes it hard to evolve permissions safely because client-only concerns and server-safe authorization logic live in the same module surface.

This refactor is cross-cutting even though the initial consumer is employee management. The route layer uses session helpers for UI visibility, employee server functions need firm scoping and role enforcement from the authenticated session, and future protected features will reuse the same shared boundaries. The project stack is TanStack Start + Router + Query with Prisma on the server, so the design must keep browser state separate from server execution while preserving a simple import surface under `src/shared/session`.

## Goals / Non-Goals

**Goals:**
- Separate shared session concerns into clear boundaries for model, mock data, selectors, policy, scope, client store, and server session access.
- Keep authorization helpers pure and server-safe so they can be reused by server functions without depending on browser state.
- Preserve a stable public session API so current and near-future feature code can adopt the refactor incrementally.
- Make employee-management server functions and route-level admin gating depend on the shared authorization helpers as the system of record.

**Non-Goals:**
- Implementing BetterAuth or replacing the current mocked session flow.
- Changing the PRD permission matrix, role names, or multi-tenant rules.
- Introducing a generic policy engine, DSL, or database-driven permissions system.
- Refactoring unrelated features that do not currently consume `src/shared/session`.

## Decisions

### D1. Split `src/shared/session` by responsibility behind one barrel

`src/shared/session` will be reorganized into focused modules such as `model`, `mock`, `selectors`, `policy`, `scope`, `store`, and `server`, with `index.ts` remaining the only public import path for consumers.

This keeps the repo aligned with the architecture rule that shared cross-feature code lives in `src/shared`, while avoiding a single file that mixes unrelated concerns. The barrel preserves ergonomics and minimizes churn in consumers.

Alternative considered: keep one `session.ts` file and add internal sections/comments. Rejected because the core problem is boundary confusion, not discoverability.

### D2. Treat the logged user as the actor; keep authorization helpers pure

Authorization functions will consume a `LoggedUserSession` actor and an optional resource input, returning decisions such as permission checks and scope objects without reading from any global store.

This makes permission evaluation deterministic, testable, and usable in both client and server environments. It also avoids coupling server code to Zustand or any browser lifecycle.

Alternative considered: expose permission booleans from the store and let features derive the rest inline. Rejected because duplicated derivation would drift and weaken server authority.

### D3. Separate client transport from server session access

The Zustand store remains the client-side transport for the current mock session, but server functions must read session data through a dedicated server helper that returns the same shared session model.

This preserves the current mock behavior while making the client/server split explicit. When BetterAuth lands, the server helper and client bootstrap can change independently without forcing a policy rewrite.

Alternative considered: import store helpers directly in server functions. Rejected because TanStack Start server functions execute outside the browser, and authorization must not depend on client state.

### D4. Keep permissions derived from canonical role and actor fields

The canonical session fields remain identity, firm, employee, employee type, and role. Helpers such as `isAdminSession`, `canManageEmployees`, and scope builders remain derived utilities rather than stored booleans in the session object.

This avoids duplicate sources of truth and fits the current PRD, which defines permissions by role and assignment. Derived helpers can evolve without reshaping the session payload.

Alternative considered: materialize permission booleans in the stored session object. Rejected because it adds drift risk during mock usage now and auth mapping later.

### D5. Employee-management adopts server-authoritative enforcement first

Employee route visibility may use shared session helpers for UX, but employee create, update, delete, restore, and list behaviors must be enforced in server functions using the shared server session and authorization helpers.

This matches the project conventions that `firmId` comes from session and that server functions are the authority for protected actions. UI gating remains a convenience layer, not the security boundary.

Alternative considered: refactor only the shared session files and leave employee APIs unchanged. Rejected because the current hardcoded `firmId = 1` and TODO-based admin gating are the most visible boundary violations.

## Risks / Trade-offs

- [Risk] Public helper names may shift during the refactor and break feature imports. → Mitigation: keep `src/shared/session/index.ts` as a compatibility barrel and preserve existing helper names where practical.
- [Risk] Client and server mock session sources may diverge over time. → Mitigation: centralize mock session creation in one shared factory consumed by both store bootstrap and server helper.
- [Risk] The refactor could stay architectural only and fail to improve real enforcement. → Mitigation: require employee-management consumers to adopt the new helpers in the same change.
- [Risk] Future features may bypass the shared boundaries and reintroduce inline role checks. → Mitigation: document the session API clearly in the spec and use employee-management as the reference integration pattern.

## Migration Plan

1. Introduce the new shared session modules and keep `index.ts` exporting the supported public helpers.
2. Move mock session creation and selector helpers to the new boundaries without changing feature behavior.
3. Move permission and scope logic into pure policy/scope modules and add a dedicated server session helper.
4. Update employee-management route and server functions to consume the new shared helpers for admin gating and firm isolation.
5. Run `pnpm check` and `npx tsc --noEmit` to catch import drift and type regressions.

Rollback is straightforward: restore the previous single-file session module and revert employee-management consumers. No database migration or persisted session data change is involved.

## Open Questions

- Should future feature slices import fine-grained session modules directly, or should the barrel remain the enforced import path for consistency?
- When BetterAuth is introduced, should the session boundary expose only raw auth data, or continue to include mapped domain-friendly role and firm objects?

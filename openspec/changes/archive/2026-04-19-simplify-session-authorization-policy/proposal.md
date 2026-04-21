## Why

Session authorization policy has grown hard to read because each feature has sugar helpers layered over the central `can` decision table. The product permission rules stay correct, but maintainers need a smaller, more direct policy surface before more protected features are added.

## What Changes

- Refactor `src/shared/session/policy.ts` into a concise central action policy that keeps current allow/deny behavior unchanged.
- Remove or reduce per-feature sugar helpers where callers can use `can(session, action, resource)` or `assertCan(session, action, resource)` directly.
- Keep existing validation, tenant checks, role checks, assignment checks, and read-only contract checks unchanged.
- Preserve safe pt-BR error messages for denied actions.
- Add focused tests that lock the current permission matrix before and after the refactor.

## Non-goals

- Do not change the role model, permission matrix, tenant isolation rules, or validation behavior.
- Do not add new actions, screens, roles, or resource types.
- Do not move feature business validation into session policy.
- Do not change BetterAuth session storage or logged-user session shape unless needed for type-only cleanup.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization`: clarify that shared authorization helpers must expose a concise canonical action API and avoid duplicative feature-specific wrappers unless a wrapper has a clear route-facing purpose.

## Impact

- Affected code: `src/shared/session/policy.ts`, `src/shared/session/index.ts`, and any consumers importing per-feature `can...` wrappers.
- Affected tests: shared session authorization tests should cover admin, user, tenant, own-profile, assignment-scoped, remuneration-scoped, and lifecycle-protected decisions.
- Affected roles: `Administrator` and `User`; behavior remains unchanged.
- Multi-tenant implication: firm isolation remains the first authorization gate for resource-backed actions.
- Dependencies: none.

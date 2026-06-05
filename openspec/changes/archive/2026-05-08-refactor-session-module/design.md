## Context

`src/shared/session` is a cross-cutting trust-boundary module used by routes, features, server functions, and shared React context consumers. Its current shape mixes public and internal concerns across `index.ts`, `session.ts`, `model.ts`, `policy.ts`, `server-functions.ts`, `store.tsx`, and subpath imports.

Today the module has three clarity problems:

1. Two overlapping barrels (`index.ts` and `session.ts`) hide where the real public contract lives.
2. `model.ts` and `policy.ts` combine unrelated concerns such as actor types, lookup constants, permission strings, resource contracts, permission rule grouping, and error messages.
3. Permission coverage is maintained through multiple parallel `Set`s and a separate message map, which raises drift risk whenever an action is added or renamed.

This refactor must preserve the current role model, tenant isolation, pt-BR denial messages, and TanStack Start middleware/query boundaries already in use across the codebase.

## Goals / Non-Goals

**Goals:**

- Establish one explicit public barrel for `src/shared/session`.
- Split the shared session module by responsibility so types, permissions, access rules, middleware, query helpers, route helpers, and React provider concerns are easy to find.
- Represent permissions through canonical entity and action catalogs plus a template-literal type instead of a hand-written union.
- Keep shared authorization behavior centralized while reducing duplicated permission bookkeeping.
- Update consumers and tests to the clearer public surface without changing product behavior.

**Non-Goals:**

- No change to who can access what.
- No change to provedor legado de auth, Prisma, or route composition behavior.
- No new permission wrappers per feature.
- No new shared abstraction outside `src/shared/session`.

## Decisions

### Decision: Keep one public barrel and remove the redundant internal barrel

`src/shared/session/index.ts` becomes the only route- and feature-facing public barrel. The current `session.ts` re-export barrel will be removed.

Why:

- The implementation contract prefers minimal, explicit public surfaces.
- One barrel makes import ownership obvious and avoids split-brain exports.

Alternative considered:

- Keep both barrels and only trim exports.
  Rejected because the overlap itself is the confusion source.

### Decision: Split the shared session module by responsibility

The module will be reorganized around clear ownership:

- `types.ts`: logged-user actor shape, session scope, resource contracts, role/status constants
- `permissions.ts`: permission entities, actions, template-literal permission type, canonical permission lists, denial messages
- `access.ts`: `can`, `assertCan`, and authorization helpers
- `selectors.ts`: actor-derived selectors
- `scope.ts`: session scope derivation
- `query.ts`: `sessionKeys` and current-session query options
- `middleware.ts`: authenticated server-function middleware
- `provider.tsx`: React context provider and hooks
- existing `route.ts`, `server.ts`, and `cache.ts` remain, with imports updated

Why:

- It matches the documented repository preference for explicit responsibility boundaries in shared code.
- It makes the security-critical path easier to audit.

Alternative considered:

- Collapse everything into fewer large files.
  Rejected because it keeps unrelated concerns coupled and preserves the current navigation cost.

### Decision: Use canonical permission catalogs plus a template-literal permission type

Permissions will be modeled from two constant catalogs:

- permission entities such as `contract`, `fee`, and `attachment`
- permission actions such as `view`, `create`, `update`, `delete`, and `restore`

The exported permission type will be a template-literal derived from those catalogs. The runtime permission values will use `entity.action` strings to avoid broader churn in existing call sites while still eliminating manual union maintenance.

Why:

- It provides the clarity the requested pattern aims for: valid permissions are mechanically derived instead of hand-typed.
- Keeping `entity.action` preserves current feature call sites and error-message keys with less migration risk.

Alternative considered:

- Switch runtime strings to `action:entity`.
  Rejected for this change because it would create repo-wide churn without changing behavior. The type-system gain still lands with the current runtime string format.

### Decision: Replace parallel rule sets with one permission policy catalog

Authorization behavior for non-admin actors will be driven by a single permission-policy map keyed by canonical permission values. Each entry will map to a small policy kind such as authenticated, admin-only, assigned-read, assigned-write, or own-remuneration.

Why:

- One catalog becomes the auditable source of truth.
- Tests can validate full permission coverage mechanically.

Alternative considered:

- Keep grouped `Set`s and only derive the union type.
  Rejected because the grouped sets are the main drift vector.

## Risks / Trade-offs

- Wider import churn across features and routes → mitigate with a single public barrel and keep existing subpaths only where a dedicated contract is already consumed (`route`, `server`, `cache`).
- Refactor may silently alter authorization behavior → mitigate with focused Vitest coverage for access, scope, middleware, route helpers, server helpers, and affected feature imports.
- Splitting files may feel like more surface area → mitigate by making each file own one concern and keeping `index.ts` explicit.
- Template-literal permissions still use `entity.action` instead of the requested `action:entity` runtime string → mitigate by documenting the rationale and keeping the implementation ready for a later string-shape migration if needed.

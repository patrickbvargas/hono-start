## Why

`src/shared/session` grew into a hard-to-follow shared module with overlapping barrels, mixed responsibilities, and duplicated permission catalogs. The current shape makes authorization work slower to change safely because contributors must trace the same contract through re-exports, manual action lists, and inconsistent import paths.

This refactor is needed now because session-derived tenant and role scope is a repository-level trust boundary. The shared session surface needs a clearer contract before more authentication and authorization work continues.

## What Changes

- Refactor `src/shared/session` into clearer modules with one public barrel and explicit ownership for session types, permission types, authorization helpers, middleware, route helpers, query helpers, and React session context.
- Replace the manually maintained `SessionAction` union with a template-literal permission type derived from canonical action and entity catalogs.
- Consolidate permission rules and denial messages into a single catalog so authorization decisions remain centralized and easier to audit.
- Remove redundant internal barrels and update consumers to use the clarified public session surface.
- Preserve existing runtime authorization behavior, tenant isolation, route/session behavior, and pt-BR denial messages.

## Non-goals

- No changes to the product role model or permission matrix.
- No changes to route URLs, UI copy, or authenticated user flows.
- No changes to BetterAuth session storage, Prisma schema, or feature-specific business rules.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization`: clarify the shared session module contract so authorization, scope, middleware, and provider consumers rely on one explicit public surface without changing business decisions.
- `server-function-middleware`: clarify the protected server-function middleware entrypoint inside the shared session module without changing authenticated-context behavior.

## Impact

- Affected code: `src/shared/session/**/*`, shared session tests, and feature/route imports that consume the shared session surface.
- Affected APIs: shared TypeScript module exports from `@/shared/session`, `@/shared/session/api`, `@/shared/session/cache`, `@/shared/session/route`, `@/shared/session/server`, and React/provider imports.
- Dependencies: no new runtime dependencies.
- Multi-tenant and role impact: tenant and role enforcement stay unchanged, but the implementation becomes easier to audit and maintain.

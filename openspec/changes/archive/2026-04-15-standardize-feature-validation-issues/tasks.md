## 1. Validation Pattern Rollout

No database migrations are required for this change.

- [x] 1.1 Refactor the client document validation helper to return shared `ValidationIssue[]` data while preserving the existing Portuguese message content for server-side use.
- [x] 1.2 Update the client form schema to consume the returned issues and emit them through `ctx.addIssue` instead of inlining the business-rule refinement.
- [x] 1.3 Keep the employee slice aligned with the shared validation contract so it remains the reference implementation for the new pattern.
- [x] 1.4 Update the client create and update server handlers to consume the same validation issue helper instead of a separate message-only helper.

## 2. Verification

- [x] 2.1 Run `pnpm check` and `npx tsc --noEmit`, then fix any issues introduced by the validation-pattern rollout.

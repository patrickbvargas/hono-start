## Context

The repository already supports:

- public password reset by email token
- authenticated self-service password change with current-password confirmation
- administrator-only employee detail access
- BetterAuth-backed credential storage in provider-owned `user`, `account`, and `session` tables

The missing capability is an operational recovery path when email reset is unavailable. The requested product behavior is:

1. administrator opens employee details
2. administrator clicks `Resetar senha`
3. system generates a simple temporary password and reveals it once
4. target user logs in with the temporary password
5. system forces that user to choose a new password before protected work continues

## Goals / Non-Goals

**Goals:**
- Keep all server enforcement inside feature and shared session boundaries.
- Avoid storing plaintext passwords.
- Reuse the existing authenticated password-change UX patterns where possible.
- Preserve pt-BR safe feedback and admin-only authorization.
- Bring authentication form defaults into the canonical `utils/default.ts` pattern.

**Non-Goals:**
- Building email recovery or token-less public reset.
- Creating a generic account-management dashboard.
- Supporting password reset for employees without a credential account.

## Decisions

1. Store a `mustChangePassword` boolean on BetterAuth `User`.
Why: the requirement belongs to the authenticated account state, not to the employee business entity. Persisting the flag on the auth user keeps session resolution authoritative and lets route guards enforce the experience consistently across devices.
Alternative considered: storing the flag on `Employee`. Rejected because not every employee necessarily has a credential account and because the forced-password state belongs to auth lifecycle rather than employee business data.

2. Implement admin reset by directly updating the BetterAuth credential account password hash and the owning user's `mustChangePassword` flag.
Why: this flow is not the same as public token reset or authenticated self-service change. The repository already uses `better-auth/crypto` hashing in seed code, so reusing that hash primitive is consistent while keeping provider-owned password storage semantics intact.
Alternative considered: trying to repurpose `auth.api.resetPassword` or `auth.api.changePassword`. Rejected because those APIs require user-owned token/current-password semantics that do not match administrator-issued resets.

3. Generate temporary passwords with a simple segmented format and an ambiguity-safe alphabet.
Why: the requested UX explicitly avoids complex punctuation-heavy passwords. A format like `MANGA-5511` or `A7K9-XP22` is easy to communicate while still satisfying the minimum-length rule.
Alternative considered: random strong passwords with symbols. Rejected by product request and unnecessary for one-time administrator communication.

4. Force flagged users onto a dedicated authenticated route instead of a dismissible modal.
Why: the user must not continue into other protected areas before changing the temporary password. A route-level gate in `_app/route.tsx` is the strongest repository-aligned enforcement point and keeps child routes from rendering protected content.
Alternative considered: opening a modal after login. Rejected because modals are easier to bypass accidentally and would require every protected route to coordinate the same condition.

5. Reuse the change-password form through shared password-change field defaults and field composition, but keep a separate forced-change mutation/schema.
Why: normal change-password requires `currentPassword`, while forced change does not. Sharing the field composition and defaults preserves consistency without forcing an unnatural current-password field into the mandatory flow.
Alternative considered: reusing the public reset-completion form. Rejected because the user explicitly asked to reuse the change-password form, and the forced flow is authenticated, not token-based.

6. Surface the admin reset action from the employee details drawer footer.
Why: the request anchors the action in the collaborator detail view. Keeping the action in the details overlay avoids introducing a second employee-management entrypoint.
Alternative considered: table row action. Rejected because the requirement explicitly calls out the details surface and because revealing the temporary password is easier from a focused overlay flow.

## Risks / Trade-offs

- [Temporary password visible only once] -> This is intentional for security, but the admin must communicate it immediately. The success UI should keep the value clearly copyable.
- [Existing active sessions of the target user] -> Delete all target sessions during admin reset so the temporary-password flow becomes authoritative.
- [Auth route redirect loops] -> Centralize the forced-password route constant and exempt that route from the `_app` redirect rule.
- [Feature drift inside authentication forms] -> Move auth default values into `utils/default.ts` during this change so the new forced-change form follows the local house pattern.

## Migration Plan

1. Add `mustChangePassword` to the BetterAuth `User` model and generate a Prisma migration.
2. Extend shared server session resolution to expose the flag.
3. Add the admin reset mutation and temporary-password generator.
4. Add forced-password route enforcement and authenticated forced-change form.
5. Update docs, OpenSpec deltas, and tests.

Rollback strategy:

1. Remove the employee reset action and mutation.
2. Remove the forced-password route and session redirect logic.
3. Revert the Prisma migration that introduced `mustChangePassword`.

## Open Questions

None for this implementation. The product decision to keep email reset on hold is already resolved for this scope.

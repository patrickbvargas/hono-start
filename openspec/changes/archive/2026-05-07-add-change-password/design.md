## Context

The repository already supports login, logout, password reset request, and password reset completion through the `authentication` feature slice. The authenticated shell also already renders a user dropdown with a placeholder `Conta` entry, which is the lowest-friction place to surface a routine account-security action without introducing a new route or route-owned orchestration.

The underlying auth provider is BetterAuth and the installed version already exposes an authenticated `changePassword` endpoint that requires the current password and can revoke other sessions. That allows this feature to stay inside the existing auth boundary without custom password hashing or direct persistence writes.

## Goals / Non-Goals

**Goals:**
- Add an authenticated password-change capability for any signed-in user.
- Keep implementation inside the canonical `authentication` feature slice with route-thin composition.
- Reuse the existing shared app-form, mutation, toast, and shared UI patterns.
- Preserve safe pt-BR feedback and avoid leaking internal auth-provider errors.

**Non-Goals:**
- Introducing a settings page, account page, or new authenticated route.
- Changing password-reset behavior or login semantics.
- Adding admin-managed credential rotation for other users.

## Decisions

1. Surface the feature as a modal opened from the existing authenticated user dropdown.
Why: the product already exposes `Conta` in the user menu and the action is short-lived, form-based, and scoped to the current actor. A modal matches the repository's preference for concise write flows and avoids a new route with no additional product value.
Alternative considered: a `/configuracoes` or `/configuracoes/seguranca` route. Rejected because the route does not exist today and would introduce route, navigation, and layout work disproportionate to the feature.

2. Implement the server boundary as an authenticated mutation inside `src/features/authentication/api/mutations.ts`.
Why: the repository contract keeps server functions in feature `api/` files, validation in `schemas/form.ts`, and user-safe error mapping in feature constants. This also keeps password-change logic beside existing login/reset mutations.
Alternative considered: calling BetterAuth directly from a route or shared helper. Rejected because it would bypass feature ownership boundaries and create a second auth orchestration pattern.

3. Use BetterAuth `auth.api.changePassword` instead of custom account-table writes.
Why: the provider already validates the current password, updates the credential account, and supports revoking other sessions. Reusing provider behavior reduces security risk and keeps provider-owned schemas provider-owned.
Alternative considered: direct Prisma write to auth tables. Rejected because BetterAuth owns those tables by documented convention and custom writes would duplicate security-sensitive logic.

4. Add a dedicated authenticated form hook and component under the `authentication` feature.
Why: existing auth flows already use feature-local hooks and components for form orchestration. Following that pattern keeps mutations pure and puts toast, cache/session refresh, modal close, and submission branching in the hook layer.
Alternative considered: inline mutation handling inside the sidebar component. Rejected because it would couple shell UI to auth persistence orchestration and violate feature ownership.

5. Keep success behavior in-session and optionally revoke other sessions only.
Why: the current session can remain valid after password change, so the least disruptive UX is to keep the actor signed in, show success feedback, and close the modal. The optional revoke-others control improves account security without forcing an unnecessary logout of the current device.
Alternative considered: always signing the user out after password change. Rejected because BetterAuth already supports targeted revocation and the user already proved possession of the current password.

## Risks / Trade-offs

- [User menu grows in responsibility] → Keep the dropdown limited to launching the modal; all form logic stays inside the authentication slice.
- [Provider error codes may vary] → Map known failure shapes to safe pt-BR messages and fall back to one generic change-password error.
- [Stale session/query state after password change] → Reuse the shared session query invalidation pattern from auth hooks so frontend authenticated state stays synchronized.
- [Modal-only surface can be missed by future settings work] → Keep the implementation isolated so the same form can later move behind a dedicated account screen without server-boundary changes.

## Migration Plan

No database migration or seed change is required.

Deployment steps:
1. Ship the new authenticated mutation and UI.
2. Update canonical docs and OpenSpec auth requirements.
3. Verify auth tests plus repository checks.

Rollback strategy:
1. Remove the dropdown entry and modal wiring.
2. Remove the authenticated mutation and hook.
3. Restore the previous authentication docs/spec delta state.

## Open Questions

None for implementation. The only future product question is whether account security later deserves a full settings surface, but this feature does not depend on that decision.

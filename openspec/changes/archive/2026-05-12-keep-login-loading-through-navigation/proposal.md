## Why

The login flow currently clears the submit loading state as soon as credential submission finishes, even though the client still needs to refresh the authenticated session and start protected-route navigation. That gap makes the screen look frozen for a few seconds and weakens trust in the login flow.

## What Changes

- Keep the login submit action in a visible busy state until the post-login session refresh and route navigation handoff are complete.
- Preserve the existing safe pt-BR feedback and redirect behavior while removing the dead visual gap between successful credential submission and protected-route loading.
- Add focused contract coverage for the longer-lived login loading state.

## Capabilities

### New Capabilities

### Modified Capabilities
- `authentication`: Adjust the login UX contract so the submit action remains visibly busy across the full post-login transition instead of stopping after credential submission alone.

## Impact

- `src/features/authentication/hooks/use-login-form.ts` — extend the login pending state to cover the full post-login client pipeline.
- `src/features/authentication/components/login-form/index.tsx` — keep the submit control disabled and labeled as busy until navigation begins.
- `src/features/authentication/__tests__/use-login-form.test.tsx` — cover the persistent loading-state contract.
- No API, database, permission, or multi-tenant behavior changes.

## Why

Public authentication forms currently rely on client-side JavaScript to prevent native browser submission. When hydration is delayed or unavailable, the browser can fall back to a default `GET` form submission and serialize credential fields into the URL, which is unacceptable for login and password-reset flows.

## What Changes

- Harden the shared form submission primitive so sensitive authentication forms do not fall back to URL-based submission when JavaScript is unavailable or delayed.
- Update the authentication capability contract to require that login and password-reset completion flows never place password values in the browser URL.
- Add focused verification for the secure form-submission contract used by authentication screens.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `authentication`: require public credential forms to preserve passwords outside the URL even during native browser fallback conditions.

## Impact

- Affected code: `src/shared/components/form`, authentication components, and shared/frontend tests.
- Affected users: all unauthenticated users using login and password-reset flows.
- Multi-tenant impact: none on tenant scoping, but fixes a cross-cutting authentication security issue for every tenant.

## Non-goals

- No redesign of the authentication UI or route structure.
- No changes to login identifiers, password policy, or provedor legado de auth session semantics.
- No changes to protected-route redirect behavior beyond preventing credential leakage in auth forms.

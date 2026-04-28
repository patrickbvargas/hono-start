## Why

The `src/features/authentication` slice currently delivers the required login and password-reset flows, but it drifts from the repository contract in structure, naming, and UI presentation. The drift makes the feature harder to maintain alongside the other slices and increases the chance of future auth changes bypassing the documented house patterns.

## What Changes

- Refactor the authentication feature to match the documented feature slice structure used elsewhere in the repository, including canonical component placement, public barrel shape, and naming conventions.
- Replace the current one-off authentication screen styling with shared UI composition that matches the rest of the product's shadcn-based visual language.
- Keep the existing authentication logic, routes, session behavior, lockout behavior, password-reset behavior, and safe pt-BR feedback intact while the presentation and feature organization are normalized.
- Add focused verification for the refactored authentication slice so structural and UI refactors do not silently regress the existing login and password-reset flows.

## Non-goals

- Changing authentication business rules, session duration rules, or password-reset semantics.
- Redesigning the authenticated shell, sidebar, or protected-route behavior.
- Introducing new authentication capabilities, providers, or role logic.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `authentication`: tighten the public authentication-screen contract so login and password-reset flows preserve the existing behavior while following the repository's shared UI and feature-structure patterns.

## Impact

- Affected code: `src/features/authentication/**`, `src/routes/login.tsx`, `src/routes/recuperar-senha.tsx`, and any shared UI composition needed to remove the current custom auth presentation drift.
- Affected users: unauthenticated users accessing login and password-reset screens; no role or tenant semantics change.
- Multi-tenant impact: none to tenant isolation or authorization rules; session-derived firm and role scope remain authoritative.
- Verification: focused Vitest coverage for the refactored auth feature plus route-level/manual verification of public auth screens.

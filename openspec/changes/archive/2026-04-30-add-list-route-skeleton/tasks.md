## 1. Shared pending skeleton

- [x] 1.1 Add a shared list-route skeleton component under `src/shared/components` that represents the common list screen structure.
- [x] 1.2 Keep the skeleton generic, using shared UI primitives only and supporting optional action-area rendering.

## 2. Route wiring

- [x] 2.1 Add the shared skeleton as `pendingComponent` for the principal list routes: clients, employees, contracts, fees, remunerations, and audit log.
- [x] 2.2 Preserve existing route composition and `RouteLoading` behavior after the route is mounted.

## 3. Verification

- [x] 3.1 Add focused Vitest coverage for the shared skeleton contract or route wiring.
- [x] 3.2 Run `pnpm check` and `npx tsc --noEmit`.

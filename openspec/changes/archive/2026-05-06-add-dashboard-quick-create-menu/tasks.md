## 1. Dashboard quick-create wiring

- [x] 1.1 Add the dashboard header `Novo` dropdown action in `src/routes/_app/index.tsx` using shared UI primitives.
- [x] 1.2 Wire route-local create overlays for client, contract, fee, and employee forms from the dashboard while preserving existing feature ownership.
- [x] 1.3 Restrict dashboard quick-create entries by session permissions and keep unsupported direct-create entities absent.

## 2. Test coverage

- [x] 2.1 Add or update focused dashboard route/component tests for quick-create menu visibility and overlay wiring.

## 3. Verification

- [x] 3.1 Verify the change requires no DB migration or API contract expansion.
- [x] 3.2 Run `pnpm check` and fix any issues introduced by the dashboard quick-create change.
- [x] 3.3 Run `npx tsc --noEmit` and fix any type errors introduced by the change.

## 1. Shared form hardening

- [x] 1.1 Update the shared form root to use a safe native submission default that prevents URL serialization of sensitive fields during browser fallback.
- [x] 1.2 Confirm authentication forms continue using the shared form root without introducing ad hoc credential-handling paths.

## 2. Verification

- [x] 2.1 Add focused Vitest coverage for the shared form submission contract, including the secure default and explicit override behavior.
- [x] 2.2 Run `pnpm check` and `npx tsc --noEmit`, then fix any issues required for this change.

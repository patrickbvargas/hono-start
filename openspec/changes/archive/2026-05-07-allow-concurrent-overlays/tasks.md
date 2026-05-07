## 1. Shared Overlay Hook

- [x] 1.1 Refactor `src/shared/hooks/use-overlay.ts` to store independent state for each named overlay scope while preserving the existing `overlay.create/edit/details/delete/restore` API.
- [x] 1.2 Replace single-active hook metadata with multi-open metadata that reflects every currently open overlay scope in one hook instance.

## 2. Contract Alignment

- [x] 2.1 Update `src/shared/hooks/__tests__/use-overlay.test.ts` to cover concurrent overlay rendering, independent close behavior, and multi-open metadata.
- [x] 2.2 Update `docs/implementation/FRONTEND.md` so the shared overlay pattern documents concurrent named overlays within one hook instance.

## 3. Verification

- [x] 3.1 Run focused Vitest coverage for the shared overlay hook and fix any failures.
- [x] 3.2 Run `pnpm check` and `npx tsc --noEmit`, then fix all reported issues before considering the change complete.
- [x] 3.3 Confirm no DB migrations are required for this change.

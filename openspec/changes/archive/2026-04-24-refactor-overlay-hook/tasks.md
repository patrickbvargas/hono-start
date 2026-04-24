## 1. Test Baseline

- [x] 1.1 Add focused Vitest coverage for `useOverlay<T>()` public behavior, including initial closed state and named overlay scopes.
- [x] 1.2 Cover create overlay behavior: opens without data, renders only while active, and closes through `close`.
- [x] 1.3 Cover data overlay behavior for at least one selected-data scope, verifying selected data reaches render callbacks.
- [x] 1.4 Cover single-active-overlay behavior when a second overlay opens in the same hook instance.
- [x] 1.5 Cover `onOpenChange(false)` closing the matching active overlay and ignoring close signals for inactive overlays.

## 2. Hook Refactor

- [x] 2.1 Replace internal `useState` transitions in `src/shared/hooks/use-overlay.ts` with explicit reducer actions.
- [x] 2.2 Add a type guard for data overlays so render callbacks receive selected data without implementation-only casts.
- [x] 2.3 Preserve the existing `useOverlay<T>()` return shape, named overlay scopes, and `OverlayState` compatibility.
- [x] 2.4 Verify entity route call sites require no API changes.

## 3. Documentation

- [x] 3.1 Update `docs/implementation/FRONTEND.md` to clarify the shared overlay hook contract for entity route composition.
- [x] 3.2 Update the owning implementation docs to require Vitest coverage for behavior-changing feature, refactor, and new-code work.
- [x] 3.3 Keep documentation focused on canonical rules without duplicating detailed guidance across multiple files.

## 4. Verification

- [x] 4.1 Run the focused `useOverlay` Vitest test file.
- [x] 4.2 Run the existing frontend orchestration boundary test.
- [x] 4.3 Run `pnpm check`.
- [x] 4.4 Run `npx tsc --noEmit`.
- [x] 4.5 Confirm no database migration is required.

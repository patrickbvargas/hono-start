## 1. Spec And Hook Alignment

- [x] 1.1 Move edit-form hydration for canonical entity overlays onto suspense-first feature data hooks.
- [x] 1.2 Update contract and fee option hooks to preserve current inactive persisted selections as disabled edit-only options.

## 2. Implementation And Verification

- [x] 2.1 Update affected form components and shared option composition without changing create-flow selection rules.
- [x] 2.2 Add focused Vitest coverage for edit hydration and inactive persisted option rendering.
- [x] 2.3 Run `pnpm check` and `npx tsc --noEmit`, fix any resulting issues, and then mark tasks complete.

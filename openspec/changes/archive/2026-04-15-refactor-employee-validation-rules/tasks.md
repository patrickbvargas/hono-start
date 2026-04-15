## 1. Employee Rule Placement

- [x] 1.1 Create `src/features/employees/rules.ts`.
- [x] 1.2 Move pure employee business validation from `utils/validation.ts` into `rules.ts`.
- [x] 1.3 Keep exported employee validators on a `validate...` prefix.
- [x] 1.4 Update `schemas/form.ts` to import from `rules.ts`.
- [x] 1.5 Remove `utils/validation.ts` after imports are updated.

## 2. Behavior Preservation

- [x] 2.1 Preserve OAB-required behavior for lawyers.
- [x] 2.2 Preserve referral percentage compatibility behavior.
- [x] 2.3 Preserve existing Portuguese validation messages.

## 3. Verification

- [x] 3.1 Add or update focused employee validation tests under feature-local `__tests__` folders.
- [x] 3.2 Run repository verification commands required by the workflow.

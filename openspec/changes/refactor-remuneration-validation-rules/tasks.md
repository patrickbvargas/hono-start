## 1. Remuneration Rule Placement

- [ ] 1.1 Create `src/features/remunerations/rules.ts`.
- [ ] 1.2 Move pure remuneration validation from `utils/validation.ts` into `rules.ts`.
- [ ] 1.3 Rename exported remuneration rule entrypoints to follow the `validate...` convention.
- [ ] 1.4 Update remuneration API write modules to import the canonical rules from `rules.ts`.
- [ ] 1.5 Remove `utils/validation.ts` after imports are updated.
- [ ] 1.6 Ensure the Zod remuneration write boundary remains sufficient for all pure remuneration rules.

## 2. Behavior Preservation

- [ ] 2.1 Preserve amount-positive validation behavior.
- [ ] 2.2 Preserve effective-percentage range validation behavior.
- [ ] 2.3 Preserve existing Portuguese validation messages.

## 3. Verification

- [ ] 3.1 Add or update focused remuneration validation tests under feature-local `__tests__` folders.
- [ ] 3.2 Run repository verification commands required by the workflow.

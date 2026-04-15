## 1. Fee Rule Placement

- [ ] 1.1 Create `src/features/fees/rules.ts`.
- [ ] 1.2 Move non-Prisma fee validation from `utils/validation.ts` into `rules.ts`.
- [ ] 1.3 Rename exported fee rule entrypoints to follow the `validate...` convention.
- [ ] 1.4 Update fee API write modules to import the canonical rules from `rules.ts`.
- [ ] 1.5 Remove `utils/validation.ts` after imports are updated.
- [ ] 1.6 Ensure the Zod fee write boundary remains sufficient for all pure non-Prisma fee rules.

## 2. Behavior Preservation

- [ ] 2.1 Preserve amount-positive and installment-number constraints.
- [ ] 2.2 Preserve active-installment uniqueness behavior.
- [ ] 2.3 Preserve parent-consistency and remuneration-generation behavior.
- [ ] 2.4 Preserve existing Portuguese validation messages.

## 3. Verification

- [ ] 3.1 Add or update focused fee validation tests under feature-local `__tests__` folders.
- [ ] 3.2 Run repository verification commands required by the workflow.

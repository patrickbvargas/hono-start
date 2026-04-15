## 1. Contract Rule Placement

- [ ] 1.1 Create `src/features/contracts/rules.ts`.
- [ ] 1.2 Move non-Prisma contract business validation from `utils/validation.ts` into `rules.ts`.
- [ ] 1.3 Rename exported contract rule entrypoints to follow the `validate...` convention.
- [ ] 1.4 Update contract API write modules to import the canonical rules from `rules.ts`.
- [ ] 1.5 Remove `utils/validation.ts` after imports are updated.
- [ ] 1.6 Ensure the Zod contract write boundary remains sufficient for all pure non-Prisma contract rules.

## 2. Behavior Preservation

- [ ] 2.1 Preserve assignment-required and revenue-required behavior.
- [ ] 2.2 Preserve duplicate active assignment and revenue-type protections.
- [ ] 2.3 Preserve referral composition, percentage compatibility, and responsible-lawyer rules.
- [ ] 2.4 Preserve existing Portuguese validation messages.

## 3. Verification

- [ ] 3.1 Add or update focused contract validation tests under feature-local `__tests__` folders.
- [ ] 3.2 Run repository verification commands required by the workflow.

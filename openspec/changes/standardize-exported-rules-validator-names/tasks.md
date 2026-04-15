## 1. Contract alignment

- [x] 1.1 Review each feature `rules.ts` export and classify whether it is a primary write-validator entrypoint or a specialized secondary validator.
- [x] 1.2 Confirm the canonical rename set and the corresponding schema, API, and test imports that must move with it.

## 2. Exported validator normalization

- [x] 2.1 Rename employee and client primary exported validators to the `validate<Feature>WriteRules` pattern and update all direct call sites.
- [x] 2.2 Narrow remuneration granular validators to private helpers if they are only used inside `src/features/remunerations/rules.ts`, while preserving `validateRemunerationWriteRules` as the public entrypoint.
- [x] 2.3 Keep specialized contract validation exports descriptive where they serve a distinct post-resolution write boundary.

## 3. Verification

- [x] 3.1 Update targeted rules tests and schema imports so they reflect the renamed public validator entrypoints without changing validation outcomes.
- [x] 3.2 Run `pnpm check` and fix any reported issues.
- [x] 3.3 Run `npx tsc --noEmit` and fix any reported issues.

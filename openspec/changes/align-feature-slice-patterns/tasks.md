## 1. Feature audit

- [x] 1.1 Compare all feature slices side by side and classify which differences are justified by product responsibility versus which are convention drift.
- [x] 1.2 Decide the canonical public barrel contract and the canonical naming for equivalent responsibilities such as create-default helpers and primary form hooks.

## 2. Public surface and naming alignment

- [x] 2.1 Normalize feature `index.ts` barrels so equivalent feature slices expose a consistent category of public surface without leaking implementation-only modules.
- [x] 2.2 Rename equivalent helper responsibilities that still drift from the house pattern, including create-default helpers and any remaining ad hoc primary orchestration names.
- [x] 2.3 Keep documented exceptions explicit where a feature has a genuinely distinct responsibility that should remain differently named or exposed.

## 3. Form-hook orchestration alignment

- [x] 3.1 Standardize feature `hooks/use-form.ts` implementations around parsed validated payload submission and remove mixed parse-plus-cast flow where it remains.
- [x] 3.2 Verify create-versus-update branching, toast handling, and cache refresh behavior still follow the same house pattern across slices after the cleanup.

## 4. Test alignment

- [x] 4.1 Review cross-feature test coverage and add or update targeted tests where the standardized slice contract is currently unprotected outside schema and rules tests.
- [x] 4.2 Confirm each feature still has baseline schema and rules coverage after the alignment work.

## 5. Verification

- [x] 5.1 Run `pnpm check` and fix any reported issues.
- [x] 5.2 Run `npx tsc --noEmit` and fix any reported issues.
- [x] 5.3 Review the final slices side by side and confirm the aligned pattern holds across clients, employees, contracts, fees, and remunerations.

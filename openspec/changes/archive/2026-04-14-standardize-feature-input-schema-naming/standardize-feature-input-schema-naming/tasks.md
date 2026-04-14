## 1. Contract Updates

- [x] 1.1 Update `docs/implementation/CONVENTIONS.md` to state that request/write schemas and inferred types in `schemas/form.ts` use `Input` naming while read models in `schemas/model.ts` remain concise.
- [x] 1.2 Add a delta spec under `form-validation-boundaries` describing the canonical naming rule for form-side input contracts.

## 2. Feature Rename Pass

- [x] 2.1 Rename form-side schema exports and inferred types in `src/features/employees/schemas/form.ts` to the `...InputSchema` and `...Input` pattern.
- [x] 2.2 Rename form-side schema exports and inferred types in `src/features/clients/schemas/form.ts` to the `...InputSchema` and `...Input` pattern.
- [x] 2.3 Rename form-side schema exports and inferred types in `src/features/contracts/schemas/form.ts` to the `...InputSchema` and `...Input` pattern, including nested assignment and revenue input contracts.

## 3. Call Site Alignment

- [x] 3.1 Update feature-local hooks, API modules, defaults, and validation utilities to import and use the renamed input-side contracts consistently.
- [x] 3.2 Verify public feature barrels still expose only the intended public read-model surface and do not leak internal input contracts.

## 4. Verification

- [x] 4.1 Run `pnpm check`.
- [x] 4.2 Run `npx tsc --noEmit`.

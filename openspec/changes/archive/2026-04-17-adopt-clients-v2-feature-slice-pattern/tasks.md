## 1. Capability And Contract Updates

- [x] 1.1 Update the affected OpenSpec capability specs so `entity-foundation` and `form-validation-boundaries` describe `src/features/clients_v2` as the canonical slice pattern.
- [x] 1.2 Review the updated capability text for alignment with the actual `clients_v2` structure, especially the `api/` and `data/` split, read-model mapping, and `assert...` rule convention.

## 2. Implementation Doc Updates

- [x] 2.1 Update `docs/implementation/ARCHITECTURE.md` to adopt `src/features/clients_v2` as the reference slice and document the canonical folder anatomy.
- [x] 2.2 Update `docs/implementation/CONVENTIONS.md` to document the expected responsibility split, public barrel shape, read-model mapping expectations, and exported `assert...` rule pattern.
- [x] 2.3 Update `docs/implementation/FRONTEND.md` to document the canonical route, hook, overlay, and feature-form orchestration pattern based on `clients_v2`.

## 3. Consistency Review

- [x] 3.1 Review the implementation docs for any remaining references to the older reference slice or conflicting feature-structure guidance and remove the drift.
- [x] 3.2 Verify that the documented public-surface guidance matches the intended `clients_v2` barrel contract and does not accidentally require exporting internal modules.

## 4. Verification

- [x] 4.1 Run `pnpm check` and fix any issues introduced by the documentation update.
- [x] 4.2 Run `npx tsc --noEmit` and fix any reported errors before considering the change complete.

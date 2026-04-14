## 1. Contract Alignment

- [x] 1.1 Review the updated `entity-foundation` and `form-validation-boundaries` deltas against the implementation docs so the canonical slice pattern and validation boundary are unambiguous.
- [x] 1.2 Identify the feature-local validation, lookup, and error-handling code paths that currently duplicate the same rule across schema, hook, and API layers.

## 2. Employee Slice Normalization

- [x] 2.1 Remove the legacy `contract_employees` table-existence shim from the employee contract-count helper and rely on the real Prisma schema/migrations.
- [x] 2.2 Consolidate employee write error handling in the API boundary so known lookup and uniqueness failures map to explicit pt-BR messages without substring matching.
- [x] 2.3 Remove redundant employee submit reparsing from the form hook where the form schema has already validated the payload.
- [x] 2.4 Align employee OAB handling with the documented contract so the canonical normalization and validation path is applied consistently.

## 3. Feature-Slice Pattern Rollout

- [x] 3.1 Apply the same schema/API/hook/component boundary pattern to other feature slices that currently duplicate validation or server-check logic.
- [x] 3.2 Replace any remaining hardcoded or compatibility-era validation branches with explicit feature-local server checks.
- [x] 3.3 Keep route files declarative by ensuring they only compose validated feature state and do not absorb business validation logic.

## 4. Verification

- [x] 4.1 Add or adjust lookup resolution and error-mapping behavior.
- [x] 4.2 Verify the affected feature slices still satisfy the documented business rules after the boundary cleanup.
- [x] 4.3 Run `pnpm check` and `npx tsc --noEmit`, then fix all reported errors before marking the change complete.

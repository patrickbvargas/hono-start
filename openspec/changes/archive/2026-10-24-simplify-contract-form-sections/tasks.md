## 1. Implementation

- [x] 1.1 Add stable row identity and focus orchestration in a feature hook.
- [x] 1.2 Show direct team rows and guided revenue fields with complete summaries; update loading layout and docs. No migration required.
- [x] 1.3 Extend shared accordion with opt-in automatic-open behavior.

## 2. Verification

- [x] 2.1 Cover stable identity, focus, automatic-open behavior and summaries with focused tests.
- [x] 2.2 Run Biome, TypeScript, relevant Vitest suites, OpenSpec validation and browser inspection.


Verification: pnpm check, npx tsc --noEmit and OpenSpec strict validation passed. Sixteen relevant Vitest files passed, totaling 72 tests. Browser inspection confirmed visible team inputs, initially open incomplete revenue fields, focus on collaborator/revenue additions and successful removal of the temporary added rows. No contract was saved during verification. A narrow viewport screenshot was attempted, but its capture scaling did not provide reliable geometry evidence.


Follow-up corrections: manual collapse remains available for incomplete revenues; validation submission reopens affected rows. Team and revenue remove actions use outlined icon buttons matching input height. Focused regression tests (5 tests), TypeScript and formatting passed after these corrections.

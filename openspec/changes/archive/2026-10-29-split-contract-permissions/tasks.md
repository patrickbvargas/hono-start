## 1. Implementation
- [x] 1.1 Update canonical docs and catalog; no DB migration.
- [x] 1.2 Enforce independent grants and align form controls.
- [x] 1.3 Add regression coverage.
## 2. Provider and validation
- [x] 2.1 Reconcile configured Clerk instance and verify, or record blocker.
- [x] 2.2 Run formatting, typecheck, tests and build; review diff.

## Validation results

- OpenSpec strict validation passed.
- pnpm check and pnpm typecheck passed.
- Contracts and session suites: 30 files, 196 tests passed (including the new permission and form cases).
- Final production build passed. Earlier repeat builds failed with local EPERM on generated output; rerunning with execution permission resolved it.
- The full repository suite was attempted and interrupted without a final result; no full-suite pass is claimed.
- Provider read-back verified all four new permissions, six additive role grants and 47 short pt-BR custom descriptions in development. Production untouched.

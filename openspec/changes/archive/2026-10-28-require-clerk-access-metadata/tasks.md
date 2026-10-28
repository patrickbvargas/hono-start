## 1. Required access configuration

- [x] 1.1 Implement validated access-resolution state and enforce both required mappings in server helpers; no database migration required.
- [x] 1.2 Add focused server coverage for missing, invalid, inactive, revoked and corrected configuration, including both missing fields.

## 2. Recovery experience

- [x] 2.1 Show persistent specific configuration notice on login with retry and existing sign-out behavior; hide Organization selection for configuration issues.
- [x] 2.2 Cover configuration copy, recovery actions and safe destination preservation.

## 3. Contract and verification

- [x] 3.1 Update canonical business, security and operator documentation for mandatory mappings.
- [x] 3.2 Review house conventions, run focused/full tests, pnpm check, npx tsc --noEmit, build and strict OpenSpec validation; fix failures.

## Verification results

- pnpm check and npx tsc --noEmit passed; final read-only Biome check passed.
- Focused session/UI contract tests: 61 passed. Final retry-hook and login-route tests: 10 passed.
- Complete suite: 220 files passed, 1138 tests passed; only 3 attachment storage tests failed with filesystem EPERM on hard-link publication in the restricted environment.
- All 12 attachment storage tests passed when rerun with normal host filesystem permissions, as required by QUALITY_WORKFLOW.md. A redundant second complete host run was canceled after the first suite finished and the affected suite had passed; no application test was skipped or changed for the environment issue.
- Final production build passed. Existing vendor directive and large-chunk warnings remain.
- Strict OpenSpec validation passed. No database migration or live Clerk metadata changes performed.

- Employee-binding recovery refinement: OrganizationList hidden for every Employee or Firm issue, including combined issues; 14 recovery tests, pnpm check, TypeScript and strict OpenSpec validation passed.

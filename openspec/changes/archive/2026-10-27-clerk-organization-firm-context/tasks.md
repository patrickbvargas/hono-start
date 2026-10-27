## 1. Contract and session resolution

- [x] 1.1 Align domain/security/operator docs with active Organization privateMetadata.firmId and branch isolation. No database migrations are required.
- [x] 1.2 Fetch current Organization metadata, strictly validate Firm mapping, remove default-Firm fallback and constrain the optional Employee actor to that Firm.

## 2. Recovery and tests

- [x] 2.1 Keep signed-in organization selection available with safe unavailable-access guidance.
- [x] 2.2 Cover configured, unconfigured, malformed, nonexistent, changed and cross-firm mappings; provider failures; middleware denial; request-local caching and recovery UI.

## 3. Verification

- [x] 3.1 Validate OpenSpec and run focused tests, pnpm check and npx tsc --noEmit; review style/import boundaries.
- [x] 3.2 Verify current Clerk configuration and browser switching between a configured Organization and an unconfigured Organization, including recovery. Record actual results without modifying provider metadata.

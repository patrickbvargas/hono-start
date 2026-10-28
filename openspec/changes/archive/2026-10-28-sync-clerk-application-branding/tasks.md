## 1. Shared branding contract

- [x] 1.1 Extract feature-owned branding query/schema, add independent name/logo/favicon validation, and confirm Clerk favicon field. No database migration required.
- [x] 1.2 Share query-backed branding hook with sidebar and preserve existing logo fallback.

## 2. Document identity

- [x] 2.1 Declare typed page labels and compose one global browser title/favicon on public and protected routes.
- [x] 2.2 Add remote favicon load failure/timeout fallback and focus refresh behavior.
- [x] 2.3 Match OrganizationSwitcher loading fallback and loaded trigger heights to prevent header layout shift (browser feedback).

## 3. Verification and contract

- [x] 3.1 Add focused tests for payload fallbacks, cache retention, navigation titles, favicon failure and recovery.
- [x] 3.2 Update frontend documentation, review conventions, run pnpm check then npx tsc --noEmit, focused/full tests and production build.

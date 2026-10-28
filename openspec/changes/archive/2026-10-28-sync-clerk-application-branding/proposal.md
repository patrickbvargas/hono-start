## Why

Application branding is only synchronized in the sidebar. Browser titles still use Hono and the favicon does not follow Clerk, producing inconsistent identity.

## What Changes

- Share the existing public Clerk branding query across the document head and sidebar.
- Read application name, logo and favicon with independent validation and fallbacks.
- Keep page labels in browser titles and replace only the application suffix.
- Refresh on window focus and retain cached branding when refresh fails.
- Keep OrganizationSwitcher loading and loaded header geometry equal, addressing browser-reported flicker.

## Capabilities

### New Capabilities

- `application-branding`: Clerk-owned global application identity with resilient fallbacks.

### Modified Capabilities

None.

## Non-goals

Theme colors, Clerk Dashboard changes, Organization branding, database persistence and new authentication flows.

## Impact

All roles and public login visitors receive the same application branding. Organization switching does not change branding or tenant authorization. Affects the root document, sidebar, feature-owned query/schema/hooks, tests and frontend contract. No dependencies or database migrations.

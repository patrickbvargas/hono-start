## Why

Attachments must live on the PC hosting the application now and on persistent Docker storage on a VPS later. Removing Supabase Storage makes file persistence independent of that service.

## What Changes

- Store attachment binaries under a validated, configurable `ATTACHMENTS_DIR` outside public assets.
- Deliver files through an authenticated endpoint that enforces current firm and owner access.
- Preserve relative storage identities, metadata, supported formats, size limits, audit behavior, and permanent deletion.
- **BREAKING**: Replace Supabase attachment configuration and signed URLs with filesystem configuration and protected application URLs.
- Document persistent-volume deployment and backup requirements.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `attachment-management`: Require private local persistence and authorized binary access independent of Supabase.

## Impact

Shared attachment storage and environment configuration; attachment queries, mutations, schemas and file delivery; focused tests; architecture, security and deployment documentation. All attachment users retain existing Clerk capabilities and resource scopes; files remain isolated by firm and owner.

## Non-goals

- Migrating or deleting Supabase test files or existing test records.
- Replacing database or authentication providers.
- Building Docker/VPS deployment now, distributed storage, or an automated backup service.

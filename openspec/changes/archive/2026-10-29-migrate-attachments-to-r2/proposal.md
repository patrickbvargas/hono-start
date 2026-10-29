## Why

Attachment binaries currently depend on the application host's private filesystem. Move them to Cloudflare R2 to remove this deployment dependency and prepare for Cloudflare hosting with usage-based storage costs.

## What Changes

- **BREAKING**: Replace ATTACHMENTS_DIR-based runtime persistence with a private R2 Standard bucket and server-only configuration.
- Keep database metadata, opaque relative storage identities, protected delivery, existing upload limits, previews and permanent deletion.
- Preserve upload compensation and deletion recovery across storage/database failures.
- Document local development, fixture uploads, configuration, recovery and operational cost monitoring.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `attachment-management`: replace local persistence, delivery and deletion requirements with private R2-backed equivalents.

## Impact

Shared attachment storage, attachment API/data modules, environment validation, demo seed, tests and storage/security/deployment documentation. No database schema migration expected: storagePath becomes the R2 object key. All currently authorized roles retain their existing grants. Client/Employee evidence remains company-wide; operational evidence remains scoped to the owner's Firm. Upload-origin firmId is provenance, not authorization.

Independent of migrate-postgres-to-d1; implement and verify against current PostgreSQL first if sequencing both.

## Non-goals

Database migration, authentication changes, public buckets, direct browser uploads, attachment UI redesign, automatic migration or deletion of old local files. There is no production data; any retained development evidence must be explicitly copied or regenerated before switching storage.

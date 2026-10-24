## Context

The shared attachment storage module currently uploads, deletes and signs URLs through Supabase HTTP calls. Prisma stores relative paths, and attachment mutations already compensate for metadata persistence failure. Current domain docs require permanent deletion even though an older OpenSpec scenario still describes soft deletion.

## Goals / Non-Goals

**Goals:** Private filesystem persistence on Windows now, portable to a Docker volume later; preserve feature ownership, validated schemas and current authorization.

**Non-Goals:** Supabase test migration or cleanup, new storage-provider abstraction, Docker deployment implementation, or changes to authentication/database providers.

## Decisions

1. Use the existing shared storage module with server-only filesystem operations. Validate an absolute `ATTACHMENTS_DIR` through the environment layer and fail clearly when unavailable. Keep relative generated paths in Prisma so relocating the root does not require database edits. A mandatory explicit root avoids accidental persistence inside build output.
2. Preserve firm/owner/UUID path organization. Resolve paths within the configured root, reject absolute or escaping identities, and prevent symlink escape. Root permissions must restrict other writers. Create parent directories as needed and publish complete files without overwriting an existing identity.
3. Replace signed URLs with an application file endpoint identified by attachment ID. Feature-owned logic resolves current session, firm and parent access before reading bytes; routes only compose the handler. Never accept a caller-supplied disk path. Reuse existing resource authorization and current Clerk keys rather than inventing role checks. Return correct content type, safe original filename, private/no-store caching and nosniff headers. Stream files when supported by the established server boundary. Public static serving was rejected because it bypasses authorization.
4. Preserve upload validation, metadata transactions, audit and compensating cleanup. Translate filesystem capacity and permission failures into safe pt-BR errors. Missing binaries return a controlled not-found response. Delete file before deleting metadata; storage failure retains the record. An already missing file does not prevent authorized metadata deletion. Database and disk are not a single transaction; retain explicit error reporting and compensation rather than claim atomicity.
5. Remove attachment Supabase env requirements and update architecture, file-handling and deployment guidance. Ignore the private local storage folder in version control when located under the checkout. Docker documentation will require an externally mounted persistent volume and matching ownership; no container configuration is built in this change.

## Risks / Trade-offs

- Disk loss or replacement → back up binaries together with metadata; keep storage outside disposable deploy directories.
- Multiple independent hosts → unsupported without a shared persistent filesystem; first deployment assumes one application host.
- Disk/database partial failure → preserve existing compensation, log actionable context and expose safe failure messages.
- Old test metadata without local files → controlled missing-file behavior; no automatic record deletion or Supabase fallback.

## Migration Plan

Configure a writable private absolute directory on the PC, deploy updated code and verify upload/open/delete. No Supabase data is copied or removed. Later copy the local folder preserving relative paths and mount it in Docker, updating only the root configuration. Before rollback, back up local files and metadata: old code cannot serve newly local attachments without a separate migration.

## Open Questions

None blocking. Operator chooses the absolute directory at deployment.

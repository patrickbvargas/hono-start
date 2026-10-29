## Context

The shared attachment adapter currently uses AWS S3 commands against R2. Feature callers already centralize upload, read and deletion; authenticated file delivery checks Clerk identity and owner access before reading bytes. Metadata stores provider-independent keys. Mutations compensate for failed metadata commits. A separate active change proposes D1 and must remain independent.

## Goals / Non-Goals

**Goals:** Replace file persistence with private Supabase Storage while preserving existing contracts, keys and recovery behavior.

**Non-Goals:** Database or authentication migration, frontend changes, public delivery, generic provider framework, automatic source-bucket deletion.

## Decisions

1. Keep the existing adapter exports and implement Supabase Storage HTTP operations server-side. Prefer the repository's former direct HTTP integration shape over adding a frontend SDK or retaining provider-specific S3 transport. Verify current APIs through Supabase documentation and Context7 before implementation.
2. Validate server-only SUPABASE_URL, SUPABASE_STORAGE_BUCKET and SUPABASE_SECRET_KEY through the existing environment module. Use a private bucket and dedicated environment credentials. Privileged credentials bypass Storage RLS, so Clerk and owner authorization remain mandatory before every application operation. Never expose secrets through VITE variables. Missing configuration fails attachment operations without disabling unrelated functionality.
3. Preserve existing keys, including origin Firm prefixes for shared master owners; prefixes are provenance, not authorization. Keep the protected file endpoint, MIME, safe disposition, private/no-store and nosniff headers. Do not introduce public or signed browser URLs.
4. Upload without overwrite. Explicitly check provider error responses and distinguish missing objects from denied access or service failure. Preserve ENOENT mapping, quota classification, safe pt-BR feedback and deletion of already missing files. Preserve staged-upload cleanup and captured-byte restoration after metadata failure. Do not blindly retry mutations with unknown outcomes; retain key-based reconciliation logs without credentials.
5. Update owning documentation and environment examples; remove AWS storage dependency only if unused elsewhere. Amend the active D1 proposal to accept Supabase Storage as the chosen external storage without changing its database scope.

## Risks / Trade-offs

- Privileged Storage access bypasses RLS → keep authorization in the existing server boundary and verify denied access across owner scopes.
- Database and storage are not atomic → retain compensation, structured recovery evidence and joint backups.
- Unknown network outcome → reconcile metadata and object inventory before cleanup; never classify service failures as missing.
- Separate storage provider adds external latency → exercise upload/open/delete against an isolated real bucket before cutover.
- Existing R2 objects may exist → inventory first; do not assume disposable data or reset the database.

## Migration Plan

1. Provision isolated private Supabase buckets and server credentials; verify deployment connectivity.
2. Inventory referenced R2 keys, sizes and SHA-256 hashes. Record missing files explicitly. If inventory is empty, record that result.
3. Copy retained objects to identical keys without overwrite; verify downloaded size/hash. Keep R2 originals.
4. Pause attachment writes for final inventory/delta copy and verification, then deploy adapter/configuration. Resume writes only after authenticated smoke checks pass.
5. Verify previews, downloads, upload batches, permanent deletion, compensating recovery and cross-scope denial. Record actual results; mocked tests do not prove readiness.
6. Before target writes, rollback restores previous deployment/configuration. After target writes, freeze writes and reconcile new, replaced and deleted objects with database metadata before reverting; verify restored bytes. Do not retire source resources automatically.

## Open Questions

- Target project, bucket and credentials must be selected during environment setup; secrets never belong in artifacts.
- Whether R2 contains retained files is unknown; inventory determines copy requirements before cutover.

## Accepted disposable-data scope

User waived preservation/migration of remaining legacy attachment objects because existing data will be reset later. Existing missing attachment references are accepted until that reset. No reset or deletion is part of applying this change. Production deployment remains separate; runtime and authorization verification requirements still apply.

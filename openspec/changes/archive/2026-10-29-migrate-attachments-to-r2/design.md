## Context

src/shared/lib/attachment-storage.ts owns local reads/writes/removal. Feature mutations upload before committing metadata, compensate failed writes and recover bytes after failed metadata deletion. Protected delivery already resolves owner access. No production data exists. Expected concurrency is approximately 20 users.

## Goals / Non-Goals

**Goals:** durable private object storage, unchanged user behavior and authorization, explicit failure handling, compatibility with current host and future Workers.

**Non-Goals:** D1, Clerk changes, public URLs, browser upload protocols, general storage framework.

## Decisions

1. Preserve the existing shared storage boundary and feature slice shape. Use the R2 S3-compatible API from the current server; isolate transport so a Workers R2 binding can be used when that runtime is adopted. Confirm supported SDK/runtime APIs through Context7 before implementation. Avoid coupling R2 delivery to the D1 migration.
2. Keep storagePath as a relative object key with existing generated identities. Validate keys at the boundary; user filenames never select arbitrary objects. Bucket is private; credentials and bucket access stay server-only. Keep the protected application endpoint rather than public or presigned delivery, so each request checks current owner access.
3. Preserve MIME, safe Content-Disposition and private/non-public-cache behavior. Adapt byte types only at the transport boundary; verify PDF/image preview and download under realistic file sizes. Preserve existing file/batch limits.
4. Keep compensation semantics: upload failure creates no metadata; database failure triggers removal of staged objects and logs failed cleanup. Deletion removes the object before committing metadata/audit; database failure attempts restoration of captured bytes. Restoration/cleanup failures require a structured diagnostic with attachment/key identity and an operator repair procedure; never claim success on partial failure. This is compensation, not a distributed transaction.
5. Configure separate development/test and production buckets; use least-privilege credentials. Local development may target an isolated R2 bucket; future Workers development may emulate bindings. Seed must use the shared storage boundary and avoid filesystem-only assumptions.

## Risks / Trade-offs

- Cross-service partial failure → fault-injection tests and documented repair of orphaned/missing objects.
- Storage request costs and buffering → monitor operations/storage, retain existing upload limits, verify memory use; no free-tier guarantee.
- Existing local fixtures → inventory and regenerate or explicitly copy with checksum/size verification; do not delete original files automatically.
- Origin prefix mistaken for authorization → authorize using owner scope, including shared Client/Employee evidence across branches.

## Migration Plan

Provision private isolated bucket and server configuration; deploy storage integration to development; regenerate/copy selected fixtures; exercise authorized upload, preview, download, delete and failure recovery. Switch production only after smoke validation. No SQL migration expected. Before real use, rollback can restore the previous deployment/configuration and fixture set. After real writes, inventory and copy affected objects before rollback; switching configuration alone is insufficient.

Update owning docs at implementation time; retain current canonical docs until behavior changes.

## Open Questions

Deployment account, bucket names and credentials are operator configuration, not blockers to this proposal. Confirm current host runtime and SDK support before selecting exact transport dependency.

## References

- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/r2/api/s3/api/

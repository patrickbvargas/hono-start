# Private R2 attachment storage

Configure server-only CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_BUCKET_NAME, CLOUDFLARE_R2_ACCESS_KEY_ID and CLOUDFLARE_R2_SECRET_ACCESS_KEY. Use separate private Standard buckets and credentials for development/test and production. Grant Object Read & Write only for the selected bucket; disable public r2.dev access and custom public domains. Never expose credentials through VITE variables. Missing configuration disables attachment operations without disabling unrelated features.

The current Node server uses the S3 API with region auto. storagePath remains the existing relative opaque object key; no SQL migration is needed. All six owner kinds keep the protected application endpoint, current owner authorization, MIME, safe filename, private/no-store caching and nosniff. Origin firm prefix is provenance only. Upload uses If-None-Match: * to avoid overwriting existing identities. Future Workers adoption can replace transport inside attachment-storage.ts with native R2 binding get/put/delete; feature callers remain unchanged. Native conditional put must reject null results.

Uploads retain file/batch limits and PostgreSQL capacity locking. Failed metadata commits remove staged objects. Failed deletion commits restore captured bytes. These operations are compensation, not a distributed transaction. SDK mutation retries are disabled because a timeout can have an unknown committed outcome. Logs include object identity for reconciliation.

## Fixtures and rollout

Before switching, inventory database storagePath values and retained local files by relative key, size and SHA-256. Preserve originals. For disposable demo data, regenerate using the existing seed against a development database and isolated bucket; never reset production. For selected retained files, explicitly copy using the exact storagePath and verify downloaded size and SHA-256 before rollout. Do not delete local originals automatically. No automatic fixture copy or seed is performed by deployment.

Deploy configured development integration first. Verify PDF/image preview, download, multi-file upload, permanent deletion, denied access for all owner scopes, and access after replacing the application host with the same database/bucket. Record actual results. Production cutover requires these checks.

## Repair and rollback

Monitor structured attachment upload, cleanup and restore logs, R2 operation errors/latency, object storage and Class A/B operations; consult current R2 pricing rather than assuming a free tier. Alert on cleanup/restoration failures and unexpected operation growth.

For cleanup failures or unknown upload outcomes, use logged key, database metadata and bucket inventory to identify orphaned objects after in-flight requests settle. Remove only confirmed orphans after review. For restoration failures, recover original bytes from backup at the exact storagePath, verify size/hash and authorized delivery; preserve metadata and audit evidence. Never treat access-denied/service errors as missing objects.

Back up database metadata and bucket objects together, preserving keys. Before real writes, rollback may restore previous deployment/configuration and fixture set. After R2 writes, inventory and copy affected objects to the rollback provider and verify checksums first; changing configuration alone loses access to new evidence.

Sources: https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/ and https://developers.cloudflare.com/r2/api/s3/extensions/ .

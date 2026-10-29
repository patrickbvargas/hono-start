# Private Supabase attachment storage

## Approved financial redesign — target precedence

Status: approved plan, not implemented. [Target financial contract](../domain/FINANCIAL_SYSTEM.md) and its linked roadmap/UML/authorization supersede conflicting financial and identity semantics below for the ordered redesign. Remaining text describes the preserved running baseline and unchanged house rules; do not infer target implementation from it.

Target preserves Contract and Expense attachments, moves shared master ownership to Person, and adds owner-scoped shared proof on ReceiptBatch/PaymentBatch. Reversal preserves proof; a shared group never widens Member beneficiary visibility. Update exactly-one-owner constraints and private transport tests at cutover.


Configure server-only SUPABASE_URL, SUPABASE_STORAGE_BUCKET and SUPABASE_SECRET_KEY. Use separate private Supabase Storage buckets and credentials for development/test and production. Server secret keys bypass Storage RLS: Clerk and owner authorization must run before every operation. Keep buckets private; never expose public or signed browser URLs. Never expose credentials through VITE variables. Missing configuration disables attachment operations without disabling unrelated features.

The server uses Supabase Storage HTTP operations. storagePath remains the existing opaque relative key; no application SQL migration is needed. All six owner kinds retain protected delivery, owner authorization, MIME, safe disposition, private/no-store and nosniff. Origin firm prefixes are provenance only. POST uses x-upsert:false; reads and deletion remain server-mediated.

Uploads retain file/batch limits and PostgreSQL capacity locking. Failed metadata commits remove staged objects. Failed deletion commits restore captured bytes. These operations are compensation, not a distributed transaction. Automatic mutation retries are disabled because a timeout can have an unknown committed outcome. Logs include object identity for reconciliation.

## Fixtures and rollout

Before switching, inventory database storagePath values and retained R2 objects by relative key, size and SHA-256. Preserve originals. For disposable demo data, regenerate using the existing seed against a development database and isolated bucket; never reset production. For selected retained files, explicitly copy using the exact storagePath and verify downloaded size and SHA-256 before rollout. Do not delete R2 originals automatically. No automatic fixture copy or seed is performed by deployment.

Deploy configured development integration first. Verify PDF/image preview, download, multi-file upload, permanent deletion, denied access for all owner scopes, and access after replacing the application host with the same database/bucket. Record actual results. Production cutover requires these checks.

## Repair and rollback

Monitor structured attachment upload, cleanup and restore logs, Supabase Storage errors/latency, stored bytes and request usage; consult current provider quotas. Alert on cleanup/restoration failures and unexpected operation growth.

For cleanup failures or unknown upload outcomes, use logged key, database metadata and bucket inventory to identify orphaned objects after in-flight requests settle. Remove only confirmed orphans after review. For restoration failures, recover original bytes from backup at the exact storagePath, verify size/hash and authorized delivery; preserve metadata and audit evidence. Never treat access-denied/service errors as missing objects.

Back up database metadata and bucket objects together, preserving keys. Before real writes, rollback may restore previous deployment/configuration and fixture set. After Supabase Storage writes, inventory and copy affected objects to the rollback provider and verify checksums first; changing configuration alone loses access to new evidence.

Sources: https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/ and https://developers.cloudflare.com/r2/api/s3/extensions/ .


## Supabase cutover checklist

No application database schema migration is needed: Attachment.storagePath remains provider-independent. Storage owns its internal schema; do not edit storage.objects with SQL.

1. Select target project and dedicated private bucket; configure server secrets through the deployment secret manager. Never copy secrets into this document.
2. Export database attachment IDs/storagePath/fileSize and list source R2 objects with pagination. Join by exact key. Record missing references and unreferenced objects separately; never assume no retained data.
3. Download each referenced source object; record byte length and SHA-256 in a restricted manifest. Copy to identical target keys using POST with x-upsert:false. On collision, compare bytes; never overwrite blindly.
4. Download target bytes and compare length and SHA-256 for every referenced object. Stop on missing or mismatched bytes. Preserve R2 originals.
5. Freeze attachment writes, let in-flight operations finish, repeat inventory and copy/verify final delta. Back up database metadata and manifest together.
6. Deploy target configuration; verify authenticated upload/open/delete, unauthorized denial for all six owners, global client/employee access across authorized branches, and compensation failures. Resume writes only after checks pass.
7. Before target writes, restore previous deployment/configuration to roll back. After target writes, freeze writes again and reconcile new/deleted/restored objects against current metadata and audit records. Copy required new bytes back with hash verification; reconcile deletions explicitly so old R2 bytes cannot resurrect deleted evidence. Restore previous deployment only after verification. Never automatically delete source buckets.

Transport uses server-only secret apikey, POST object without overwrite, GET object without caching, and DELETE bucket with exact prefixes. Missing-object errors are distinct from missing buckets, denied access and outages. Modern and legacy errors are parsed explicitly. Unknown mutation outcomes must not be retried blindly: reconcile logged key against metadata and both inventories first.

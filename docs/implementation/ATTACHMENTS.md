# Local attachments

Set ATTACHMENTS_DIR to an absolute private path, for example C:/Dev/hono-start/storage/attachments on this PC. The application creates directories on upload; the application account must have read/write/delete permission. Keep the directory outside public, build output and disposable deployment folders. Missing configuration fails attachment operations without disabling unrelated features.

The storage filesystem must support hard links within this directory. Uploads write a temporary file and publish complete bytes through an exclusive hard link, preventing overwrite during concurrent uploads. Verify this with the actual runtime account; restricted sandboxes can reject hard links with EPERM even when normal host execution succeeds.

Upload a PDF, JPG or PNG up to 10 MB, open it from the detail drawer, then delete it with an authorized account. No Supabase configuration, migration or test-data cleanup is needed. Old test records with absent local files return not found.

Back up the attachment directory and database together. Restore relative file paths unchanged. For Docker on a VPS, mount a persistent volume (for example /data/attachments), set ATTACHMENTS_DIR to that absolute container path and grant access to the container account. Copy existing local files preserving directory structure. A container filesystem without a volume is disposable. Independent replicas require shared filesystem storage.

Rollback to the old provider cannot serve newly local files automatically; preserve a backup before rollback. Disk and database writes are not a single transaction: failed metadata creation triggers binary cleanup, and file deletion failure retains metadata.

Attachment owners are client, employee, contract, expense, fee and remuneration. Financial owners use nullable indexed foreign keys and the database exactly-one-owner constraint. Apply migration `20261025120000_add_financial_attachment_owners` before serving the updated application and regenerate Prisma. Existing files and relative paths remain unchanged. Financial upload authorization uses attachment upload plus scoped financial read, not monetary edit permission; contract completion does not block supporting evidence.


## Branch scope

See [Multitenancy](../domain/MULTITENANCY.md) for the current one-company/multiple-branch model. Client and Employee are global, including employee settings and lifecycle. Current Organization grants and Firm-scoped operations remain independent from shared identity. Attachment and audit firmId retain origin; their owner determines visibility.

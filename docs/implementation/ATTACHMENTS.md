# Local attachments

Set ATTACHMENTS_DIR to an absolute private path, for example C:/Dev/hono-start/storage/attachments on this PC. The application creates directories on upload; the application account must have read/write/delete permission. Keep the directory outside public, build output and disposable deployment folders. Missing configuration fails attachment operations without disabling unrelated features.

Upload a PDF, JPG or PNG up to 10 MB, open it from the detail drawer, then delete it with an authorized account. No Supabase configuration, migration or test-data cleanup is needed. Old test records with absent local files return not found.

Back up the attachment directory and database together. Restore relative file paths unchanged. For Docker on a VPS, mount a persistent volume (for example /data/attachments), set ATTACHMENTS_DIR to that absolute container path and grant access to the container account. Copy existing local files preserving directory structure. A container filesystem without a volume is disposable. Independent replicas require shared filesystem storage.

Rollback to the old provider cannot serve newly local files automatically; preserve a backup before rollback. Disk and database writes are not a single transaction: failed metadata creation triggers binary cleanup, and file deletion failure retains metadata.

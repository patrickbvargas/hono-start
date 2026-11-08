# Attachments

> **Scope**: Private Supabase Storage configuration, upload rules, owner authorization, transport contract. Does not cover attachment domain model (see domain/DOMAIN_MODEL.md § Entidades Transversais).

Configure server-only `SUPABASE_URL`, `SUPABASE_STORAGE_BUCKET` and `SUPABASE_SECRET_KEY`. Use separate private Supabase Storage buckets and credentials for development/test and production. Server secret keys bypass Storage RLS: Clerk and owner authorization must run before every operation. Keep buckets private; never expose public or signed browser URLs. Never expose credentials through VITE variables. Missing configuration disables attachment operations without disabling unrelated features.

The server uses Supabase Storage HTTP operations. `storagePath` remains the existing opaque relative key; no application SQL migration is needed. All eight current owner kinds (`person`, `contract`, `expense`, `receivable`, `payable`, `receipt`, `payment`, `remuneration-payable`) retain protected delivery, owner authorization, MIME, safe disposition, private/no-store and nosniff. Origin firm prefixes are provenance only. POST uses `x-upsert:false`; reads and deletion remain server-mediated.

Uploads retain file/batch limits and PostgreSQL capacity locking. Failed metadata commits remove staged objects. Failed deletion commits restore captured bytes. These operations are compensation, not a distributed transaction. Automatic mutation retries are disabled because a timeout can have an unknown committed outcome. Logs include object identity for reconciliation.

Transport uses server-only secret apikey, POST object without overwrite, GET object without caching, and DELETE bucket with exact prefixes. Missing-object errors are distinct from missing buckets, denied access and outages. Modern and legacy errors are parsed explicitly. Unknown mutation outcomes must not be retried blindly: reconcile logged key against metadata and both inventories first.

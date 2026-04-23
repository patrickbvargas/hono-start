## 1. Spec and persistence foundation

- [x] 1.1 Create the `attachment-management` spec delta for upload, list, owner-context binding, permission behavior, and lifecycle actions.
- [x] 1.2 Update the `lookup-reference-data` spec delta so attachment-type lookups are part of the canonical global lookup contract.
- [x] 1.3 Add Prisma models and relations for `Attachment` and `AttachmentType`, including firm scoping, active/deleted lifecycle fields, and exactly-one-owner validation support. DB migration required.
- [x] 1.4 Update seed data to upsert attachment-type lookup rows using stable `value` semantics.

## 2. Storage and server boundaries

- [x] 2.1 Add shared storage configuration/helpers for the Supabase Storage attachment bucket through the validated environment layer.
- [x] 2.2 Create `src/features/attachments/schemas/` for attachment model, form input, filter/query input as needed, and database-free file validation rules.
- [x] 2.3 Implement attachment data reads and writes in `src/features/attachments/data/` for owner-scoped list queries, upload persistence, metadata retrieval, delete, and restore-safe owner checks.
- [x] 2.4 Implement route-facing attachment query and mutation boundaries in `src/features/attachments/api/` with session-derived tenant scope and permission enforcement.

## 3. Feature UI and orchestration

- [x] 3.1 Add attachment feature constants, defaults, hooks, and the public barrel following the documented slice pattern.
- [x] 3.2 Implement reusable attachment list, upload form/modal, and delete confirmation components with pt-BR copy and explicit loading/error states.
- [x] 3.3 Show attachment sections in client, employee, and contract detail flows by composing the attachment feature rather than duplicating file logic in parent slices.

## 4. Authorization and verification

- [x] 4.1 Verify end-to-end attachment permissions so authenticated users can upload/view within allowed parent contexts and only administrators can delete.
- [x] 4.2 Verify cross-tenant and wrong-owner submissions are rejected before storage metadata is persisted.
- [x] 4.3 Add focused tests for attachment validation, owner-context checks, permission boundaries, and storage-write failure handling.
- [x] 4.4 Run `pnpm check` and fix all reported issues.
- [x] 4.5 Run `npx tsc --noEmit` and fix all reported issues.

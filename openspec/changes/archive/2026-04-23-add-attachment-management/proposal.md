## Why

The product contract already defines attachments as a core feature, but the current codebase has no attachment model, storage integration, or user workflow for client, employee, or contract files. Implementing attachment management now closes a documented gap that affects day-to-day legal operations, auditability, and contextual document access.

## What Changes

- Add a new attachment-management capability covering upload, list, view metadata, delete, and permission enforcement for attachments owned by clients, employees, or contracts.
- Introduce persistent attachment storage using the repository's documented Supabase Storage backend plus an `Attachment` business record scoped to one firm and exactly one owner context.
- Add attachment sections to the existing client, employee, and contract detail workflows so users can work with files without leaving the parent entity context.
- Enforce the documented file rules: supported types `PDF`, `JPG`, and `PNG`, maximum file size `10 MB`, authenticated upload and view permissions, and administrator-only deletion.
- Seed and expose attachment-type lookup values through the existing lookup-query contract so UI selectors use stable lookup `value` semantics.

## Capabilities

### New Capabilities
- `attachment-management`: Attachment upload, list, detail metadata, storage persistence, owner-context binding, and lifecycle permissions for client, employee, and contract attachments.

### Modified Capabilities
- `lookup-reference-data`: Extend the global lookup contract so attachment-type options are seeded, returned by stable `value`, and exposed as disabled options when inactive.

## Non-goals

- Building a standalone `/anexos` route or a generic document-management workspace separate from the parent entity contexts.
- Implementing attachment versioning, preview rendering, OCR, tagging, or full-text search.
- Reworking authentication, support, settings, or unrelated export/reporting features in the same change.

## Impact

- Affected code: new `src/features/attachments/**` slice, Prisma schema and seed updates, shared storage helpers, and attachment sections wired into the client, employee, and contract feature flows.
- Affected data model: new `Attachment` business table plus attachment-type lookup persistence and owner-context validation.
- External systems: Supabase Storage bucket configuration and server-side upload/delete orchestration.
- Affected roles: authenticated users gain upload and view behavior within allowed contexts; administrators additionally gain attachment deletion.
- Multi-tenancy: every attachment record, option query, upload, and delete path remains scoped to the authenticated user's `firmId`, and owner references must belong to the same tenant.

## Context

The repository currently implements the main entity-management slices for clients, employees, contracts, fees, remunerations, and audit logs, but attachments are still only a documented product concept. The domain contract requires attachments to belong to exactly one owner context among client, employee, or contract, to use Supabase Storage as the file backend, and to enforce role-aware upload, view, and delete behavior.

This change is cross-cutting for three reasons:

1. It adds a new persistence model and lookup-backed owner metadata.
2. It introduces file-storage orchestration against Supabase Storage.
3. It must plug into three existing business contexts without creating a second UI pattern outside the documented list, drawer, and modal flows.

The design therefore needs to preserve the repository's slice boundaries while avoiding a fragmented "attachments everywhere" implementation.

## Goals / Non-Goals

**Goals:**
- Introduce a dedicated `attachments` feature slice that owns attachment schemas, route-facing server wrappers, storage orchestration, validation, and UI components.
- Add a persistent `Attachment` record scoped by `firmId` and exactly one owner context: `clientId`, `employeeId`, or `contractId`.
- Integrate attachment list and upload workflows into existing client, employee, and contract detail contexts without creating a standalone attachment route.
- Enforce documented constraints for type, size, permissions, lifecycle state, and tenant isolation.
- Seed attachment-type lookup values and expose them through the standard lookup option contract.

**Non-Goals:**
- Building preview rendering, thumbnails, file transformation pipelines, or version history.
- Creating a cross-feature asset library outside the parent entity contexts.
- Expanding attachment support to fees, remunerations, dashboard widgets, or audit-log exports in this change.

## Decisions

### D1. Model attachments as a dedicated feature slice consumed by parent contexts

Attachments affect clients, employees, and contracts, but the behavior itself is one coherent concern: file validation, storage, lifecycle actions, metadata persistence, and owner-context checks. The implementation should therefore create `src/features/attachments` as the authoritative feature boundary, then let client, employee, and contract detail components consume top-level attachment UI entrypoints from that feature.

This keeps file-specific logic out of the parent slices while preserving the documented rule that routes and parent screens compose features rather than owning business logic themselves.

Alternative considered: implement attachment code separately inside each parent feature. Rejected because it would duplicate the same file rules, storage orchestration, and permission checks three times.

### D2. Persist attachment ownership with one table and exactly one nullable owner foreign key set

The domain model says an attachment belongs to exactly one context among client, employee, or contract. The Prisma schema should represent this with a single `Attachment` table that carries:

- `firmId`
- `clientId?`
- `employeeId?`
- `contractId?`
- `typeId`
- `fileName`
- `storagePath`
- `fileSize`
- `mimeType`
- `isActive`
- `createdAt`
- `updatedAt`
- `deletedAt`

Server-side write validation must assert that exactly one owner field is present and that the referenced owner belongs to the same firm as the authenticated session.

Alternative considered: three separate attachment tables. Rejected because it multiplies storage and lifecycle logic without adding business value.

### D3. Keep storage identity separate from user-visible metadata

The attachment record should keep the original user-visible file name separately from the storage path used in Supabase Storage. Uploads should generate a deterministic firm-scoped storage path that avoids collisions and does not treat the original filename as a unique key.

This preserves:
- stable display names for users
- safe storage-key generation
- simpler delete/restore handling because the DB row remains the business source of truth

Alternative considered: use the original filename as the storage key. Rejected because it increases collision risk and couples business presentation to storage internals.

### D4. Upload and view are authenticated-context actions; delete remains administrator-only

The current session policy already defines `attachment.view`, `attachment.upload`, and `attachment.delete`. The attachment feature should reuse those permissions directly:

- authenticated users can upload and view attachments within allowed parent contexts
- only administrators can delete attachments

Parent-resource validation still matters. Uploading or listing attachments under a contract must respect the same tenant and route-level access constraints as the parent contract itself.

Alternative considered: allow all authenticated users to delete their own uploaded files. Rejected because it contradicts the current documented permission model.

### D5. Attachments live inside existing detail contexts, not a standalone route

The product contract describes attachments as part of client, employee, and contract contexts. The first implementation should therefore render attachment sections inside the existing detail workflows for those entities:

- list existing attachments
- open an upload modal
- show metadata and file-open actions
- show delete action only when the session allows it

This preserves the current product shape of lists, drawers, and modals rather than introducing a separate CRUD surface.

Alternative considered: create a global attachment management route first. Rejected because it is outside the documented interaction model and would widen the change unnecessarily.

### D6. Attachment-type lookup behavior extends the existing lookup contract

Attachment types are already part of the domain lookup catalog. The implementation should therefore add `AttachmentType` lookup persistence and seed rows using the same stable `value` semantics as the other lookup-backed selectors. The attachment form binds by lookup `value`, option queries return all rows ordered by `label`, and inactive attachment types remain visible as disabled options.

Alternative considered: hard-code attachment types in the form schema. Rejected because it would bypass the documented lookup-table contract.

## Risks / Trade-offs

- [Risk] File upload flows can leak storage errors or partial writes. → Mitigation: validate input before upload, run metadata persistence only after successful storage write, and clean up storage objects if the DB write fails.
- [Risk] Parent-resource permissions differ across clients, employees, and contracts. → Mitigation: centralize owner-resource resolution in the attachment feature and reuse existing session-policy checks where available.
- [Risk] Soft-delete semantics can leave orphaned storage objects. → Mitigation: soft-delete only the DB record by default and reserve physical storage deletion for administrator delete handling or later cleanup policy.
- [Risk] Attachment UI can bloat existing detail drawers. → Mitigation: keep the embedded section compact and route heavy interactions through upload/delete overlays.
- [Risk] Supabase bucket setup may vary by environment. → Mitigation: isolate bucket configuration in validated environment-backed shared storage helpers.

## Migration Plan

1. Add Prisma schema for `Attachment` and `AttachmentType`.
2. Generate and apply the migration using the repository's reset-first Prisma workflow.
3. Update seeds to include attachment-type lookup rows.
4. Introduce shared storage helpers and the `attachments` feature slice.
5. Wire attachment sections into client, employee, and contract details.
6. Validate upload, view, and delete behavior against session and tenant rules.

Rollback strategy:
- Revert the feature slice and parent-context wiring.
- Remove the Prisma migration if the change is not yet deployed.
- If deployed, keep stored files untouched and roll back the UI/server paths first, then plan a follow-up migration if table removal is needed.

## Open Questions

- Whether the first release should expose signed file URLs directly from the server boundary or proxy downloads through a server function.
- Whether soft-deleted attachment rows should immediately trigger physical storage deletion or leave objects in place until an explicit cleanup process exists.
- Whether employee attachment visibility should remain administrator-only because the employee route itself is admin-only, or whether later own-profile work should reuse the same attachment feature in a self-service profile context.

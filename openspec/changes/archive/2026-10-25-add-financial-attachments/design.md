## Context

Attachments already implement private storage, exactly one owner, atomic batches, per-owner capacity and audit events. Financial records have dedicated workspaces and contextual detail drawers. Authorization comes from Clerk capabilities and persisted parent scope.

## Goals / Non-Goals

**Goals:** Extend the same attachment flow to Fee and Remuneration across page and drawer, preserving firm isolation, assigned fee visibility and own remuneration visibility.

**Non-Goals:** New file formats, payment reconciliation, editing monetary fields, external services or a new UI architecture.

## Decisions

- Add nullable feeId/remunerationId foreign keys and indexes to Attachment and update the database exactly-one-owner check. Reuse existing storage and audit instead of separate financial file tables.
- Resolve Fee through its revenue/contract and Remuneration through its contract assignment. Require attachments:read plus fees:read_all/read_assigned or remunerations:read_all/read_own for list/download. Delete retains attachments:delete plus parent subject access.
- Financial upload requires attachments:upload plus parent subject read, rather than monetary update permission: recording evidence does not edit financial values and must work after contract completion. Reject uploads when the owner or financial ancestors are soft-deleted. Existing owner authorization stays unchanged.
- Add Anexos tabs through each workspace search schema, expanded shared sections and compact sections in contextual details. Shared components retain upload, capacity, loading, empty/error and delete flows.
- Keep PDF/JPG/PNG, 10 MB per file, 25 files per owner, atomic batch rollback and independent attachment ownership. A remuneration attachment does not become a receipt attachment or proof of payment automatically.

## Risks / Trade-offs

- Financial evidence disclosure → enforce subject permissions on list, upload, protected bytes and deletion with persisted scope tests.
- Completed contract prevents ordinary financial editing → documentation uploads are explicitly independent of financial editing, without changing lifecycle permissions.
- Schema/client mismatch → deploy the additive migration and regenerate Prisma before serving new owners.
- Context7 is not available in this session; reuse local established library patterns and validate with Prisma, TypeScript and tests.

## Migration Plan

Apply the additive migration before starting the updated app; no existing metadata or binaries move. Roll back application first; keep additive columns to retain uploaded evidence. Do not drop financial attachment columns while records reference them.

## Open Questions

None for this scope.

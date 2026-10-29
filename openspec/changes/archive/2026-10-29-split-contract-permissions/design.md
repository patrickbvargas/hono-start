## Context
Aggregate editing currently implies team, financial and lifecycle powers. Clerk remains authority.
## Goals / Non-Goals
Independent edit grants; no auth replacement or DB migration.
## Decisions
Require scoped editing plus sensitive action grants. Compare restricted submitted groups against persisted form-shaped data, ignoring array order. Unchanged groups remain allowed. Creation includes required team/terms and always starts ACTIVE. Initial lock requires manage_status_lock. Disable corresponding UI controls. Never derive grants from role names.
## Risks / Trade-offs
Missing provider grants deny edits: migrate additively before deployment. Stale restricted submissions are rejected. Server checks remain authoritative.
## Migration Plan
Inventory configured Clerk instance, add permissions and preserve existing role powers: editors get team/terms, update_all gets lifecycle grants. Verify read-back. Preserve unrelated provider grants. Rollback application before removing additions.

## Provider execution (2026-10-29)
Configured development instance verified through Backend API. Created all four permissions. org:member received manage_assignments/manage_revenues; org:admin received all four. org:expense unchanged. Read-back confirmed additions and preservation of all prior grants. Legacy accounts:manage remains remotely for rollback but is ignored locally. Production was not configured or modified.

All 47 custom permission descriptions in the development instance were updated to short pt-BR sentences at the user's request and verified through API read-back; system permissions were untouched. Development settings do not continuously sync to production.

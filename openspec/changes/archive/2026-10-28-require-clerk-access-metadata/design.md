## Context

The session resolver conflates invalid business configuration with signed-out identity. Missing Employee metadata currently permits general grants. Login already offers OrganizationList for denied organization access.

## Goals / Non-Goals

Goals: require both private bindings for every role; explain all metadata-shape issues together; preserve server enforcement and recovery.
Non-goals: metadata editing, account provisioning, permission changes, database migrations.

## Decisions

- Resolve a Zod discriminated access state (ready, configuration_required, unauthenticated) in the existing request-local server cache. Existing optional session readers continue returning null for denied access. Required readers throw safe configuration guidance instead of claiming expiry.
- Login reads the access state on each route validation and renders configuration issues without private values. Protected layout continues denying child loading through the canonical session helper.
- Validate both metadata shapes before database lookups. Resolve valid Firm and active/non-deleted Employee references server-side; no fallback or default permissions. Keep legacy nullable actor types for defensive scope consumers, but the resolver never emits an unbound actor.
- Reuse existing OrganizationList and logout hook. A feature hook owns retry orchestration, cancels requests, clears cached data and invalidates routes to discard previous-scope data after corrected metadata; successful login verification returns to the safe original destination. Shared UI supplies buttons and a restrained bordered notice matching the existing authentication surface.
- Retain provider failure errors separately: outages and revoked identities never become metadata configuration findings. No new vendor APIs beyond documented server reads and existing UI components.

## Risks / Trade-offs

- Existing unbound administrators lose access → operators must populate numeric privateMetadata.employeeId before rollout.
- Configuration can change after render → retry reads current server state; every protected server request verifies independently.
- Additional login verification → reuse request-local resolution; do not persist security decisions across requests.

## Migration Plan

No database migration. Configure both private mappings in the correct Clerk environment, deploy, and verify missing/invalid/both/valid states. Rollback application change if necessary; metadata remains compatible.

## Open Questions

None.

Organization selection is hidden whenever any employeeId or firmId configuration issue exists, including combined issues, because required metadata must be corrected in Clerk. Retry and sign-out remain available. Organization selection remains available before selection or for other access denials without configuration findings.

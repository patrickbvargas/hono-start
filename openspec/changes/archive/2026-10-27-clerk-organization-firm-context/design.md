## Context

Shared sessions currently read live Clerk session, User and membership, optionally resolve an Employee, then select the first Firm. Organization changes already clear frontend queries and invalidate routes. Business entities already carry firmId scopes. The user explicitly wants Clerk-owned mappings without local provider identity columns.

## Goals / Non-Goals

**Goals:** Resolve the configured Firm for each active Organization; fail closed for invalid links; preserve general-capability accounts without Employee; offer organization selection when application access fails.

**Non-Goals:** Database changes, provider metadata edits, fixed IDs or name-based defaults, cross-branch reporting, changing permissions, and redesigning global Employee metadata.

## Decisions

1. Fetch the active Organization with `clerkClient().organizations.getOrganization({ organizationId: identity.orgId })` alongside existing live provider reads. Parse only server-fetched privateMetadata.firmId through an explicit Zod schema. Public/unsafe metadata and browser claims are not authorities. No cross-request cache is introduced.
2. Resolve Firm with `findUnique({ where: { id: firmId } })`. Missing/invalid/nonexistent metadata returns no domain session. Existing middleware denies protected functions and route guard returns to login. No first-row fallback or local organization link.
3. Resolve optional User privateMetadata.employeeId using existing active/nondeleted constraints, and compare its Firm to the active unit. An explicit invalid/inactive/deleted binding denies the session. A valid Employee in another Firm is not carried into the unit: employee and employeeType are null, own/assigned grants are stripped, and authorized general grants remain. An absent binding has the same scope restriction.
4. Signed-in login with an active Organization but no domain session displays a safe unavailable-access message and Clerk OrganizationList, allowing a different Organization selection. This avoids falsely asking the user to reauthenticate and preserves the destination URL. The message does not expose IDs or private metadata.
5. Existing query-clearing boundary and server-scoped data APIs remain the enforcement mechanisms. Multiple Organizations may deliberately share a Firm. Mapping changes are effective on the next server request, without database edits or webhook dependencies.

Alternatives rejected: unique clerkOrganizationId on Firm (duplicates operator mapping), User firmId (cannot represent active branch selection), default Firm (widens access after misconfiguration), carrying a foreign-Firm Employee (leaks actor scope across units).

## Risks / Trade-offs

- Extra provider read per request -> parallelize with existing verification and reuse only within the same Request.
- Misconfiguration blocks access -> recovery OrganizationList remains available; operator repairs Clerk metadata.
- One employeeId cannot represent different employees across branches -> omit the foreign-Firm actor and own/assigned grants, preserve general grants; per-branch actor design remains out of scope.
- Live remapping affects the next server operation but is not pushed into an idle browser -> existing route/session refresh and authoritative server checks remain in force.

## Migration Plan

Update canonical docs, implementation and tests together. Operators configure numeric privateMetadata.firmId on each Organization intended to access the app. No database migration, reset or provider write is performed. Existing sessions are revalidated on the next request. Rollback requires deliberate review because the former first-Firm fallback is less restrictive.

## Open Questions

None for this scope. Matriz and POA are manual test examples only; no organization names or Firm IDs are hard-coded.

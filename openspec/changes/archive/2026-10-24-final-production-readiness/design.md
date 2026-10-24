## Context

The existing source has architecture, naming, form, cache and authorization guardrail tests. Initial Biome, type and build checks pass. Attachment filesystem tests fail with EPERM only inside the restricted sandbox; all twelve pass outside it. Root configuration files are mostly excluded from Biome. README and persistence/security summaries contain stale statements.

## Goals / Non-Goals

Goals: preserve house patterns, reconcile documentation, make release verification reproducible and report actual evidence.
Non-goals: business redesign, new dependencies, provider changes, database migrations or deployment.

## Decisions

- Reuse existing guardrail tests rather than introduce another architecture checker.
- Preserve atomic hard-link publication: confirmed sandbox restriction is not an application defect.
- Extend the existing Biome include list to maintained root configuration files, format them and add a read-only verification script. Consult current Biome Context7 documentation before edits.
- Clarify owning documentation rather than duplicate domain rules in new summaries.
- Record operator checks separately from automated results; authenticated browser success cannot be inferred from mocked unit tests.
- Preserve existing audit sorting: schema fallback is id descending, the data layer maps that to createdAt descending, and URL defaults remain occurredAt ascending. Record this difference without changing user-adjusted behavior. Tests distinguish schema fallback from URL reset defaults.
- Preserve the remuneration table without a subtotal footer. Update the stale dashboard specification and test expectation rather than uncommenting removed UI behavior. The user's current code takes precedence over older documentation for this pass.
- Inspect public barrel declarations without importing the application dependency graph. Existing assertions test the export contract; evaluating provider/server modules during collection caused suite hangs.

## Risks / Trade-offs

- Restricted filesystem operations can produce false failures → run filesystem tests with appropriate host permissions.
- Automated checks cannot establish real provider configuration or backup recovery → document release prerequisites and leave unverified checks explicit.
- Existing full-suite hangs may be unrelated to assertions → isolate worker/environment behavior and retain failures as evidence.

## Migration Plan

No database migrations. Review and run the verification command, then follow deployment prerequisites. Rollback consists of reverting tooling/docs changes.

## Open Questions

Production credentials, target platform and authenticated operator rehearsal remain environment-dependent.

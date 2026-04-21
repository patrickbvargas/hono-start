## Context

Authorization is centralized in `src/shared/session/policy.ts`, but the file mixes core decision logic with feature-specific sugar helpers. Current behavior is aligned with the documented role model: admins pass all firm-scoped checks, users pass only shared authenticated actions, own-profile actions, assignment-scoped contract and fee actions, own remuneration actions, and writable-contract mutations.

This change is a readability refactor. Session-derived firm, employee, and role context remains authoritative. Feature validation rules remain in feature schemas, rules, and data modules.

## Goals / Non-Goals

**Goals:**

- Make the authorization decision table compact and easy to audit.
- Preserve current allow/deny behavior and pt-BR denial messages.
- Keep firm isolation as the first resource-backed gate.
- Prefer `can(session, action, resource)` and `assertCan(session, action, resource)` as the route-facing API.
- Cover the permission matrix with tests before changing implementation shape.

**Non-Goals:**

- No permission, role, resource, validation, database, or session-shape behavior changes.
- No feature business-rule migration into shared session policy.
- No new dependency or OpenSpec product capability.

## Decisions

### Use categorized action sets instead of a long action switch

Represent non-admin policy with small named sets such as public authenticated actions, admin-only actions, assignment-scoped actions, writable assignment-scoped actions, own-employee actions, and own-remuneration actions.

Rationale: action categories map directly to the documented permission matrix and make repeated feature-specific switch branches unnecessary.

Alternative considered: keep the switch and only delete wrapper helpers. This reduces exports but leaves the main policy harder to scan.

### Keep generic `can` and `assertCan` as the canonical API

Consumers should call `can(session, "<action>", resource)` for UI affordances and `assertCan(session, "<action>", resource)` for server enforcement. Feature-specific wrappers should be removed unless they protect a commonly reused route boundary and clearly improve readability.

Rationale: the action string is already the stable policy identity, and one API makes permission checks easier to search and test.

Alternative considered: keep one wrapper per action. This is more discoverable at call sites but makes the shared policy surface large and duplicative.

### Keep resource helpers private where possible

Helpers for same-firm, assignment, own-employee, own-remuneration, and contract writability should stay close to policy logic. Export only helpers already needed outside policy, such as contract read-only or writable checks.

Rationale: reducing exports prevents shared session policy from becoming a general feature utility module.

Alternative considered: move each helper into separate modules. That adds files without reducing policy complexity enough for this change.

### Preserve error catalog shape

The denied-action message map remains keyed by `SessionAction`. It can move near the action policy data, but every action must retain a safe pt-BR message.

Rationale: server callers depend on `assertCan` throwing user-safe errors, and missing messages would weaken reliability.

## Risks / Trade-offs

- Behavior drift during refactor -> Add matrix-style tests before reshaping policy, including admin allow, user deny, cross-firm deny, assignment checks, own-resource checks, and read-only contract mutation denial.
- Lost wrapper imports -> Update call sites in the same change and keep only wrappers that remain intentionally public.
- Over-compression -> Prefer named categories over clever predicates so future maintainers can map code back to `ROLES_AND_PERMISSIONS.md`.
- False sense of validation coverage -> Keep validation tests in feature slices; session tests only cover authorization.

## Migration Plan

1. Add or expand shared session authorization tests that pin current behavior.
2. Replace the long switch with categorized action policy logic.
3. Remove unused feature-specific wrapper exports and update consumers to `can` or `assertCan`.
4. Run typecheck and tests.

Rollback is a normal code revert because no data, migration, dependency, or runtime configuration changes are involved.

## Open Questions

- None.

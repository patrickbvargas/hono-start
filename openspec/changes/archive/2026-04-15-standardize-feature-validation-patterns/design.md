## Context

The repository already has a workable feature-slice structure, and `src/features/employees` is the first slice far enough along to act as a reference point. The problem is that the pattern is not fully consistent yet: some business checks are duplicated between form schemas, hooks, and server handlers, and some feature code still contains compatibility-era branching that no longer matches the current persistence contract.

This change standardizes the pattern across feature slices rather than changing product behavior. The important constraint is that the same business rule should live at one canonical boundary, with other layers staying thin and orchestration-focused.

## Goals / Non-Goals

**Goals:**
- Define one consistent validation and boundary pattern that all feature slices can follow.
- Keep form schemas responsible for request shape, normalization, and pure refinements.
- Keep API/server modules responsible for persisted-state checks, lookup resolution, tenant scoping, and write enforcement.
- Remove redundant validation and compatibility shims where the canonical boundary already exists.
- Use the employee slice as the reference implementation for the final structural shape.

**Non-Goals:**
- Changing the underlying business rules for any entity.
- Introducing a generic CRUD framework or a new shared validation abstraction too early.
- Changing route URLs, permissions, tenant isolation, or data model semantics.
- Refactoring every feature into a brand-new architecture; the existing slice pattern remains the base.

## Decisions

### D1. Keep validation layered, but not duplicated

The canonical flow will be:

1. form schema validates request shape and pure business invariants
2. feature hook orchestrates submit, toast, and cache refresh
3. feature API resolves persisted-state dependencies and executes writes
4. route composes the feature and validates search state only

The hook should not re-run the same schema validation that the form layer already performed. Server handlers still validate at the boundary, but client-side orchestration should stay thin.

Alternative considered: keep schema validation in the form, hook, and server handler for defense in depth. Rejected because the same rule ends up expressed three times, which makes feature slices drift and obscures where the true boundary lives.

### D2. Move persisted-state and lookup checks to the feature API boundary

Rules that depend on Prisma, current record state, or lookup activity state belong in feature API modules, not in form schemas. This keeps pure validation reusable and keeps database-backed checks where the data is actually available.

For employees, that means:
- lookup selection resolution stays in the API layer
- active/inactive lookup checks stay in the API layer
- firm-scoped existence checks stay in the API layer

Alternative considered: keep those checks in Zod refinements where possible. Rejected because the schema layer must remain database-free and should not become a second persistence layer.

### D3. Remove compatibility shims when the underlying contract is already stable

Feature code should not retain runtime table-existence checks or placeholder fallbacks once the schema and migrations already define the table. The employee contract-count helper currently contains this kind of fallback logic; the standardized pattern should remove that class of shim and rely on the real persistence contract.

Alternative considered: keep compatibility guards in feature code to support partially bootstrapped environments. Rejected because it makes feature code carry migration-era assumptions long after the schema is stable.

### D4. Standardize error handling through explicit feature-local mapping

Server handlers should surface user-facing Portuguese messages through explicit, readable error handling rather than substring matching on arbitrary exception text. The preferred pattern is:

- catch known Prisma or persistence failures explicitly
- map them to stable user-facing errors
- rethrow unexpected failures as generic safe errors

Alternative considered: continue matching partial error strings because it is fast to write. Rejected because it is brittle, hard to test, and encourages hidden coupling to implementation details.

### D5. Treat employees as the reference slice, not a copy-paste template

The employee slice is the baseline for the final shape of feature code, but not every employee-specific rule should be generalized. The standard is the structural pattern:

- `schemas/` define contracts
- `api/` owns persistence and server checks
- `hooks/` owns orchestration
- `components/` owns presentation
- routes stay declarative

Alternative considered: rewrite employees first into a fully generic pattern and then backport that everywhere. Rejected because the codebase needs a stable reference now, and the reference is already usable as long as we separate behavior from shape.

## Risks / Trade-offs

- [Risk] Removing redundant validation may expose assumptions that were silently masked by duplicate checks. → Mitigation: keep server-boundary validation, add focused tests, and verify each feature against the documented business rules.
- [Risk] Error-message cleanup may change a few user-visible strings. → Mitigation: preserve the existing pt-BR messages where the business meaning is unchanged and centralize message mapping in one feature-local place.
- [Risk] Cleaning out compatibility shims could break code that depended on partial bootstrapping. → Mitigation: verify the Prisma schema and migrations before removing fallback logic, and keep rollback simple by limiting the change to feature-local code paths.
- [Risk] Other features may not yet match the employee slice exactly. → Mitigation: apply the same boundary pattern incrementally feature by feature rather than forcing a large unrelated refactor.

## Migration Plan

1. Update the affected specs so the canonical pattern is explicit.
2. Refactor the employee slice first to remove redundant validation and compatibility-era fallback logic.
3. Align the remaining feature slices to the same schema/API/hook/component boundary pattern.
4. Add or adjust tests around the server boundary and the representative employee flows.
5. Verify that no business rule changed, only the placement and clarity of the checks.

Rollback is straightforward: restore the previous local validation and error-matching code if a feature-specific regression appears, without changing the persisted schema.

## Open Questions

- Should the explicit error-mapping helper remain feature-local in every slice, or should a generic shared helper be introduced only after the pattern repeats in multiple features?
- Should the employee slice be documented as the reference implementation in implementation docs as well, or should that remain only in the OpenSpec contract?

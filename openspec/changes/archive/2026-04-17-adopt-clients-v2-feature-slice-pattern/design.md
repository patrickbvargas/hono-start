## Context

The repository already documents a reusable feature-slice architecture, but the documented baseline still reflects an older shape centered on `src/features/employees`, a single `rules.ts` file, and a less explicit separation between server wrappers and persistence modules. The `src/features/clients_v2` slice now expresses the intended house pattern more clearly: route-facing server wrappers live in `api/queries.ts` and `api/mutations.ts`, persistence logic lives in `data/queries.ts` and `data/mutations.ts`, lookup access is kept feature-local, hooks own orchestration, and read-model mapping is explicit.

The implementation docs should adopt that real slice shape so future feature work follows one concrete pattern instead of inferring conventions from mixed historical examples. This is a documentation-contract change first; broad slice rewrites can happen later as separate implementation work.

## Goals / Non-Goals

**Goals:**
- Establish `src/features/clients_v2` as the canonical reference slice for implementation docs.
- Update the documented feature anatomy to include the `api/` and `data/` split, feature-local `rules/` directory, and minimal public barrel.
- Clarify the ownership boundary between request validation, pure assertions, persistence-aware checks, server wrappers, hooks, components, and routes.
- Clarify the read-model convention that list/detail schemas expose UI-ready labels while preserving stable lookup values where needed for edits and writes.
- Align the docs with the `assertX` convention used by the reference slice for exported rule assertions.

**Non-Goals:**
- Refactoring all existing feature slices to match the new documentation in this change.
- Changing business behavior, permissions, or route UX.
- Forcing every feature to export identical files when the responsibility does not exist in that feature.
- Introducing new shared abstractions or frameworks for feature code.

## Decisions

### 1. `clients_v2` becomes the documented reference slice

The docs will replace `src/features/employees` as the named baseline with `src/features/clients_v2`.

Why:
- `clients_v2` expresses the current intended split more clearly than the legacy slices.
- It already demonstrates the desired route-facing surface, query/mutation wrapper pattern, and explicit read-model mapping.

Alternatives considered:
- Keep `employees` as the documented reference. Rejected because it preserves older structural drift in the docs.
- Document an abstract ideal shape without naming a reference slice. Rejected because contributors need one concrete example when evaluating deviations.

### 2. Canonical feature anatomy is responsibility-based

The implementation docs will describe a canonical slice shape built around responsibility classes:
- `api/queries.ts` and `api/mutations.ts` for route-facing server wrappers and React Query option factories
- `data/queries.ts`, `data/mutations.ts` for Prisma-backed behavior and persistence-aware lookup checks
- `rules/` for pure assertion helpers
- `hooks/` for orchestration
- `components/` for feature UI entrypoints
- `schemas/` for request, search, filter, sort, and read-model contracts
- `utils/` for formatting and defaults
- `index.ts` for the minimal public barrel

Why:
- This matches the real working pattern and makes feature responsibilities easier to compare across slices.

Alternatives considered:
- Keep the looser `api/`, `rules.ts`, `schemas/`, `utils/` description only. Rejected because it is too vague for new slice work.

### 3. Read-model mapping is part of the documented contract

The docs will explicitly state that feature read models are UI-ready shapes, not raw Prisma rows, and that lookup-backed read fields may carry both display labels and stable values.

Why:
- The reference slice depends on explicit mapping to avoid leaking persistence shape into components.
- This is a recurring source of drift when new slices skip the mapping step.

Alternatives considered:
- Leave read-model mapping implicit. Rejected because the docs should protect this boundary directly.

### 4. Hook write flow is documented around parsed payload submission

The docs will describe feature form hooks as the orchestration boundary that selects the schema, submits the parsed payload to mutations, and owns toast and cache refresh behavior.

Why:
- This preserves a single clear validation boundary while keeping hooks responsible for orchestration.

Alternatives considered:
- Allow per-slice variation between casting, reparsing, and parsed-payload submission. Rejected because it reintroduces silent slice drift.

### 5. Rule docs align to exported `assertX` entrypoints

The implementation docs and affected specs will adopt the exported `assertX` naming convention for pure rule assertions in the reference slice.

Why:
- The reference slice already uses assertion-style exports that throw on violation.
- The contract should match the intended house pattern rather than preserve stale naming text.

Alternatives considered:
- Keep the `validate...` wording in docs and treat `clients_v2` as an exception. Rejected because the user intends this slice to define the new pattern.

## Risks / Trade-offs

- [Risk] The docs may get ahead of the rest of the codebase and make older slices look non-compliant. → Mitigation: describe `clients_v2` as the canonical pattern for future work and incremental refactors, not as proof that all existing slices are already aligned.
- [Risk] Over-specifying the reference slice could encourage copy-paste cloning instead of responsibility-based adaptation. → Mitigation: document the pattern as the baseline by responsibility, with deviations allowed when justified by feature-specific behavior.
- [Risk] Changing the documented rule-entrypoint naming from `validate...` to `assert...` could conflict with older change artifacts. → Mitigation: limit this change to the implementation contract and the affected capability specs, and let future refactors converge existing slices incrementally.

## Migration Plan

1. Update the affected capability specs to describe the new reference slice and boundary expectations.
2. Update `docs/implementation/ARCHITECTURE.md`, `docs/implementation/CONVENTIONS.md`, and `docs/implementation/FRONTEND.md` to reflect the `clients_v2` pattern.
3. Review implementation-doc references to older slice shapes and remove conflicting wording.
4. Treat future feature work and slice refactors as conforming to the new documented baseline unless a documented exception is introduced.

Rollback is straightforward: restore the prior implementation-doc wording and prior capability requirements if the team decides not to adopt `clients_v2` as the reference slice.

## Open Questions

- Should the minimal public barrel contract continue exporting only list-query options and route-facing components, or should detail/options query factories also become part of the standard public surface?
- Should the implementation docs explicitly require a `rules/` directory shape, or allow `rules.ts` as a documented exception for legacy slices while the codebase converges?

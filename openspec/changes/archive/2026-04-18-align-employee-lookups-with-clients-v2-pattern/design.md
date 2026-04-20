## Context

`src/features/employees` already shares the same broad slice anatomy as `src/features/clients_v2`, but it still diverges in several finer-grained ways: equivalent responsibilities use different names, some internal access patterns are less explicit than the client reference, and lookup-backed writes still describe themselves through employee-specific aggregate helpers instead of the smaller reference flow used by clients.

This change is therefore a full employee-slice alignment effort, not a lookup-only cleanup. Lookup validation is one of the clearest mismatches, but the broader objective is that a contributor should be able to compare `employees` and `clients_v2` side by side and see the same house pattern for like-for-like responsibilities, with only genuine domain differences remaining.

The lookup mismatch still matters because employees is the first local slice that validates more than one lookup family on the same write. If it keeps a separate aggregate pattern, future slices will have two competing house styles:

- `clients_v2`: singular lookup assertions
- `employees`: combined multi-lookup resolvers

The repository contract already prefers aligned naming for equivalent responsibilities. This change is the point where that contract needs to become explicit.

## Goals / Non-Goals

**Goals:**
- Refactor the employee feature so equivalent responsibilities follow the same pattern and naming as `clients_v2`.
- Make employee lookup-backed writes read like an extension of the `clients_v2` pattern rather than a different pattern.
- Keep type and role validation independent in naming and flow while still supporting employee-specific rules that touch both values.
- Preserve current business behavior for inactive lookups, edit defaults, OAB validation, referral validation, authorization, and firm scoping.
- Touch `clients_v2` only when a repository-wide naming decision must stay aligned across both slices.

**Non-Goals:**
- No new business rules for employees or clients.
- No change to UI structure, route paths, overlay behavior, or search params beyond import or naming alignment.
- No premature extraction into `shared/` for lookup validation helpers that are only proven in these two slices.
- No attempt to standardize unrelated slice details in the same change.

## Decisions

### Decision: Treat `clients_v2` as the baseline for all equivalent employee responsibilities

The refactor will start from the assumption that `clients_v2` is correct for any responsibility both slices share. That includes naming, module boundaries, direct-vs-convenience imports, rule placement, and write orchestration shapes. Employee-specific behavior remains where the domain genuinely differs.

Rationale:
- This keeps the change centered on the repository's documented reference slice.
- It prevents the refactor from degenerating into isolated cleanup items with no coherent finish line.
- It gives implementation a clear test: if two responsibilities are equivalent, they should look equivalent unless the employee domain forces a difference.

Alternatives considered:
- Limit the change to lookup validation only. Rejected because it would leave the same larger slice drift in place.
- Do a broad style cleanup with no clear local reference. Rejected because the contract already names `clients_v2` as the reference.

### Decision: Treat `clients_v2` singular lookup validation as the baseline pattern

Employee writes will adopt the same conceptual sequence already used by clients:

1. Resolve each submitted lookup `value` to a persisted lookup row.
2. Assert the lookup exists.
3. Assert the lookup is selectable for the current write.
4. Apply any feature-specific cross-field rules that remain after lookup resolution.
5. Persist with resolved lookup ids.

For employees, that means `type` and `role` follow the same sequence independently instead of being hidden behind one combined resolver.

Rationale:
- This keeps multi-lookup complexity additive instead of inventing a second house pattern.
- It makes employees easier to compare against the reference slice during reviews.
- It gives future slices a repeatable template for "one lookup" and "many lookups" without changing the responsibility names.

Alternatives considered:
- Keep the aggregate employee helper and document it as the multi-lookup exception. Rejected because it creates a second vocabulary for the same write flow.
- Introduce a new generic shared lookup-validation abstraction. Rejected because the repeated pattern is clear, but the stable shared API is not yet proven.

### Decision: Use aligned, per-lookup names in employees and only rename clients if the new term is clearly better

The default direction is to rename employee helpers toward the `clients_v2` house terms, not the other way around. Concretely, employee lookup validation should expose singular role-appropriate names such as:

- existence assertions per lookup family
- selectability assertions per lookup family
- data helpers that fetch one lookup family by stable `value`

If implementation reveals that the client names themselves are the weaker terms, both slices must adopt the better shared term in the same change.

Rationale:
- The repo contract already points to `clients_v2` as the reference slice.
- A one-way alignment is cheaper and easier to review than introducing a third naming scheme.
- The escape hatch avoids freezing a mediocre term simply because it exists in the reference.

Alternatives considered:
- Keep clients untouched and accept divergent employee terms. Rejected because the user explicitly wants shared naming.
- Force a large repository-wide rename up front. Rejected because only equivalent responsibilities in these two slices are in scope.

### Locked shared names for equivalent responsibilities

The change locks these equivalent names across `clients_v2` and `employees`:

- lookup query by stable value: `get<Type>ByValue`, `get<Role>ByValue`
- lookup existence assertion: `assertTypeExists`, `assertRoleExists`
- lookup selectability assertion: `assertTypeCanBeSelected`, `assertRoleCanBeSelected`
- feature cache key imports stay direct from `constants/cache`
- feature sort-column imports stay direct from `constants/sorting`
- feature value constants stay direct from `constants/values`

These names are now the baseline for equivalent responsibilities in future entity slices unless the reference slice is intentionally renamed in the same change.

### Decision: Keep employee-specific cross-field rules separate from per-lookup resolution

Employees has one true multi-field concern that clients does not: some validations depend on both the selected employee type and other employee inputs, such as OAB presence and referral constraints. Those rules stay separate from lookup existence/selectability.

The resulting boundary is:

- `schemas/form.ts` and pure `rules/`: database-free validations
- `data/queries.ts`: fetch lookup rows by stable `value`
- `rules/lookups.ts`: singular existence and selectability assertions
- `data/mutations.ts`: current-state checks and orchestration that combine persisted state with the resolved lookups

Rationale:
- This preserves the current contract that pure rules stay database-free.
- It prevents a combined lookup helper from silently owning cross-field business behavior.
- It keeps employees compatible with the current `clients_v2` layering while still acknowledging employee-specific complexity.

Alternatives considered:
- Merge cross-field employee rules into the lookup helper layer. Rejected because it blurs pure validation and persisted lookup checks.
- Move all lookup assertions into `data/mutations.ts`. Rejected because clients already demonstrates that focused lookup assertions are a useful feature-local boundary.

### Decision: Prefer direct module imports over slice-specific convenience barrels for internal equivalence

Where employees still relies on convenience exports that `clients_v2` does not, such as importing cache constants through `constants/index.ts`, the refactor should prefer the more explicit `clients_v2` style unless there is a strong local reason not to.

Rationale:
- Equivalent internals should look equivalent.
- Direct imports make cross-slice comparisons less noisy.
- This reduces cases where two slices perform the same job through different entrypoints.

Alternatives considered:
- Add more convenience barrels to clients for symmetry. Rejected because it moves the reference slice away from the current documented pattern.

## Risks / Trade-offs

- [Naming scope grows beyond the lookup boundary] -> Mitigation: limit the refactor to equivalent responsibilities already present in both slices and explicitly defer unrelated naming cleanup.
- [Behavior regressions are hidden behind a "rename-only" framing] -> Mitigation: preserve the current employee and client acceptance criteria in specs and keep lookup-selectability semantics explicit in the change tasks.
- [Employees still needs one aggregate step during persistence orchestration] -> Mitigation: allow orchestration in `data/mutations.ts`, but keep lookup resolution and lookup assertions singular and separately named.
- [Client spec drift becomes visible while aligning names] -> Mitigation: update only the capability contracts directly touched by the new house rule and avoid opportunistic spec rewrites outside this change.

## Migration Plan

1. Update the OpenSpec contract for entity-foundation, form-validation boundaries, and employee-management so the full alignment goal is explicit before implementation starts.
2. Align employee equivalent responsibilities with `clients_v2`, starting with the most visible internal mismatches such as lookup data helpers, assertion names, and internal import style.
3. Adjust employee write orchestration and dependent form/query modules to consume the aligned responsibilities while preserving behavior.
4. Sync `clients_v2` names only if the final chosen shared term differs from the current reference wording.
5. Run focused employee and client tests around schema parsing, lookup validation, and write flows.

Rollback strategy:
- Revert the change as one slice-alignment unit. Because the behavior is intended to remain the same, rollback should restore the prior helper names and imports without data migration.

## Open Questions

- None. The current repository contract and the local `clients_v2` reference give a clear default direction, and the remaining choice is only whether implementation proves a better shared term than the current client naming.
